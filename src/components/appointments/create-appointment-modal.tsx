"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAppointmentSchema } from "@/lib/validation";
import { X } from "lucide-react";

interface Patient {
  id: number;
  email: string;
}

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultPatientId?: number;
}

interface FormData {
  patientId: number;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  notes?: string;
}

export function CreateAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  defaultPatientId,
}: CreateAppointmentModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(createAppointmentSchema) as any,
    defaultValues: {
      durationMinutes: 60,
      patientId: defaultPatientId,
    },
  });

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
      if (defaultPatientId) {
        setValue("patientId", defaultPatientId);
      }
    }
  }, [isOpen, defaultPatientId]);

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/professional/patients");
      if (!response.ok) throw new Error();
      const data = await response.json();
      setPatients(data.patients || []);
    } catch {
      setError("Falha ao carregar pacientes");
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/professional/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao criar consulta");
      }
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F3F4F6]">
          <div>
            <p className="text-[16px] font-bold text-[#111827]">Agendar consulta</p>
            <p className="text-[13px] text-[#6B7280] mt-0.5">
              Preencha os dados da nova consulta.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#9CA3AF] hover:text-[#374151] rounded-[8px] hover:bg-[#F3F4F6] transition-colors duration-100"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-3 py-2.5 text-[13px] font-semibold text-[#DC2626]">
                {error}
              </div>
            )}

            {/* Patient */}
            <div>
              <label htmlFor="patientId" className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                Paciente
              </label>
              <select
                id="patientId"
                {...register("patientId", { valueAsNumber: true })}
                disabled={!!defaultPatientId}
                className="w-full px-3 py-2.5 text-[14px] text-[#111827] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] focus:outline-none focus:border-[#2E8B5A] focus:ring-[3px] focus:ring-[rgba(46,139,90,0.16)] focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Selecione um paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.email}
                  </option>
                ))}
              </select>
              {errors.patientId && (
                <p className="text-[#DC2626] text-[12px] mt-1">{errors.patientId.message}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label htmlFor="appointmentDate" className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                Data
              </label>
              <input
                type="date"
                id="appointmentDate"
                min={today}
                {...register("appointmentDate")}
                className="w-full px-3 py-2.5 text-[14px] text-[#111827] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] focus:outline-none focus:border-[#2E8B5A] focus:ring-[3px] focus:ring-[rgba(46,139,90,0.16)] focus:bg-white transition-all"
              />
              {errors.appointmentDate && (
                <p className="text-[#DC2626] text-[12px] mt-1">{errors.appointmentDate.message}</p>
              )}
            </div>

            {/* Time */}
            <div>
              <label htmlFor="appointmentTime" className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                Horário
              </label>
              <input
                type="time"
                id="appointmentTime"
                {...register("appointmentTime")}
                className="w-full px-3 py-2.5 text-[14px] text-[#111827] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] focus:outline-none focus:border-[#2E8B5A] focus:ring-[3px] focus:ring-[rgba(46,139,90,0.16)] focus:bg-white transition-all"
              />
              {errors.appointmentTime && (
                <p className="text-[#DC2626] text-[12px] mt-1">{errors.appointmentTime.message}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="durationMinutes" className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                Duração (minutos)
              </label>
              <input
                type="number"
                id="durationMinutes"
                {...register("durationMinutes", { valueAsNumber: true })}
                className="w-full px-3 py-2.5 text-[14px] text-[#111827] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] focus:outline-none focus:border-[#2E8B5A] focus:ring-[3px] focus:ring-[rgba(46,139,90,0.16)] focus:bg-white transition-all"
              />
              {errors.durationMinutes && (
                <p className="text-[#DC2626] text-[12px] mt-1">{errors.durationMinutes.message}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                Observações <span className="text-[#9CA3AF] font-normal">(opcional)</span>
              </label>
              <textarea
                id="notes"
                rows={3}
                {...register("notes")}
                placeholder="Adicione observações adicionais…"
                className="w-full px-3 py-2.5 text-[14px] text-[#111827] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] focus:outline-none focus:border-[#2E8B5A] focus:ring-[3px] focus:ring-[rgba(46,139,90,0.16)] focus:bg-white resize-none transition-all"
              />
              {errors.notes && (
                <p className="text-[#DC2626] text-[12px] mt-1">{errors.notes.message}</p>
              )}
            </div>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-11 flex items-center justify-center text-[14px] font-semibold text-[#374151] bg-white border border-[#E5E7EB] rounded-[10px] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-all duration-150 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 flex items-center justify-center gap-2 text-[14px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] hover:bg-[#277A4F] transition-colors duration-150 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Agendando…
                </>
              ) : (
                "Agendar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

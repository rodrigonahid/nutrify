"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { progressSchema } from "@/lib/validation";
import { ProgressFormFields } from "@/components/progress-form-fields";
import { Progress } from "@/types";

type ProgressFormData = z.infer<typeof progressSchema>;

function fmt(val: number | undefined | null, decimals = 1): string {
  if (val == null) return "—";
  return Number.isInteger(val) ? String(val) : val.toFixed(decimals);
}

function Delta({ current, prev }: { current: number | null | undefined; prev: number | null }) {
  if (current == null || prev == null) return null;
  const d = +(current - prev).toFixed(2);
  if (d === 0) return null;
  return (
    <span className={`text-[11px] font-medium ml-1 ${d < 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
      {d > 0 ? `+${d}` : d}
    </span>
  );
}

export default function CreateProgressPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [updatePatientProfile, setUpdatePatientProfile] = useState(true);
  const [lastProgress, setLastProgress] = useState<Progress | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
  });

  useEffect(() => {
    async function init() {
      try {
        const [patientRes, progressRes] = await Promise.all([
          fetch(`/api/professional/patients/${patientId}`),
          fetch(`/api/professional/patients/${patientId}/progress`),
        ]);

        const defaults: Partial<ProgressFormData> = {};

        if (patientRes.ok) {
          const { patient } = await patientRes.json();
          if (patient.height) defaults.height = parseFloat(patient.height);
          if (patient.weight) defaults.totalWeight = parseFloat(patient.weight);
        }

        if (progressRes.ok) {
          const { progress } = await progressRes.json();
          if (progress?.length > 0) setLastProgress(progress[0]);
        }

        reset(defaults);
      } catch {
        // Leave form empty if fetch fails — not a blocking error
      } finally {
        setInitializing(false);
      }
    }

    init();
  }, [patientId, reset]);

  async function onSubmit(data: ProgressFormData) {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(
        `/api/professional/patients/${patientId}/progress`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, updatePatientProfile }),
        }
      );

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Falha ao criar registro de progresso");
      }

      router.push(`/professional/patients/${patientId}/progress`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar registro de progresso");
    } finally {
      setSubmitting(false);
    }
  }

  // Overview panel — derived from live form values
  const formValues = watch();

  const weight = formValues.totalWeight ?? null;
  const heightCm = formValues.height ?? null;
  const bmiCalc = weight && heightCm ? +(weight / ((heightCm / 100) ** 2)).toFixed(1) : null;
  const bmiDisplay = formValues.bmi ?? bmiCalc;
  const bodyFat = formValues.bodyFatPercentage ?? null;
  const waist = formValues.perimeterWaist ?? null;
  const hip = formValues.perimeterHip ?? null;
  const waistHipRatio = waist && hip ? +(waist / hip).toFixed(2) : null;

  const prevWeight = lastProgress?.totalWeight ? parseFloat(lastProgress.totalWeight) : null;
  const prevHeight = lastProgress?.height ? parseFloat(lastProgress.height) : null;
  const prevBmi = lastProgress?.bmi ? parseFloat(lastProgress.bmi) : null;
  const prevBodyFat = lastProgress?.bodyFatPercentage ? parseFloat(lastProgress.bodyFatPercentage) : null;
  const prevWaist = lastProgress?.perimeterWaist ? parseFloat(lastProgress.perimeterWaist) : null;
  const prevHip = lastProgress?.perimeterHip ? parseFloat(lastProgress.perimeterHip) : null;
  const prevWaistHip = prevWaist && prevHip ? +(prevWaist / prevHip).toFixed(2) : null;

  const overviewRows: { label: string; current: number | null; prev: number | null; unit?: string }[] = [
    { label: "Peso", current: weight, prev: prevWeight, unit: " kg" },
    { label: "Altura", current: heightCm, prev: prevHeight, unit: " cm" },
    { label: "IMC", current: bmiDisplay, prev: prevBmi },
    { label: "Gordura corporal", current: bodyFat, prev: prevBodyFat, unit: "%" },
    { label: "Cintura", current: waist, prev: prevWaist, unit: " cm" },
    { label: "Quadril", current: hip, prev: prevHip, unit: " cm" },
    { label: "Rel. Cintura/Quadril", current: waistHipRatio, prev: prevWaistHip },
  ];

  const hasAnyData = overviewRows.some((r) => r.current != null);

  return (
    <div className="p-4 md:p-6 max-w-[1080px]">

      {/* Back link */}
      <Link
        href={`/professional/patients/${patientId}/progress`}
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-5"
      >
        ← Voltar ao progresso
      </Link>

      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-1">
          Adicionar Registro de Progresso
        </h1>
        <p className="text-sm font-medium text-[#6B7280]">
          Todas as medidas são opcionais — preencha o que foi medido hoje.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {initializing ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden animate-pulse">
              <div className="px-4 py-3 border-b border-[#F3F4F6]">
                <div className="h-4 w-40 bg-[#F3F4F6] rounded" />
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-1.5">
                    <div className="h-3 w-24 bg-[#F3F4F6] rounded" />
                    <div className="h-10 bg-[#F3F4F6] rounded-[10px]" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

          {/* Left: form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

            <ProgressFormFields
              register={register}
              errors={errors}
              disabled={submitting}
              previousProgress={lastProgress}
              watch={watch}
            />

            {/* Update patient profile toggle */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3.5 mt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={updatePatientProfile}
                  onChange={(e) => setUpdatePatientProfile(e.target.checked)}
                  disabled={submitting}
                  className="mt-0.5 h-4 w-4 rounded border-[#D1D5DB] text-[#2E8B5A] focus:ring-[#2E8B5A] disabled:opacity-50 cursor-pointer"
                />
                <div>
                  <p className="text-[14px] font-semibold text-[#111827]">
                    Atualizar perfil do paciente
                  </p>
                  <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                    Altura e peso inseridos acima também serão atualizados no perfil do paciente
                  </p>
                </div>
              </label>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-1">
              <Link
                href={`/professional/patients/${patientId}/progress`}
                className="flex-1 h-11 flex items-center justify-center text-[14px] font-semibold text-[#374151] bg-white border border-[#E5E7EB] rounded-[10px] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-all duration-150"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 h-11 flex items-center justify-center gap-2 text-[14px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] hover:bg-[#277A4F] transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Salvando…
                  </>
                ) : (
                  "Salvar registro"
                )}
              </button>
            </div>

          </form>

          {/* Right: sticky overview panel */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-[#F3F4F6]">
                <p className="text-[14px] font-semibold text-[#111827]">Resumo</p>
                <p className="text-[12px] text-[#9CA3AF] mt-0.5">Atualiza conforme você preenche</p>
              </div>

              {!hasAnyData ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-[13px] text-[#9CA3AF]">Preencha os campos ao lado para ver o resumo aqui.</p>
                </div>
              ) : (
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[#F3F4F6]">
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Parâmetro</th>
                      <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Atual</th>
                      <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Anterior</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overviewRows.map((row) => {
                      if (row.current == null && row.prev == null) return null;
                      return (
                        <tr key={row.label} className="border-b border-[#F9FAFB] last:border-0">
                          <td className="px-4 py-2.5 text-[#374151] text-[12.5px]">{row.label}</td>
                          <td className="px-3 py-2.5 text-right">
                            {row.current != null ? (
                              <span className="font-semibold text-[#111827]">
                                {fmt(row.current)}{row.unit ?? ""}
                              </span>
                            ) : (
                              <span className="text-[#D1D5DB]">—</span>
                            )}
                            <Delta current={row.current} prev={row.prev} />
                          </td>
                          <td className="px-4 py-2.5 text-right text-[#9CA3AF] text-[12px]">
                            {row.prev != null ? `${fmt(row.prev)}${row.unit ?? ""}` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

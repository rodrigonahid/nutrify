"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Calendar } from "lucide-react";

interface Appointment {
  id: number;
  patientId: number;
  patientEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  status: string;
  notes: string | null;
  cancellationReason: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmada",
  pending: "Pendente",
  requested: "Solicitada",
  cancelled: "Cancelada",
  completed: "Concluída",
};

function statusStyle(status: string) {
  switch (status) {
    case "confirmed":
      return "text-[#2E8B5A] bg-[rgba(46,139,90,0.08)]";
    case "pending":
      return "text-[#B45309] bg-[rgba(180,83,9,0.08)]";
    case "requested":
      return "text-[#1D4ED8] bg-[rgba(29,78,216,0.08)]";
    case "cancelled":
      return "text-[#DC2626] bg-[rgba(220,38,38,0.08)]";
    case "completed":
    default:
      return "text-[#6B7280] bg-[#F3F4F6]";
  }
}

function formatDate(dateString: string) {
  return new Date(dateString + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeString: string) {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const isPM = hour >= 12;
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${isPM ? "PM" : "AM"}`;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-40 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-24 bg-[#F3F4F6] rounded" />
      </div>
      <div className="h-5 w-16 bg-[#F3F4F6] rounded-full" />
    </div>
  );
}

function DateGroup({
  date,
  appointments,
  muted,
}: {
  date: string;
  appointments: Appointment[];
  muted: boolean;
}) {
  return (
    <div>
      <p
        className={`text-[13px] font-semibold mb-2 ${
          muted ? "text-[#9CA3AF]" : "text-[#374151]"
        }`}
      >
        {formatDate(date)}
      </p>
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="divide-y divide-[#F3F4F6]">
          {appointments
            .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
            .map((apt) => (
              <div
                key={apt.id}
                className="flex items-start gap-3 px-4 py-3.5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p
                      className={`text-[14px] font-semibold ${
                        muted ? "text-[#6B7280]" : "text-[#111827]"
                      }`}
                    >
                      {formatTime(apt.appointmentTime)}
                    </p>
                    <span className="text-[12px] text-[#9CA3AF]">
                      {apt.durationMinutes} min
                    </span>
                  </div>
                  {apt.notes && (
                    <p className="text-[12px] text-[#6B7280] mt-0.5">
                      {apt.notes}
                    </p>
                  )}
                  {apt.cancellationReason && (
                    <p className="text-[12px] text-[#DC2626] mt-0.5">
                      Cancelada: {apt.cancellationReason}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusStyle(
                    apt.status
                  )}`}
                >
                  {STATUS_LABELS[apt.status] ?? apt.status}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default function PatientAppointmentsPage() {
  const params = useParams();
  const patientId = params.patientId as string;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `/api/professional/appointments?patientId=${patientId}`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setAppointments(data.appointments ?? []);
      } catch {
        setError("Falha ao carregar consultas");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [patientId]);

  const today = new Date().toISOString().split("T")[0];

  const upcoming = appointments
    .filter((a) => a.appointmentDate >= today)
    .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate));

  const past = appointments
    .filter((a) => a.appointmentDate < today)
    .sort((a, b) => b.appointmentDate.localeCompare(a.appointmentDate));

  function groupByDate(apts: Appointment[]) {
    return apts.reduce((acc, apt) => {
      (acc[apt.appointmentDate] ??= []).push(apt);
      return acc;
    }, {} as Record<string, Appointment[]>);
  }

  const upcomingGroups = groupByDate(upcoming);
  const pastGroups = groupByDate(past);

  const upcomingDates = Object.keys(upcomingGroups).sort();
  const pastDates = Object.keys(pastGroups).sort().reverse();

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      {/* Back link */}
      <Link
        href={`/professional/patients/${patientId}`}
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Voltar ao paciente
      </Link>

      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
          Consultas
        </h1>
        {!loading && (
          <p className="text-sm font-medium text-[#6B7280]">
            {appointments.length === 0
              ? "Nenhuma consulta ainda"
              : `${upcoming.length} próxima${upcoming.length !== 1 ? "s" : ""} · ${past.length} anterior${past.length !== 1 ? "es" : ""}`}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div>
            <div className="h-3.5 w-48 bg-[#F3F4F6] rounded animate-pulse mb-2" />
            <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden divide-y divide-[#F3F4F6]">
              <SkeletonRow />
              <SkeletonRow />
            </div>
          </div>
          <div>
            <div className="h-3.5 w-40 bg-[#F3F4F6] rounded animate-pulse mb-2" />
            <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden divide-y divide-[#F3F4F6]">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          </div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center py-14 px-6 text-center">
          <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center mb-4">
            <Calendar size={22} className="text-[#9CA3AF]" />
          </div>
          <p className="text-[15px] font-semibold text-[#374151] mb-1">
            Nenhuma consulta ainda
          </p>
          <p className="text-[13px] text-[#9CA3AF]">
            Consultas com este paciente aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Upcoming */}
          {upcomingDates.length > 0 && (
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
                Próximas · {upcoming.length}
              </p>
              {upcomingDates.map((date) => (
                <DateGroup
                  key={date}
                  date={date}
                  appointments={upcomingGroups[date]}
                  muted={false}
                />
              ))}
            </div>
          )}

          {/* Past */}
          {pastDates.length > 0 && (
            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
                Anteriores · {past.length}
              </p>
              {pastDates.map((date) => (
                <DateGroup
                  key={date}
                  date={date}
                  appointments={pastGroups[date]}
                  muted
                />
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}

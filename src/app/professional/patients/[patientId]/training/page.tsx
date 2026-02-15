"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Dumbbell } from "lucide-react";

interface Session {
  id: number;
  date: string;
  muscleGroupName: string | null;
  exerciseCount: number;
  notes: string | null;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-32 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-20 bg-[#F3F4F6] rounded" />
      </div>
      <div className="h-3 w-16 bg-[#F3F4F6] rounded" />
    </div>
  );
}

export default function PatientTrainingPage() {
  const params = useParams();
  const patientId = params.patientId as string;

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/professional/patients/${patientId}/training/sessions`)
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []))
      .catch(() => setError("Falha ao carregar sessões"))
      .finally(() => setLoading(false));
  }, [patientId]);

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
          Sessões de Treino
        </h1>
        {!loading && (
          <p className="text-sm font-medium text-[#6B7280]">
            {sessions.length === 0
              ? "Nenhuma sessão ainda"
              : `${sessions.length} ${sessions.length !== 1 ? "sessões" : "sessão"}`}
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
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden divide-y divide-[#F3F4F6]">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center py-14 px-6 text-center">
          <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center mb-4">
            <Dumbbell size={22} className="text-[#9CA3AF]" />
          </div>
          <p className="text-[15px] font-semibold text-[#374151] mb-1">
            Nenhuma sessão de treino ainda
          </p>
          <p className="text-[13px] text-[#9CA3AF]">
            As sessões aparecerão aqui quando o paciente começar a registrar treinos.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="divide-y divide-[#F3F4F6]">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-start gap-3 px-4 py-3.5 hover:bg-[#F9FAFB] transition-colors duration-100"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-semibold text-[#111827]">
                      {formatDate(session.date)}
                    </p>
                    {session.muscleGroupName && (
                      <span className="text-[11px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] px-2 py-0.5 rounded-full">
                        {session.muscleGroupName}
                      </span>
                    )}
                  </div>
                  {session.notes && (
                    <p className="text-[12px] text-[#6B7280] line-clamp-1">
                      {session.notes}
                    </p>
                  )}
                </div>
                <p className="shrink-0 text-[13px] text-[#9CA3AF]">
                  {session.exerciseCount} exercício{session.exerciseCount !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

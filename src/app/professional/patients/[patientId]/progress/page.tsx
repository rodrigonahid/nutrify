"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, TrendingUp, Plus } from "lucide-react";
import { Progress } from "@/types";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-28 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-48 bg-[#F3F4F6] rounded" />
      </div>
      <div className="h-3 w-10 bg-[#F3F4F6] rounded" />
    </div>
  );
}

export default function PatientProgressPage() {
  const params = useParams();
  const patientId = params.patientId as string;

  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/professional/patients/${patientId}/progress`)
      .then((r) => r.json())
      .then((data) => setProgress(data.progress ?? []))
      .catch(() => setError("Falha ao carregar progresso"))
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
            Progresso
          </h1>
          {!loading && (
            <p className="text-sm font-medium text-[#6B7280]">
              {progress.length === 0
                ? "Nenhum registro ainda"
                : `${progress.length} registro${progress.length !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>
        <Link
          href={`/professional/patients/${patientId}/progress/create`}
          className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#2E8B5A] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#277A4F] transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)]"
        >
          <Plus size={13} strokeWidth={2.5} />
          Adicionar registro
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {/* Progress list */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">

        {loading && (
          <div className="divide-y divide-[#F3F4F6]">
            {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {!loading && progress.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center mb-4">
              <TrendingUp size={22} className="text-[#9CA3AF]" />
            </div>
            <p className="text-[15px] font-semibold text-[#374151] mb-1">
              Nenhum registro de progresso ainda
            </p>
            <p className="text-[13px] text-[#9CA3AF] mb-5">
              Adicione o primeiro registro para começar a acompanhar o progresso deste paciente.
            </p>
            <Link
              href={`/professional/patients/${patientId}/progress/create`}
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#2E8B5A] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#277A4F] transition-colors duration-150"
            >
              <Plus size={13} strokeWidth={2.5} />
              Adicionar primeiro registro
            </Link>
          </div>
        )}

        {!loading && progress.length > 0 && (
          <div className="divide-y divide-[#F3F4F6]">
            {progress.map((entry) => (
              <Link
                key={entry.id}
                href={`/professional/patients/${patientId}/progress/${entry.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#F9FAFB] transition-colors duration-100 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#111827]">
                    {formatDate(entry.createdAt)}
                  </p>
                  <div className="flex flex-wrap gap-x-3 mt-0.5">
                    {entry.totalWeight && (
                      <span className="text-[12px] text-[#9CA3AF]">{entry.totalWeight} kg</span>
                    )}
                    {entry.bmi && (
                      <span className="text-[12px] text-[#9CA3AF]">IMC {entry.bmi}</span>
                    )}
                    {entry.bodyFatPercentage && (
                      <span className="text-[12px] text-[#9CA3AF]">{entry.bodyFatPercentage}% gordura</span>
                    )}
                    {entry.perimeterWaist && (
                      <span className="text-[12px] text-[#9CA3AF]">cintura {entry.perimeterWaist} cm</span>
                    )}
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  strokeWidth={2}
                  className="text-[#D1D5DB] group-hover:text-[#9CA3AF] transition-colors duration-100 shrink-0"
                />
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

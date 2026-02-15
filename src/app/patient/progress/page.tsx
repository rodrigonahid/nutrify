"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { DeltaIndicator } from "@/components/delta-indicator";
import { Progress } from "@/types/progress";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-36 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-56 bg-[#F3F4F6] rounded" />
      </div>
    </div>
  );
}

export default function PatientProgressListPage() {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/patient/progress")
      .then((r) => r.json())
      .then((d) => setProgress(d.progress ?? []))
      .catch(() => setError("Falha ao carregar dados de progresso"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      <Link
        href="/patient"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Voltar ao painel
      </Link>

      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
          Histórico de Progresso
        </h1>
        {!loading && (
          <p className="text-sm font-medium text-[#6B7280]">
            {progress.length === 0
              ? "Nenhum registro ainda"
              : `${progress.length} registro${progress.length !== 1 ? "s" : ""}`}
          </p>
        )}
      </div>

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
      ) : progress.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center py-14 px-6 text-center">
          <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center mb-4">
            <TrendingUp size={22} className="text-[#9CA3AF]" />
          </div>
          <p className="text-[15px] font-semibold text-[#374151] mb-1">Nenhum registro ainda</p>
          <p className="text-[13px] text-[#9CA3AF]">
            Seu nutricionista adicionará seu primeiro registro de progresso em breve.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="divide-y divide-[#F3F4F6]">
            {progress.map((entry, index) => {
              const prev = progress[index + 1];
              return (
                <Link
                  key={entry.id}
                  href={`/patient/progress/${entry.id}`}
                  className="flex items-start gap-3 px-4 py-3.5 hover:bg-[#F9FAFB] transition-colors duration-100 block"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#111827] mb-1">
                      {formatDate(entry.createdAt)}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {entry.totalWeight && (
                        <div className="flex items-center gap-1">
                          <span className="text-[12px] text-[#6B7280]">{entry.totalWeight} kg</span>
                          <DeltaIndicator current={entry.totalWeight} previous={prev?.totalWeight || null} unit="kg" />
                        </div>
                      )}
                      {entry.bmi && (
                        <div className="flex items-center gap-1">
                          <span className="text-[12px] text-[#6B7280]">IMC {entry.bmi}</span>
                          <DeltaIndicator current={entry.bmi} previous={prev?.bmi || null} unit="" />
                        </div>
                      )}
                      {entry.bodyFatPercentage && (
                        <div className="flex items-center gap-1">
                          <span className="text-[12px] text-[#6B7280]">{entry.bodyFatPercentage}% gordura</span>
                          <DeltaIndicator current={entry.bodyFatPercentage} previous={prev?.bodyFatPercentage || null} unit="%" />
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-[12px] font-semibold text-[#2E8B5A] mt-0.5">→</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

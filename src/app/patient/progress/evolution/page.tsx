"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Progress } from "@/types/progress";
import { ProgressEvolutionTable } from "@/components/progress-evolution-table";

export default function PatientProgressEvolutionPage() {
  const [allEntries, setAllEntries] = useState<Progress[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/patient/progress")
      .then((r) => r.json())
      .then((d) => {
        const entries: Progress[] = d.progress ?? [];
        setAllEntries(entries);
        // Default: last 2 entries (index 0 = newest)
        setSelectedIds(entries.slice(0, 2).map((e) => e.id));
      })
      .catch(() => setError("Falha ao carregar dados de progresso"))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (id: number) => setSelectedIds((prev) => [...prev, id]);
  const handleRemove = (id: number) => setSelectedIds((prev) => prev.filter((x) => x !== id));
  const handleSwap = (oldId: number, newId: number) => setSelectedIds((prev) => prev.map((x) => x === oldId ? newId : x));

  return (
    <div className="p-4 md:p-6 w-full">
      <Link
        href="/patient/progress"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Voltar ao histórico
      </Link>

      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
          Evolução
        </h1>
        <p className="text-sm font-medium text-[#6B7280]">
          Comparativo entre avaliações
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white border border-[#E5E7EB] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : allEntries.length < 2 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-5 py-10 text-center">
          <p className="text-[14px] font-semibold text-[#374151] mb-1">Registros insuficientes</p>
          <p className="text-[13px] text-[#9CA3AF]">Você precisa de pelo menos 2 registros para comparar.</p>
        </div>
      ) : (
        <ProgressEvolutionTable
          allEntries={allEntries}
          selectedIds={selectedIds}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onSwap={handleSwap}
        />
      )}
    </div>
  );
}

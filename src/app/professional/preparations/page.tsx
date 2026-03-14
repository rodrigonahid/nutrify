"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChefHat, Plus, Trash2, Search } from "lucide-react";
import { PreparationListItem } from "@/types";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function CategoryBadge({ category }: { category: "food" | "preparation" }) {
  return category === "food" ? (
    <span className="text-[11px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
      Alimento
    </span>
  ) : (
    <span className="text-[11px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] px-2 py-0.5 rounded-full">
      Preparação
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-48 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-32 bg-[#F3F4F6] rounded" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-[#F3F4F6] rounded-full" />
        <div className="h-7 w-14 bg-[#F3F4F6] rounded-[6px]" />
        <div className="h-7 w-7 bg-[#F3F4F6] rounded-[6px]" />
      </div>
    </div>
  );
}

export default function PreparationsPage() {
  const [preparations, setPreparations] = useState<PreparationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [search, setSearch] = useState("");

  const fetchPreparations = useCallback(async () => {
    try {
      const res = await fetch("/api/professional/preparations");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPreparations(data.preparations ?? []);
    } catch {
      setError("Falha ao carregar preparações");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreparations();
  }, [fetchPreparations]);

  async function deletePreparation(id: number) {
    if (!confirm("Excluir esta preparação? Esta ação não pode ser desfeita.")) return;
    setActionError("");
    try {
      const res = await fetch(`/api/professional/preparations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      await fetchPreparations();
    } catch {
      setActionError("Falha ao excluir preparação");
    }
  }

  const filtered = preparations.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      {/* Page heading */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
            Biblioteca de Preparações
          </h1>
          {!loading && (
            <p className="text-sm font-medium text-[#6B7280]">
              {preparations.length === 0
                ? "Nenhuma preparação ainda"
                : `${preparations.length} preparaç${preparations.length !== 1 ? "ões" : "ão"}`}
            </p>
          )}
        </div>
        <Link
          href="/professional/preparations/create"
          className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#2E8B5A] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#277A4F] transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)]"
        >
          <Plus size={13} strokeWidth={2.5} />
          Nova preparação
        </Link>
      </div>

      {/* Search */}
      {(loading || preparations.length > 0) && (
        <div className="relative mb-4">
          <span className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
            <Search size={15} strokeWidth={2} />
          </span>
          <input
            type="search"
            placeholder="Buscar preparação…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-[38px] pr-3 bg-white border border-[#E5E7EB] rounded-[10px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all duration-150 hover:border-[#D1D5DB] focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.12)]"
          />
        </div>
      )}

      {/* Errors */}
      {(error || actionError) && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error || actionError}
        </div>
      )}

      {/* List */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">

        {loading && (
          <div className="divide-y divide-[#F3F4F6]">
            {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {!loading && preparations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center mb-4">
              <ChefHat size={22} className="text-[#9CA3AF]" />
            </div>
            <p className="text-[15px] font-semibold text-[#374151] mb-1">
              Nenhuma preparação ainda
            </p>
            <p className="text-[13px] text-[#9CA3AF] mb-5">
              Crie templates de alimentos e preparações para reutilizar em planos alimentares.
            </p>
            <Link
              href="/professional/preparations/create"
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#2E8B5A] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#277A4F] transition-colors duration-150"
            >
              <Plus size={13} strokeWidth={2.5} />
              Criar primeira preparação
            </Link>
          </div>
        )}

        {!loading && preparations.length > 0 && filtered.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-[14px] font-medium text-[#9CA3AF]">
              Nenhuma preparação encontrada para &quot;{search}&quot;
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="divide-y divide-[#F3F4F6]">
            {filtered.map((prep) => (
              <div
                key={prep.id}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#F9FAFB] transition-colors duration-100"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-semibold text-[#111827] truncate">
                      {prep.name}
                    </p>
                    <CategoryBadge category={prep.category} />
                  </div>
                  <p className="text-[12px] text-[#9CA3AF]">
                    {formatDate(prep.createdAt)} · {prep.ingredientCount}{" "}
                    {prep.ingredientCount !== 1 ? "ingredientes" : "ingrediente"}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={`/professional/preparations/${prep.id}`}
                    className="h-7 px-2.5 flex items-center text-[12px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] rounded-[6px] hover:bg-[rgba(46,139,90,0.14)] transition-colors duration-100"
                  >
                    Editar →
                  </Link>
                  <button
                    onClick={() => deletePreparation(prep.id)}
                    className="h-7 w-7 flex items-center justify-center text-[#9CA3AF] hover:text-[#DC2626] rounded-[6px] transition-colors duration-100"
                    aria-label="Excluir preparação"
                  >
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

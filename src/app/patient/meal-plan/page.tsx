"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { MealPlanListItem } from "@/types";

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
        <div className="h-3.5 w-48 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-32 bg-[#F3F4F6] rounded" />
      </div>
      <div className="h-5 w-12 bg-[#F3F4F6] rounded-full" />
    </div>
  );
}

export default function PatientMealPlanListPage() {
  const [mealPlans, setMealPlans] = useState<MealPlanListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/patient/meal-plan")
      .then((r) => r.json())
      .then((d) => setMealPlans(d.mealPlans ?? []))
      .catch(() => setError("Falha ao carregar planos alimentares"))
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
          Planos Alimentares
        </h1>
        {!loading && (
          <p className="text-sm font-medium text-[#6B7280]">
            {mealPlans.length === 0
              ? "Nenhum plano ainda"
              : `${mealPlans.length} plano${mealPlans.length !== 1 ? "s" : ""}`}
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
      ) : mealPlans.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center py-14 px-6 text-center">
          <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center mb-4">
            <UtensilsCrossed size={22} className="text-[#9CA3AF]" />
          </div>
          <p className="text-[15px] font-semibold text-[#374151] mb-1">Nenhum plano alimentar ainda</p>
          <p className="text-[13px] text-[#9CA3AF]">
            Seu nutricionista criará um para você em breve.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="divide-y divide-[#F3F4F6]">
            {mealPlans.map((plan) => (
              <Link
                key={plan.id}
                href={`/patient/meal-plan/${plan.id}`}
                className="flex items-start gap-3 px-4 py-3.5 hover:bg-[#F9FAFB] transition-colors duration-100 block"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-semibold text-[#111827] truncate">{plan.name}</p>
                    {plan.isActive && (
                      <span className="shrink-0 text-[11px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] px-2 py-0.5 rounded-full">
                        Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#9CA3AF]">
                    {formatDate(plan.createdAt)} · {plan.mealCount} {plan.mealCount !== 1 ? "refeições" : "refeição"}
                  </p>
                </div>
                <span className="shrink-0 text-[12px] font-semibold text-[#2E8B5A] mt-0.5">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Nutritionist, PatientPlan } from "@/types";
import { getPaymentSchedule, PaymentEntry } from "@/lib/payment-schedule";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPrice(price: string, currency: string) {
  const num = parseFloat(price);
  if (currency === "BRL") {
    return `R$ ${num.toFixed(2).replace(".", ",")}`;
  }
  return `${currency} ${num.toFixed(2)}`;
}

const CYCLE_LABELS: Record<string, string> = {
  monthly: "mensal",
  quarterly: "trimestral",
  annual: "anual",
  custom: "personalizado",
};

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  active: {
    label: "Ativo",
    className: "text-[#2E8B5A] bg-[rgba(46,139,90,0.08)]",
  },
  paused: {
    label: "Pausado",
    className: "text-[#854D0E] bg-[#FEF9C3]",
  },
  cancelled: {
    label: "Cancelado",
    className: "text-[#DC2626] bg-[#FEF2F2]",
  },
};

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#F3F4F6] last:border-0 animate-pulse">
      <div className="h-3.5 w-24 bg-[#F3F4F6] rounded" />
      <div className="h-3.5 w-36 bg-[#F3F4F6] rounded ml-auto" />
    </div>
  );
}

function PaymentScheduleList({ plan }: { plan: PatientPlan }) {
  const entries: PaymentEntry[] = getPaymentSchedule(plan);
  const paid = entries.filter((e) => e.status === "paid");
  const overdue = entries.filter((e) => e.status === "overdue");
  const upcoming = entries.filter((e) => e.status === "upcoming");

  const MAX_PAID = 6;
  const collapsedCount = Math.max(0, paid.length - MAX_PAID);
  const visiblePaid = paid.slice(collapsedCount);

  if (entries.length === 0) {
    return (
      <p className="text-[13px] text-[#9CA3AF] py-1">Nenhum pagamento agendado.</p>
    );
  }

  return (
    <div className="space-y-1">
      {collapsedCount > 0 && (
        <p className="text-[12px] text-[#9CA3AF] py-1">
          + {collapsedCount} pagamento{collapsedCount !== 1 ? "s" : ""} anterior{collapsedCount !== 1 ? "es" : ""} realizado{collapsedCount !== 1 ? "s" : ""}
        </p>
      )}
      {visiblePaid.map((entry) => (
        <div key={entry.date} className="flex items-center gap-2.5 py-1.5">
          <div className="w-5 h-5 rounded-full bg-[rgba(46,139,90,0.08)] flex items-center justify-center shrink-0">
            <span className="text-[9px] font-black text-[#2E8B5A]">✓</span>
          </div>
          <span className="text-[13px] font-medium text-[#2E8B5A]">{formatDate(entry.date)}</span>
        </div>
      ))}
      {overdue.map((entry) => (
        <div key={entry.date} className="flex items-center gap-2.5 py-1.5">
          <div className="w-5 h-5 rounded-full bg-[#FEF2F2] flex items-center justify-center shrink-0">
            <span className="text-[9px] font-black text-[#DC2626]">!</span>
          </div>
          <span className="text-[13px] font-medium text-[#DC2626]">{formatDate(entry.date)}</span>
          <span className="ml-auto text-[11px] font-semibold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded-full">Atrasado</span>
        </div>
      ))}
      {upcoming.map((entry) => (
        <div key={entry.date} className="flex items-center gap-2.5 py-1.5">
          <div className="w-5 h-5 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0">
            <span className="text-[9px] font-black text-[#6B7280]">→</span>
          </div>
          <span className="text-[13px] font-medium text-[#6B7280]">{formatDate(entry.date)}</span>
          <span className="ml-auto text-[11px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">Próximo</span>
        </div>
      ))}
    </div>
  );
}

export default function PatientNutritionistPage() {
  const [nutritionist, setNutritionist] = useState<Nutritionist | null>(null);
  const [plan, setPlan] = useState<PatientPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [nutritionistRes, planRes] = await Promise.all([
          fetch("/api/patient/nutritionist"),
          fetch("/api/patient/nutritionist/plan"),
        ]);

        if (!nutritionistRes.ok) throw new Error("Falha ao carregar nutricionista");

        const [nutritionistData, planData] = await Promise.all([
          nutritionistRes.json(),
          planRes.ok ? planRes.json() : { plan: null },
        ]);

        setNutritionist(nutritionistData.nutritionist);
        setPlan(planData.plan ?? null);
      } catch {
        setError("Falha ao carregar dados. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const displayName = nutritionist?.name ?? nutritionist?.email ?? "Nutritionist";
  const initial = displayName[0]?.toUpperCase() ?? "N";
  const statusStyle = plan ? (STATUS_STYLES[plan.status] ?? STATUS_STYLES.active) : null;

  return (
    <div className="p-4 md:p-8 max-w-[600px]">

      {/* Back link */}
      <Link
        href="/patient"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Painel
      </Link>

      <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-6">
        Meu Nutricionista
      </h1>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {/* Section 1 — Nutritionist Info */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-[#F3F4F6]">
          <p className="text-[14px] font-semibold text-[#111827]">Informações do Nutricionista</p>
        </div>

        {loading ? (
          <div className="px-4 py-4">
            <div className="flex items-center gap-3 mb-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-[#F3F4F6] shrink-0" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-[#F3F4F6] rounded" />
                <div className="h-3 w-48 bg-[#F3F4F6] rounded" />
              </div>
            </div>
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : nutritionist ? (
          <div className="px-4 py-4">
            {/* Avatar + name/email */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-[rgba(46,139,90,0.10)] flex items-center justify-center shrink-0">
                <span className="text-[18px] font-bold text-[#2E8B5A] uppercase">{initial}</span>
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#111827] leading-tight">
                  {displayName}
                </p>
                {nutritionist.name && (
                  <p className="text-[13px] text-[#9CA3AF]">{nutritionist.email}</p>
                )}
              </div>
            </div>

            <div className="divide-y divide-[#F3F4F6]">
              {nutritionist.phone && (
                <div className="flex items-start justify-between py-2.5">
                  <span className="text-[13px] text-[#6B7280]">Telefone</span>
                  <span className="text-[13px] font-medium text-[#111827] text-right ml-4">{nutritionist.phone}</span>
                </div>
              )}
              {nutritionist.specialization && (
                <div className="flex items-start justify-between py-2.5">
                  <span className="text-[13px] text-[#6B7280]">Especialização</span>
                  <span className="text-[12px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] px-2.5 py-0.5 rounded-full ml-4">
                    {nutritionist.specialization}
                  </span>
                </div>
              )}
              {nutritionist.professionalLicense && (
                <div className="flex items-start justify-between py-2.5">
                  <span className="text-[13px] text-[#6B7280]">CRN</span>
                  <span className="text-[13px] font-medium text-[#111827] text-right ml-4">{nutritionist.professionalLicense}</span>
                </div>
              )}
              {nutritionist.bio && (
                <div className="py-2.5">
                  <span className="text-[13px] text-[#6B7280] block mb-1.5">Sobre</span>
                  <p className="text-[13px] text-[#374151] leading-relaxed">{nutritionist.bio}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Section 2 — My Plan */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#F3F4F6]">
          <p className="text-[14px] font-semibold text-[#111827]">Meu Plano</p>
        </div>

        {loading ? (
          <div className="px-4 py-4 animate-pulse">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : plan ? (
          <div className="px-4 py-4">
            <div className="divide-y divide-[#F3F4F6]">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-[#6B7280]">Status</span>
                {statusStyle && (
                  <span className={`text-[12px] font-semibold px-2.5 py-0.5 rounded-full ${statusStyle.className}`}>
                    {statusStyle.label}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-[#6B7280]">Valor</span>
                <span className="text-[13px] font-medium text-[#111827]">
                  {formatPrice(plan.price, plan.currency)} / {CYCLE_LABELS[plan.billingCycle] ?? plan.billingCycle}
                </span>
              </div>
              <div className="py-3">
                <span className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-wide block mb-2">Histórico de pagamentos</span>
                <PaymentScheduleList plan={plan} />
              </div>
              {plan.notes && (
                <div className="py-2.5">
                  <span className="text-[13px] text-[#6B7280] block mb-1.5">Observações</span>
                  <p className="text-[13px] text-[#374151] leading-relaxed">{plan.notes}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-[13px] text-[#9CA3AF]">
              Nenhum plano atribuído ainda. Entre em contato com seu nutricionista.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

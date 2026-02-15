"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PatientPlan } from "@/types";
import { getPaymentSchedule, PaymentEntry } from "@/lib/payment-schedule";

function formatEntryDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function PaymentScheduleList({
  startDate,
  billingCycle,
  lastPaymentDate,
  onToggle,
}: {
  startDate: string;
  billingCycle: string;
  lastPaymentDate: string;
  onToggle?: (newLastPaymentDate: string | null) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);
  const entries: PaymentEntry[] = getPaymentSchedule({
    startDate,
    billingCycle,
    lastPaymentDate: lastPaymentDate || null,
  });

  const paidCount = entries.filter((e) => e.status === "paid").length;
  const collapsedCount = Math.max(0, paidCount - 6);
  const visibleEntries = entries.slice(collapsedCount);

  async function handleEntryClick(entry: PaymentEntry) {
    if (!onToggle || updating) return;
    const idx = entries.findIndex((e) => e.date === entry.date);
    const newLastPaymentDate =
      entry.status !== "paid" ? entry.date : idx > 0 ? entries[idx - 1].date : null;
    setUpdating(true);
    try {
      await onToggle(newLastPaymentDate);
    } finally {
      setUpdating(false);
    }
  }

  if (entries.length === 0) {
    return (
      <p className="text-[13px] text-[#9CA3AF] py-1">Nenhum pagamento agendado.</p>
    );
  }

  return (
    <div className={`space-y-1 transition-opacity ${updating ? "opacity-50 pointer-events-none" : ""}`}>
      {collapsedCount > 0 && (
        <p className="text-[12px] text-[#9CA3AF] py-1">
          + {collapsedCount} pagamento{collapsedCount !== 1 ? "s" : ""} anterior{collapsedCount !== 1 ? "es" : ""}
        </p>
      )}
      {visibleEntries.map((entry) => {
        const iconText = entry.status === "paid" ? "✓" : entry.status === "overdue" ? "!" : "→";
        const iconBg =
          entry.status === "paid"
            ? "bg-[rgba(46,139,90,0.08)]"
            : entry.status === "overdue"
            ? "bg-[#FEF2F2]"
            : "bg-[#F3F4F6]";
        const iconColor =
          entry.status === "paid"
            ? "text-[#2E8B5A]"
            : entry.status === "overdue"
            ? "text-[#DC2626]"
            : "text-[#6B7280]";
        const textColor =
          entry.status === "paid"
            ? "text-[#2E8B5A]"
            : entry.status === "overdue"
            ? "text-[#DC2626]"
            : "text-[#6B7280]";

        const iconEl = onToggle ? (
          <button
            type="button"
            onClick={() => handleEntryClick(entry)}
            className={`w-5 h-5 rounded-full ${iconBg} flex items-center justify-center shrink-0 cursor-pointer hover:opacity-70 transition-opacity`}
          >
            <span className={`text-[9px] font-black ${iconColor}`}>{iconText}</span>
          </button>
        ) : (
          <div className={`w-5 h-5 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
            <span className={`text-[9px] font-black ${iconColor}`}>{iconText}</span>
          </div>
        );

        return (
          <div key={entry.date} className="flex items-center gap-2.5 py-1.5">
            {iconEl}
            <span className={`text-[13px] font-medium ${textColor}`}>{formatEntryDate(entry.date)}</span>
            {entry.status === "overdue" && (
              <span className="ml-auto text-[11px] font-semibold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded-full">Atrasado</span>
            )}
            {entry.status === "upcoming" && (
              <span className="ml-auto text-[11px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">Próximo</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PatientPlanPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [patientName, setPatientName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form fields
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("BRL");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [status, setStatus] = useState("active");
  const [startDate, setStartDate] = useState("");
  const [nextPaymentDate, setNextPaymentDate] = useState("");
  const [lastPaymentDate, setLastPaymentDate] = useState("");
  const [notes, setNotes] = useState("");

  async function handlePaymentToggle(newLastPaymentDate: string | null) {
    const res = await fetch(`/api/professional/patients/${patientId}/plan`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: parseFloat(price),
        currency,
        billingCycle,
        status,
        startDate,
        nextPaymentDate: nextPaymentDate || null,
        lastPaymentDate: newLastPaymentDate,
        notes: notes || null,
      }),
    });
    if (res.ok) {
      setLastPaymentDate(newLastPaymentDate ?? "");
    }
  }

  useEffect(() => {
    async function fetchAll() {
      try {
        const [patientRes, planRes] = await Promise.all([
          fetch(`/api/professional/patients/${patientId}`),
          fetch(`/api/professional/patients/${patientId}/plan`),
        ]);

        if (patientRes.ok) {
          const { patient } = await patientRes.json();
          setPatientName(patient?.name ?? patient?.email ?? "Patient");
        }

        if (planRes.ok) {
          const { plan }: { plan: PatientPlan | null } = await planRes.json();
          if (plan) {
            setPrice(plan.price);
            setCurrency(plan.currency);
            setBillingCycle(plan.billingCycle);
            setStatus(plan.status);
            setStartDate(plan.startDate);
            setNextPaymentDate(plan.nextPaymentDate ?? "");
            setLastPaymentDate(plan.lastPaymentDate ?? "");
            setNotes(plan.notes ?? "");
          }
        }
      } catch {
        setError("Falha ao carregar dados.");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [patientId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/professional/patients/${patientId}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: parseFloat(price),
          currency,
          billingCycle,
          status,
          startDate,
          nextPaymentDate: nextPaymentDate || null,
          lastPaymentDate: lastPaymentDate || null,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Falha ao salvar o plano");
      }

      setSuccess(true);
      setTimeout(() => router.push(`/professional/patients/${patientId}`), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar o plano");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full h-10 px-3 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E8B5A] focus:ring-2 focus:ring-[rgba(46,139,90,0.15)] transition-all duration-150";
  const selectClass =
    "w-full h-10 px-3 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] text-[14px] text-[#111827] focus:outline-none focus:border-[#2E8B5A] focus:ring-2 focus:ring-[rgba(46,139,90,0.15)] transition-all duration-150 appearance-none";
  const labelClass = "block text-[13px] font-semibold text-[#374151] mb-1.5";

  return (
    <div className="p-4 md:p-8 max-w-[600px]">

      {/* Back link */}
      <Link
        href={`/professional/patients/${patientId}`}
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← {patientName || "Patient"}
      </Link>

      <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-6">
        Plano de pagamento
      </h1>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="flex items-center gap-2 bg-[rgba(46,139,90,0.08)] border border-[rgba(46,139,90,0.2)] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#2E8B5A] mb-4">
          Plano salvo com sucesso.
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-3 w-20 bg-[#F3F4F6] rounded mb-2" />
              <div className="h-10 w-full bg-[#F3F4F6] rounded-[10px]" />
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Valor</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Moeda</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  placeholder="BRL"
                  maxLength={5}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Ciclo de cobrança</label>
              <div className="relative">
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                  className={selectClass}
                >
                  <option value="monthly">Mensal</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="annual">Anual</option>
                  <option value="custom">Personalizado</option>
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={selectClass}
                >
                  <option value="active">Ativo</option>
                  <option value="paused">Pausado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <div>
              <label className={labelClass}>Data de início</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Próxima data de pagamento</label>
              <input
                type="date"
                value={nextPaymentDate}
                onChange={(e) => setNextPaymentDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Última data de pagamento <span className="font-normal text-[#9CA3AF]">(marcar como pago)</span></label>
              <input
                type="date"
                value={lastPaymentDate}
                onChange={(e) => setLastPaymentDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Observações <span className="font-normal text-[#9CA3AF]">(opcional)</span></label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Observações sobre o plano…"
                className="w-full px-3 py-2.5 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E8B5A] focus:ring-2 focus:ring-[rgba(46,139,90,0.15)] transition-all duration-150 resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-4 h-11 rounded-[10px] bg-[#2E8B5A] text-white text-[14px] font-bold hover:bg-[#267a50] active:bg-[#1e6b43] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {saving ? "Salvando…" : "Salvar plano"}
          </button>
        </form>
      )}

      {/* Payment History — shown when a plan exists */}
      {!loading && startDate && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden mt-4">
          <div className="px-4 py-3 border-b border-[#F3F4F6]">
            <p className="text-[14px] font-semibold text-[#111827]">Histórico de pagamentos</p>
          </div>
          <div className="px-4 py-4">
            <PaymentScheduleList
              startDate={startDate}
              billingCycle={billingCycle}
              lastPaymentDate={lastPaymentDate}
              onToggle={handlePaymentToggle}
            />
          </div>
        </div>
      )}
    </div>
  );
}

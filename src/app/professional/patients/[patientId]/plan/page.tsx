"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PatientPlan } from "@/types";

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
        setError("Failed to load data.");
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
        throw new Error(data.error ?? "Failed to save plan");
      }

      setSuccess(true);
      setTimeout(() => router.push(`/professional/patients/${patientId}`), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save plan");
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
        Payment Plan
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
          Plan saved successfully.
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
                <label className={labelClass}>Price</label>
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
                <label className={labelClass}>Currency</label>
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
              <label className={labelClass}>Billing cycle</label>
              <div className="relative">
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                  className={selectClass}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                  <option value="custom">Custom</option>
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
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <div>
              <label className={labelClass}>Start date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Next payment date</label>
              <input
                type="date"
                value={nextPaymentDate}
                onChange={(e) => setNextPaymentDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Last payment date <span className="font-normal text-[#9CA3AF]">(mark paid)</span></label>
              <input
                type="date"
                value={lastPaymentDate}
                onChange={(e) => setLastPaymentDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Notes <span className="font-normal text-[#9CA3AF]">(optional)</span></label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any notes about this plan…"
                className="w-full px-3 py-2.5 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E8B5A] focus:ring-2 focus:ring-[rgba(46,139,90,0.15)] transition-all duration-150 resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-4 h-11 rounded-[10px] bg-[#2E8B5A] text-white text-[14px] font-bold hover:bg-[#267a50] active:bg-[#1e6b43] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {saving ? "Saving…" : "Save plan"}
          </button>
        </form>
      )}
    </div>
  );
}

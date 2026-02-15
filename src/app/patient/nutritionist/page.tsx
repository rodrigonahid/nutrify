"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Nutritionist, PatientPlan } from "@/types";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
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
  monthly: "monthly",
  quarterly: "quarterly",
  annual: "annual",
  custom: "custom",
};

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "text-[#2E8B5A] bg-[rgba(46,139,90,0.08)]",
  },
  paused: {
    label: "Paused",
    className: "text-[#854D0E] bg-[#FEF9C3]",
  },
  cancelled: {
    label: "Cancelled",
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

        if (!nutritionistRes.ok) throw new Error("Failed to load nutritionist");

        const [nutritionistData, planData] = await Promise.all([
          nutritionistRes.json(),
          planRes.ok ? planRes.json() : { plan: null },
        ]);

        setNutritionist(nutritionistData.nutritionist);
        setPlan(planData.plan ?? null);
      } catch {
        setError("Failed to load data. Please try again.");
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
        ← Dashboard
      </Link>

      <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-6">
        My Nutritionist
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
          <p className="text-[14px] font-semibold text-[#111827]">Nutritionist Info</p>
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
                  <span className="text-[13px] text-[#6B7280]">Phone</span>
                  <span className="text-[13px] font-medium text-[#111827] text-right ml-4">{nutritionist.phone}</span>
                </div>
              )}
              {nutritionist.specialization && (
                <div className="flex items-start justify-between py-2.5">
                  <span className="text-[13px] text-[#6B7280]">Specialization</span>
                  <span className="text-[12px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] px-2.5 py-0.5 rounded-full ml-4">
                    {nutritionist.specialization}
                  </span>
                </div>
              )}
              {nutritionist.professionalLicense && (
                <div className="flex items-start justify-between py-2.5">
                  <span className="text-[13px] text-[#6B7280]">License</span>
                  <span className="text-[13px] font-medium text-[#111827] text-right ml-4">{nutritionist.professionalLicense}</span>
                </div>
              )}
              {nutritionist.bio && (
                <div className="py-2.5">
                  <span className="text-[13px] text-[#6B7280] block mb-1.5">About</span>
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
          <p className="text-[14px] font-semibold text-[#111827]">My Plan</p>
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
                <span className="text-[13px] text-[#6B7280]">Price</span>
                <span className="text-[13px] font-medium text-[#111827]">
                  {formatPrice(plan.price, plan.currency)} / {CYCLE_LABELS[plan.billingCycle] ?? plan.billingCycle}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-[#6B7280]">Start date</span>
                <span className="text-[13px] font-medium text-[#111827]">{formatDate(plan.startDate)}</span>
              </div>
              {plan.nextPaymentDate && (
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[13px] text-[#6B7280]">Next payment</span>
                  <span className="text-[13px] font-medium text-[#111827]">{formatDate(plan.nextPaymentDate)}</span>
                </div>
              )}
              {plan.lastPaymentDate && (
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[13px] text-[#6B7280]">Last payment</span>
                  <span className="text-[13px] font-medium text-[#111827]">{formatDate(plan.lastPaymentDate)}</span>
                </div>
              )}
              {plan.notes && (
                <div className="py-2.5">
                  <span className="text-[13px] text-[#6B7280] block mb-1.5">Notes</span>
                  <p className="text-[13px] text-[#374151] leading-relaxed">{plan.notes}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-[13px] text-[#9CA3AF]">
              No plan assigned yet. Contact your nutritionist.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { UtensilsCrossed, Plus, Trash2 } from "lucide-react";
import { MealPlanListItem } from "@/types";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
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
      <div className="flex gap-2">
        <div className="h-7 w-20 bg-[#F3F4F6] rounded-[6px]" />
        <div className="h-7 w-14 bg-[#F3F4F6] rounded-[6px]" />
      </div>
    </div>
  );
}

export default function MealPlanListPage() {
  const params = useParams();
  const patientId = params.patientId as string;

  const [mealPlans, setMealPlans] = useState<MealPlanListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const fetchMealPlans = useCallback(async () => {
    try {
      const res = await fetch(`/api/professional/patients/${patientId}/meal-plan`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMealPlans(data.mealPlans ?? []);
    } catch {
      setError("Failed to load meal plans");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchMealPlans();
  }, [fetchMealPlans]);

  async function toggleActive(planId: number, currentStatus: boolean) {
    setActionError("");
    try {
      const res = await fetch(
        `/api/professional/patients/${patientId}/meal-plan/${planId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );
      if (!res.ok) throw new Error();
      await fetchMealPlans();
    } catch {
      setActionError("Failed to update meal plan status");
    }
  }

  async function deleteMealPlan(planId: number) {
    if (!confirm("Delete this meal plan? This cannot be undone.")) return;
    setActionError("");
    try {
      const res = await fetch(
        `/api/professional/patients/${patientId}/meal-plan/${planId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      await fetchMealPlans();
    } catch {
      setActionError("Failed to delete meal plan");
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      {/* Back link */}
      <Link
        href={`/professional/patients/${patientId}`}
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Back to Patient
      </Link>

      {/* Page heading */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
            Meal Plans
          </h1>
          {!loading && (
            <p className="text-sm font-medium text-[#6B7280]">
              {mealPlans.length === 0
                ? "No plans yet"
                : `${mealPlans.length} plan${mealPlans.length !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>
        <Link
          href={`/professional/patients/${patientId}/meal-plan/create`}
          className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#2E8B5A] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#277A4F] transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)]"
        >
          <Plus size={13} strokeWidth={2.5} />
          New Plan
        </Link>
      </div>

      {/* Errors */}
      {(error || actionError) && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error || actionError}
        </div>
      )}

      {/* Meal plan list */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">

        {loading && (
          <div className="divide-y divide-[#F3F4F6]">
            {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {!loading && mealPlans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center mb-4">
              <UtensilsCrossed size={22} className="text-[#9CA3AF]" />
            </div>
            <p className="text-[15px] font-semibold text-[#374151] mb-1">
              No meal plans yet
            </p>
            <p className="text-[13px] text-[#9CA3AF] mb-5">
              Create the first nutrition plan for this patient.
            </p>
            <Link
              href={`/professional/patients/${patientId}/meal-plan/create`}
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#2E8B5A] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#277A4F] transition-colors duration-150"
            >
              <Plus size={13} strokeWidth={2.5} />
              Create First Plan
            </Link>
          </div>
        )}

        {!loading && mealPlans.length > 0 && (
          <div className="divide-y divide-[#F3F4F6]">
            {mealPlans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#F9FAFB] transition-colors duration-100"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-semibold text-[#111827] truncate">
                      {plan.name}
                    </p>
                    {plan.isActive && (
                      <span className="shrink-0 text-[11px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#9CA3AF]">
                    {formatDate(plan.createdAt)} · {plan.mealCount} meal{plan.mealCount !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleActive(plan.id, plan.isActive)}
                    className="h-7 px-2.5 text-[12px] font-semibold text-[#374151] bg-[#F3F4F6] rounded-[6px] hover:bg-[#E5E7EB] transition-colors duration-100"
                  >
                    {plan.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => deleteMealPlan(plan.id)}
                    className="h-7 w-7 flex items-center justify-center text-[#9CA3AF] hover:text-[#DC2626] rounded-[6px] transition-colors duration-100"
                    aria-label="Delete meal plan"
                  >
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                  <Link
                    href={`/professional/patients/${patientId}/meal-plan/${plan.id}`}
                    className="h-7 px-2.5 flex items-center text-[12px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] rounded-[6px] hover:bg-[rgba(46,139,90,0.14)] transition-colors duration-100"
                  >
                    Edit →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

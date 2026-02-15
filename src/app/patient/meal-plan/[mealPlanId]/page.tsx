"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MealPlan } from "@/types";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function SkeletonPanel() {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden animate-pulse">
      <div className="px-4 py-3 border-b border-[#F3F4F6]">
        <div className="h-4 w-24 bg-[#F3F4F6] rounded" />
      </div>
      <div className="p-4 space-y-2">
        <div className="h-3.5 w-48 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-36 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-40 bg-[#F3F4F6] rounded" />
      </div>
    </div>
  );
}

export default function PatientMealPlanDetailPage() {
  const params = useParams();
  const mealPlanId = params.mealPlanId as string;

  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/patient/meal-plan/${mealPlanId}`)
      .then((r) => r.json())
      .then((d) => setMealPlan(d.mealPlan))
      .catch(() => setError("Failed to load meal plan"))
      .finally(() => setLoading(false));
  }, [mealPlanId]);

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      <Link
        href="/patient/meal-plan"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Back to Meal Plans
      </Link>

      {/* Heading */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-0.5">
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight">
            {loading ? (
              <span className="inline-block w-48 h-6 bg-[#F3F4F6] rounded animate-pulse" />
            ) : (
              mealPlan?.name ?? "Meal Plan"
            )}
          </h1>
          {!loading && mealPlan?.isActive && (
            <span className="text-[11px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] px-2.5 py-0.5 rounded-full">
              Active
            </span>
          )}
        </div>
        {!loading && mealPlan && (
          <p className="text-sm font-medium text-[#6B7280]">
            Created {formatDate(mealPlan.createdAt)}
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <SkeletonPanel />
          <SkeletonPanel />
          <SkeletonPanel />
        </div>
      ) : !mealPlan ? null : mealPlan.meals?.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center">
          <p className="text-[14px] text-[#6B7280]">This meal plan has no meals yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...(mealPlan.meals ?? [])]
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((meal, mealIdx) => (
              <div
                key={meal.id}
                className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-[#F3F4F6]">
                  <p className="text-[14px] font-semibold text-[#111827]">
                    Meal {mealIdx + 1} · {formatTime(meal.timeOfDay)}
                  </p>
                </div>

                <div className="p-4 space-y-4">
                  {meal.options.map((option, optIdx) => (
                    <div
                      key={option.id}
                      className={optIdx > 0 ? "pt-4 border-t border-[#F3F4F6]" : ""}
                    >
                      <p className="text-[14px] font-semibold text-[#111827] mb-0.5">
                        {meal.options.length > 1
                          ? `Option ${optIdx + 1}: ${option.name}`
                          : option.name}
                      </p>
                      {option.notes && (
                        <p className="text-[12px] text-[#6B7280] mb-2">{option.notes}</p>
                      )}

                      {option.ingredients.length > 0 && (
                        <div className="space-y-1 mt-2">
                          <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1.5">
                            Ingredients
                          </p>
                          {[...option.ingredients]
                            .sort((a, b) => a.orderIndex - b.orderIndex)
                            .map((ing) => (
                              <div key={ing.id} className="flex items-center gap-2">
                                <span className="text-[#D1D5DB]">·</span>
                                <span className="text-[13px] font-medium text-[#374151]">
                                  {ing.ingredientName}
                                </span>
                                <span className="text-[12px] text-[#9CA3AF]">
                                  {ing.quantity} {ing.unit}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

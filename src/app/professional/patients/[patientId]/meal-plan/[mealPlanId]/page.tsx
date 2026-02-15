"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { MealFieldArray } from "@/components/meal-field-array";
import { mealPlanFormSchema } from "@/lib/validation";
import { z } from "zod";
import { MealPlan } from "@/types";

type MealPlanFormData = z.infer<typeof mealPlanFormSchema>;

function SkeletonPanel({ rows = 2 }: { rows?: number }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden animate-pulse">
      <div className="px-4 py-3 border-b border-[#F3F4F6]">
        <div className="h-4 w-32 bg-[#F3F4F6] rounded" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-10 bg-[#F3F4F6] rounded-[10px]" />
        ))}
      </div>
    </div>
  );
}

export default function EditMealPlanPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  const mealPlanId = params.mealPlanId as string;

  const [initializing, setInitializing] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MealPlanFormData>({
    resolver: zodResolver(mealPlanFormSchema),
    defaultValues: { name: "", meals: [] },
  });

  const { fields: meals, append: appendMeal, remove: removeMeal } = useFieldArray({
    control,
    name: "meals",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `/api/professional/patients/${patientId}/meal-plan/${mealPlanId}`
        );
        if (!res.ok) throw new Error("Failed to fetch meal plan");
        const { mealPlan: plan } = await res.json();
        setMealPlan(plan);

        reset({
          name: plan.name,
          meals: (plan.meals ?? []).map((meal: NonNullable<MealPlan["meals"]>[number]) => ({
            timeOfDay: meal.timeOfDay,
            orderIndex: meal.orderIndex,
            options: meal.options.map((opt) => ({
              name: opt.name,
              notes: opt.notes ?? "",
              ingredients: opt.ingredients.map((ing) => ({
                ingredientName: ing.ingredientName,
                quantity: parseFloat(ing.quantity as unknown as string),
                unit: ing.unit,
                orderIndex: ing.orderIndex,
              })),
            })),
          })),
        });
      } catch {
        setError("Failed to load meal plan");
      } finally {
        setInitializing(false);
      }
    }

    load();
  }, [patientId, mealPlanId, reset]);

  async function onSubmit(data: MealPlanFormData) {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(
        `/api/professional/patients/${patientId}/meal-plan/${mealPlanId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            isActive: mealPlan?.isActive ?? false,
            meals: data.meals,
          }),
        }
      );

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to update meal plan");
      }

      router.push(`/professional/patients/${patientId}/meal-plan`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update meal plan");
    } finally {
      setSubmitting(false);
    }
  }

  function addMeal() {
    appendMeal({
      timeOfDay: "12:00",
      orderIndex: meals.length,
      options: [
        {
          name: "",
          notes: "",
          ingredients: [
            { ingredientName: "", quantity: 0, unit: "g", orderIndex: 0 },
          ],
        },
      ],
    });
  }

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      {/* Back link */}
      <Link
        href={`/professional/patients/${patientId}/meal-plan`}
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Back to Meal Plans
      </Link>

      {/* Page heading */}
      <div className="flex items-center gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight">
              {initializing ? (
                <span className="inline-block w-48 h-6 bg-[#F3F4F6] rounded animate-pulse" />
              ) : (
                mealPlan?.name ?? "Edit Meal Plan"
              )}
            </h1>
            {!initializing && mealPlan?.isActive && (
              <span className="text-[11px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] px-2.5 py-0.5 rounded-full">
                Active
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-[#6B7280]">
            Edit meals, options, and ingredients.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {initializing ? (
        <div className="space-y-4">
          <SkeletonPanel rows={1} />
          <SkeletonPanel rows={3} />
          <SkeletonPanel rows={3} />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">

            {/* Plan name */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#F3F4F6]">
                <p className="text-[14px] font-semibold text-[#111827]">Plan Details</p>
              </div>
              <div className="p-4">
                <FormField
                  label="Plan Name"
                  placeholder="e.g., Weekly Plan — January"
                  registration={register("name")}
                  error={errors.name}
                />
              </div>
            </div>

            {/* Meal panels */}
            {meals.map((meal, mealIdx) => (
              <div
                key={meal.id}
                className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3F4F6]">
                  <p className="text-[14px] font-semibold text-[#111827]">
                    Meal {mealIdx + 1}
                  </p>
                  {meals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMeal(mealIdx)}
                      className="h-7 w-7 flex items-center justify-center text-[#9CA3AF] hover:text-[#DC2626] rounded-[6px] transition-colors duration-100"
                      aria-label="Remove meal"
                    >
                      <Trash2 size={13} strokeWidth={2} />
                    </button>
                  )}
                </div>
                <div className="p-4">
                  <MealFieldArray
                    mealIndex={mealIdx}
                    control={control}
                    register={register}
                    errors={errors}
                    onRemove={() => removeMeal(mealIdx)}
                  />
                </div>
              </div>
            ))}

            {errors.meals && typeof errors.meals.message === "string" && (
              <p className="text-[13px] font-medium text-[#DC2626]">
                {errors.meals.message}
              </p>
            )}

            {/* Add meal */}
            <button
              type="button"
              onClick={addMeal}
              className="w-full h-10 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[#6B7280] border border-dashed border-[#D1D5DB] rounded-xl hover:border-[#2E8B5A] hover:text-[#2E8B5A] transition-colors duration-150"
            >
              + Add Meal
            </button>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Link
                href={`/professional/patients/${patientId}/meal-plan`}
                className="flex-1 h-11 flex items-center justify-center text-[14px] font-semibold text-[#374151] bg-white border border-[#E5E7EB] rounded-[10px] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-all duration-150"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 h-11 flex items-center justify-center gap-2 text-[14px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] hover:bg-[#277A4F] transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>

          </div>
        </form>
      )}
    </div>
  );
}

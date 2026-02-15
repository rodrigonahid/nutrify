"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2 } from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { mealPlanFormSchema } from "@/lib/validation";
import { MealFieldArray } from "@/components/meal-field-array";

type MealPlanFormData = z.infer<typeof mealPlanFormSchema>;

export default function CreateMealPlanPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MealPlanFormData>({
    resolver: zodResolver(mealPlanFormSchema),
    defaultValues: {
      name: "",
      meals: [
        {
          timeOfDay: "08:00",
          orderIndex: 0,
          options: [
            {
              name: "",
              notes: "",
              ingredients: [
                { ingredientName: "", quantity: 0, unit: "g", orderIndex: 0 },
              ],
            },
          ],
        },
      ],
    },
  });

  const { fields: meals, append: appendMeal, remove: removeMeal } = useFieldArray({
    control,
    name: "meals",
  });

  function addMeal() {
    appendMeal({
      timeOfDay: "08:00",
      orderIndex: meals.length,
      options: [],
    });
  }

  async function onSubmit(data: MealPlanFormData, isActive: boolean) {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(
        `/api/professional/patients/${patientId}/meal-plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, isActive }),
        }
      );

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Falha ao criar plano alimentar");
      }

      router.push(`/professional/patients/${patientId}/meal-plan`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar plano alimentar");
    } finally {
      setSubmitting(false);
    }
  }

  const formName = watch("name");
  const canSubmit = !submitting && !!formName && meals.length > 0;

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      {/* Back link */}
      <Link
        href={`/professional/patients/${patientId}/meal-plan`}
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Voltar aos planos alimentares
      </Link>

      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-1">
          Novo Plano Alimentar
        </h1>
        <p className="text-sm font-medium text-[#6B7280]">
          Adicione refeições, opções e ingredientes abaixo.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">

        {/* Plan name */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F3F4F6]">
            <p className="text-[14px] font-semibold text-[#111827]">Detalhes do plano</p>
          </div>
          <div className="p-4">
            <FormField
              label="Nome do plano"
              placeholder="ex.: Plano Semanal — Janeiro"
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
                Refeição {mealIdx + 1}
              </p>
              {meals.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMeal(mealIdx)}
                  className="h-7 w-7 flex items-center justify-center text-[#9CA3AF] hover:text-[#DC2626] rounded-[6px] transition-colors duration-100"
                  aria-label="Remover refeição"
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
          + Adicionar refeição
        </button>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Link
            href={`/professional/patients/${patientId}/meal-plan`}
            className="flex-1 h-11 flex items-center justify-center text-[14px] font-semibold text-[#374151] bg-white border border-[#E5E7EB] rounded-[10px] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-all duration-150"
          >
            Cancelar
          </Link>
          <button
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, false))}
            disabled={!canSubmit}
            className="flex-1 h-11 flex items-center justify-center text-[14px] font-semibold text-[#374151] bg-white border border-[#E5E7EB] rounded-[10px] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Salvando…" : "Salvar como rascunho"}
          </button>
          <button
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, true))}
            disabled={!canSubmit}
            className="flex-1 h-11 flex items-center justify-center gap-2 text-[14px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] hover:bg-[#277A4F] transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Salvando…
              </>
            ) : (
              "Salvar e ativar"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

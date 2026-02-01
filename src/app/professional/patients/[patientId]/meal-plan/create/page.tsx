"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { LogoutButton } from "@/components/logout-button";
import { PageHeader } from "@/components/page-header";
import { mealPlanFormSchema } from "@/lib/validation";
import { MealFieldArray } from "@/components/meal-field-array";

type MealPlanFormData = z.infer<typeof mealPlanFormSchema>;

export default function CreateMealPlanPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [loading, setLoading] = useState(false);
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
                { ingredientName: "", quantity: 0, unit: "g" as const, orderIndex: 0 },
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
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...data,
        isActive,
      };

      const response = await fetch(
        `/api/professional/patients/${patientId}/meal-plan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to create meal plan");
      }

      router.push(`/professional/patients/${patientId}/meal-plan`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create meal plan"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const formName = watch("name");

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Create Meal Plan" />

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <Link
          href={`/professional/patients/${patientId}/meal-plan`}
          className="inline-block mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Meal Plans
        </Link>
        {error && (
          <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Meal Plan Name */}
          <Card>
            <CardHeader>
              <CardTitle>Meal Plan Details</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                label="Plan Name"
                placeholder="e.g., Weekly Plan - January"
                registration={register("name")}
                error={errors.name}
              />
            </CardContent>
          </Card>

          {/* Meals */}
          {meals.map((meal, mealIdx) => (
            <Card key={meal.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Meal #{mealIdx + 1}</CardTitle>
                  <CardDescription>
                    Define meal time and options
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeMeal(mealIdx)}
                  className="text-red-600"
                >
                  Remove Meal
                </Button>
              </CardHeader>
              <CardContent>
                <MealFieldArray
                  mealIndex={mealIdx}
                  control={control}
                  register={register}
                  errors={errors}
                  onRemove={() => removeMeal(mealIdx)}
                />
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            onClick={addMeal}
            variant="outline"
            className="w-full"
          >
            + Add Meal
          </Button>

          {errors.meals && typeof errors.meals.message === "string" && (
            <p className="text-sm text-destructive">{errors.meals.message}</p>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() =>
                router.push(`/professional/patients/${patientId}/meal-plan`)
              }
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleSubmit((data) => onSubmit(data, false))}
              disabled={loading || !formName || meals.length === 0}
            >
              {loading ? "Saving..." : "Save as Draft"}
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleSubmit((data) => onSubmit(data, true))}
              disabled={loading || !formName || meals.length === 0}
            >
              {loading ? "Saving..." : "Save and Activate"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

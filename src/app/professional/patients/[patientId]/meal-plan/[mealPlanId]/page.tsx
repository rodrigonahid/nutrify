"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { MealFieldArray } from "@/components/meal-field-array";
import { mealPlanFormSchema } from "@/lib/validation";
import { z } from "zod";
import { MealPlan } from "@/types";

type MealPlanFormData = z.infer<typeof mealPlanFormSchema>;

export default function EditMealPlanPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  const mealPlanId = params.mealPlanId as string;

  const [loading, setLoading] = useState(true);
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
    defaultValues: {
      name: "",
      meals: [],
    },
  });

  const { fields: meals, append: appendMeal, remove: removeMeal } = useFieldArray({
    control,
    name: "meals",
  });

  // Fetch meal plan data
  useEffect(() => {
    async function fetchMealPlan() {
      try {
        const response = await fetch(
          `/api/professional/patients/${patientId}/meal-plan/${mealPlanId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch meal plan");
        }
        const data = await response.json();
        const plan = data.mealPlan;
        setMealPlan(plan);

        // Transform the data to match form structure
        const formData: MealPlanFormData = {
          name: plan.name,
          meals: plan.meals.map((meal: any) => ({
            timeOfDay: meal.timeOfDay,
            orderIndex: meal.orderIndex,
            options: meal.options.map((option: any) => ({
              name: option.name,
              notes: option.notes || "",
              ingredients: option.ingredients.map((ing: any) => ({
                ingredientName: ing.ingredientName,
                quantity: parseFloat(ing.quantity),
                unit: ing.unit,
                orderIndex: ing.orderIndex,
              })),
            })),
          })),
        };

        reset(formData);
      } catch (err) {
        setError("Failed to load meal plan");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMealPlan();
  }, [patientId, mealPlanId, reset]);

  async function onSubmit(data: MealPlanFormData) {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/professional/patients/${patientId}/meal-plan/${mealPlanId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
            isActive: mealPlan?.isActive || false,
            meals: data.meals,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update meal plan");
      }

      router.push(`/professional/patients/${patientId}`);
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
            {
              ingredientName: "",
              quantity: 0,
              unit: "g",
              orderIndex: 0,
            },
          ],
        },
      ],
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Edit Meal Plan" />
        <main className="container mx-auto px-4 py-8 max-w-[1200px]">
          <p className="text-center text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Edit Meal Plan" />

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <Link
          href={`/professional/patients/${patientId}`}
          className="inline-block mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Patient
        </Link>

        {error && (
          <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Meal Plan Details</CardTitle>
              <CardDescription>
                Update the meal plan name and configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="meal-plan-name">Meal Plan Name</Label>
                <Input
                  id="meal-plan-name"
                  {...register("name")}
                  placeholder="e.g., Weight Loss Plan"
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {mealPlan?.isActive && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    This meal plan is currently active for this patient.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meals */}
          <div className="space-y-6">
            {meals.map((meal, index) => (
              <Card key={meal.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg">Meal {index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeMeal(index)}
                    className="text-red-600"
                  >
                    Remove Meal
                  </Button>
                </CardHeader>
                <CardContent>
                  <MealFieldArray
                    mealIndex={index}
                    control={control}
                    register={register}
                    errors={errors}
                    onRemove={() => removeMeal(index)}
                  />
                </CardContent>
              </Card>
            ))}

            <Button type="button" variant="outline" onClick={addMeal}>
              + Add Meal
            </Button>

            {errors.meals && typeof errors.meals.message === "string" && (
              <p className="text-sm text-destructive">{errors.meals.message}</p>
            )}
          </div>

          {/* Submit */}
          <div className="mt-8 flex gap-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/professional/patients/${patientId}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

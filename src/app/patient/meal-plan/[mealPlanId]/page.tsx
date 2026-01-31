"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";

interface Ingredient {
  id: number;
  ingredientName: string;
  quantity: string;
  unit: string;
  orderIndex: number;
}

interface MealOption {
  id: number;
  name: string;
  notes: string | null;
  ingredients: Ingredient[];
}

interface Meal {
  id: number;
  timeOfDay: string;
  orderIndex: number;
  options: MealOption[];
}

interface MealPlan {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  meals: Meal[];
}

export default function PatientMealPlanDetailPage() {
  const params = useParams();
  const mealPlanId = params.mealPlanId as string;

  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMealPlan();
  }, [mealPlanId]);

  async function fetchMealPlan() {
    try {
      const response = await fetch(`/api/patient/meal-plan/${mealPlanId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch meal plan");
      }
      const data = await response.json();
      setMealPlan(data.mealPlan);
    } catch (err) {
      setError("Failed to load meal plan");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Meal plan not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Meal Plan Details</h1>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <Link
          href="/patient/meal-plan"
          className="inline-block mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Meal Plans
        </Link>
        {error && (
          <div className="mb-6 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">{mealPlan.name}</h2>
            {mealPlan.isActive && (
              <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                Active
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Created on {formatDate(mealPlan.createdAt)}
          </p>
        </div>

        <div className="space-y-6">
          {mealPlan.meals
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((meal) => (
              <Card key={meal.id}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🕐</span>
                    <span>{formatTime(meal.timeOfDay)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {meal.options.map((option, optIdx) => (
                    <div
                      key={option.id}
                      className={`${
                        optIdx > 0 ? "border-t pt-4" : ""
                      }`}
                    >
                      <div className="mb-3">
                        <h4 className="font-semibold text-lg">
                          {meal.options.length > 1
                            ? `Option ${optIdx + 1}: ${option.name}`
                            : option.name}
                        </h4>
                        {option.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {option.notes}
                          </p>
                        )}
                      </div>

                      <div className="ml-4 space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Ingredients:
                        </p>
                        <ul className="space-y-1">
                          {option.ingredients
                            .sort((a, b) => a.orderIndex - b.orderIndex)
                            .map((ingredient) => (
                              <li
                                key={ingredient.id}
                                className="flex items-center gap-2 text-sm"
                              >
                                <span className="text-muted-foreground">•</span>
                                <span className="font-medium">
                                  {ingredient.ingredientName}
                                </span>
                                <span className="text-muted-foreground">
                                  ({ingredient.quantity} {ingredient.unit})
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
        </div>

        {mealPlan.meals.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                This meal plan has no meals yet.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

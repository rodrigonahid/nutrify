"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";

interface MealPlan {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  mealCount: number;
}

export default function MealPlanListPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMealPlans();
  }, [patientId]);

  async function fetchMealPlans() {
    try {
      const response = await fetch(
        `/api/professional/patients/${patientId}/meal-plan`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch meal plans");
      }
      const data = await response.json();
      setMealPlans(data.mealPlans);
    } catch (err) {
      setError("Failed to load meal plans");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(planId: number, currentStatus: boolean) {
    try {
      const response = await fetch(
        `/api/professional/patients/${patientId}/meal-plan/${planId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update meal plan");
      }

      // Refresh the list
      fetchMealPlans();
    } catch (err) {
      setError("Failed to update meal plan status");
      console.error(err);
    }
  }

  async function deleteMealPlan(planId: number) {
    if (!confirm("Are you sure you want to delete this meal plan?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/professional/patients/${patientId}/meal-plan/${planId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete meal plan");
      }

      // Refresh the list
      fetchMealPlans();
    } catch (err) {
      setError("Failed to delete meal plan");
      console.error(err);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Meal Plans</h1>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <Link
          href={`/professional/patients/${patientId}`}
          className="inline-block mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Patient
        </Link>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Manage Meal Plans</h2>
            <p className="text-muted-foreground">
              Create and manage nutrition plans for your patient
            </p>
          </div>
          <Button
            onClick={() =>
              router.push(
                `/professional/patients/${patientId}/meal-plan/create`
              )
            }
          >
            Create New Meal Plan
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {mealPlans.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No meal plans yet. Create the first one to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {mealPlans.map((plan) => (
              <Card key={plan.id} className="relative">
                {plan.isActive && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg pr-16">{plan.name}</CardTitle>
                  <CardDescription>
                    Created on {formatDate(plan.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {plan.mealCount || 0} meal{plan.mealCount !== 1 ? "s" : ""}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(plan.id, plan.isActive)}
                    >
                      {plan.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/professional/patients/${patientId}/meal-plan/${plan.id}`
                        )
                      }
                    >
                      View/Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMealPlan(plan.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

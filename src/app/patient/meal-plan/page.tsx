"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";

interface MealPlan {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  mealCount: number;
  professionalEmail: string;
}

export default function PatientMealPlanListPage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMealPlans();
  }, []);

  async function fetchMealPlans() {
    try {
      const response = await fetch("/api/patient/meal-plan");
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
          <h1 className="text-xl font-bold">My Meal Plans</h1>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <Link
          href="/patient"
          className="inline-block mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Dashboard
        </Link>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Nutrition Plans</h2>
          <p className="text-muted-foreground">
            View meal plans created by your nutritionist
          </p>
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
                No meal plans yet. Your nutritionist will create one for you
                soon.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {mealPlans.map((plan) => (
              <Link key={plan.id} href={`/patient/meal-plan/${plan.id}`}>
                <Card className="cursor-pointer hover:border-primary transition-colors relative">
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
                      Created on {formatDate(plan.createdAt)} by{" "}
                      {plan.professionalEmail}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {plan.mealCount || 0} meal
                        {plan.mealCount !== 1 ? "s" : ""}
                      </span>
                      <span>•</span>
                      <span>Click to view details</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

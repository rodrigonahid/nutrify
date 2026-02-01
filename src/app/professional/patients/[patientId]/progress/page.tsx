"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Progress, MealPlanListItem } from "@/types";

export default function PatientProgressPage() {
  const params = useParams();
  const patientId = params.patientId as string;

  const [progress, setProgress] = useState<Progress[]>([]);
  const [activeMealPlan, setActiveMealPlan] = useState<MealPlanListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [patientId]);

  async function fetchData() {
    try {
      // Fetch progress entries
      const progressResponse = await fetch(
        `/api/professional/patients/${patientId}/progress`
      );
      if (!progressResponse.ok) {
        throw new Error("Failed to fetch progress data");
      }
      const progressData = await progressResponse.json();

      // Get only the last 3 entries
      const lastThree = progressData.progress.slice(0, 3);
      setProgress(lastThree);

      // Fetch meal plans to find the active one
      const mealPlanResponse = await fetch(
        `/api/professional/patients/${patientId}/meal-plan`
      );
      if (mealPlanResponse.ok) {
        const mealPlanData = await mealPlanResponse.json();
        const active = mealPlanData.mealPlans?.find((mp: MealPlanListItem) => mp.isActive);
        setActiveMealPlan(active || null);
      }
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatValue(value: string | null, unit: string = "") {
    if (!value) return "N/A";
    const numValue = parseFloat(value);
    return `${numValue.toFixed(1)}${unit}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Progress Tracking" />
        <main className="container mx-auto px-4 py-8 max-w-[1200px]">
          <p className="text-center text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Progress Tracking" />

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

        {/* Active Meal Plan */}
        {activeMealPlan && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Active Meal Plan</h2>
            <Link href={`/professional/patients/${patientId}/meal-plan/${activeMealPlan.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">{activeMealPlan.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {activeMealPlan.mealCount} meal{activeMealPlan.mealCount !== 1 ? "s" : ""}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      Active
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        {/* Recent Progress Entries */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Progress (Last 3 Entries)</h2>
            <Link
              href={`/professional/patients/${patientId}/progress/create`}
              className="text-sm text-primary hover:underline"
            >
              + Add Progress Entry
            </Link>
          </div>

          {progress.length === 0 ? (
            <Card className="bg-white">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No progress entries yet
                </p>
                <Link
                  href={`/professional/patients/${patientId}/progress/create`}
                  className="text-primary hover:underline"
                >
                  Create first entry →
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {progress.map((entry) => (
                <Card key={entry.id} className="bg-white hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {formatDate(entry.createdAt)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {entry.totalWeight && (
                        <div>
                          <p className="text-xs text-muted-foreground">Weight</p>
                          <p className="text-sm font-semibold">
                            {formatValue(entry.totalWeight, " kg")}
                          </p>
                        </div>
                      )}
                      {entry.bmi && (
                        <div>
                          <p className="text-xs text-muted-foreground">BMI</p>
                          <p className="text-sm font-semibold">
                            {formatValue(entry.bmi)}
                          </p>
                        </div>
                      )}
                      {entry.bodyFatPercentage && (
                        <div>
                          <p className="text-xs text-muted-foreground">Body Fat</p>
                          <p className="text-sm font-semibold">
                            {formatValue(entry.bodyFatPercentage, "%")}
                          </p>
                        </div>
                      )}
                      {entry.perimeterWaist && (
                        <div>
                          <p className="text-xs text-muted-foreground">Waist</p>
                          <p className="text-sm font-semibold">
                            {formatValue(entry.perimeterWaist, " cm")}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

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
import { PageHeader } from "@/components/page-header";
import { DeltaIndicator } from "@/components/delta-indicator";
import { Progress } from "@/types/progress";


export default function PatientProgressListPage() {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProgress();
  }, []);

  async function fetchProgress() {
    try {
      const response = await fetch("/api/patient/progress");
      if (!response.ok) {
        throw new Error("Failed to fetch progress");
      }
      const data = await response.json();
      setProgress(data.progress);
    } catch (err) {
      setError("Failed to load progress data");
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
      <PageHeader title="My Progress" />

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <Link
          href="/patient"
          className="inline-block mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Dashboard
        </Link>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Progress History</h2>
          <p className="text-muted-foreground">
            View your progress entries recorded by your nutritionist
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
            {error}
          </div>
        )}

        {progress.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No progress entries yet. Your nutritionist will add your first
                entry soon.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {progress.map((entry, index) => {
              const previousEntry = progress[index + 1];

              return (
                <Link key={entry.id} href={`/patient/progress/${entry.id}`}>
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {formatDate(entry.createdAt)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {entry.totalWeight && (
                          <div>
                            <p className="text-muted-foreground">Weight</p>
                            <div className="flex items-center gap-1">
                              <p className="font-medium">{entry.totalWeight} kg</p>
                              <DeltaIndicator
                                current={entry.totalWeight}
                                previous={previousEntry?.totalWeight || null}
                                unit="kg"
                              />
                            </div>
                          </div>
                        )}
                        {entry.bmi && (
                          <div>
                            <p className="text-muted-foreground">BMI</p>
                            <div className="flex items-center gap-1">
                              <p className="font-medium">{entry.bmi}</p>
                              <DeltaIndicator
                                current={entry.bmi}
                                previous={previousEntry?.bmi || null}
                                unit=""
                              />
                            </div>
                          </div>
                        )}
                        {entry.bodyFatPercentage && (
                          <div>
                            <p className="text-muted-foreground">Body Fat</p>
                            <div className="flex items-center gap-1">
                              <p className="font-medium">
                                {entry.bodyFatPercentage}%
                              </p>
                              <DeltaIndicator
                                current={entry.bodyFatPercentage}
                                previous={previousEntry?.bodyFatPercentage || null}
                                unit="%"
                              />
                            </div>
                          </div>
                        )}
                        {entry.height && (
                          <div>
                            <p className="text-muted-foreground">Height</p>
                            <div className="flex items-center gap-1">
                              <p className="font-medium">{entry.height} cm</p>
                              <DeltaIndicator
                                current={entry.height}
                                previous={previousEntry?.height || null}
                                unit="cm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

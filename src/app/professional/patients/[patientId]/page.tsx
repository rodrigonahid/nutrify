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

interface Patient {
  id: number;
  userId: number;
  email: string;
  dateOfBirth: string | null;
  height: string | null;
  weight: string | null;
  medicalNotes: string | null;
  createdAt: string;
}

interface Progress {
  id: number;
  patientId: number;
  bodyFatPercentage: string | null;
  height: string | null;
  totalWeight: string | null;
  bmi: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProgress, setSelectedProgress] = useState<Progress | null>(
    null
  );

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  async function fetchPatientData() {
    try {
      // For now, we'll just fetch the progress
      // In a real implementation, you'd also fetch patient details
      const response = await fetch(
        `/api/professional/patients/${patientId}/progress`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch progress data");
      }
      const data = await response.json();
      setProgress(data.progress);
    } catch (err) {
      setError("Failed to load patient data");
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
          <h1 className="text-xl font-bold">Patient Details</h1>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <Link
          href="/professional/patients"
          className="inline-block mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Patients
        </Link>
        {error && (
          <div className="mb-6 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          <div className="col-span-4">
            <Button className="w-full" disabled>
              Subscription
            </Button>
          </div>
          <div className="col-span-4">
            <Button
              className="w-full"
              onClick={() =>
                router.push(`/professional/patients/${patientId}/meal-plan`)
              }
            >
              Meal Plan
            </Button>
          </div>
          <div className="col-span-4">
            <Button className="w-full" disabled>
              Pictures
            </Button>
          </div>
        </div>

        {/* Progress Section */}
        <div className="col-span-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  View and manage patient progress entries
                </CardDescription>
              </div>
              <Button
                onClick={() =>
                  router.push(
                    `/professional/patients/${patientId}/progress/create`
                  )
                }
              >
                Add New Progress
              </Button>
            </CardHeader>
            <CardContent>
              {progress.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No progress entries yet. Add the first one to start
                    tracking.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {progress.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => setSelectedProgress(entry)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {formatDate(entry.createdAt)}
                          </p>
                          <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                            {entry.totalWeight && (
                              <span>Weight: {entry.totalWeight} kg</span>
                            )}
                            {entry.bmi && <span>BMI: {entry.bmi}</span>}
                            {entry.bodyFatPercentage && (
                              <span>
                                Body Fat: {entry.bodyFatPercentage}%
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Click to view details
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Simple Modal for Progress Details */}
        {selectedProgress && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedProgress(null)}
          >
            <Card
              className="max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <CardTitle>
                  Progress Entry - {formatDate(selectedProgress.createdAt)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Body Composition */}
                <div>
                  <h3 className="font-semibold mb-2">Body Composition</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {selectedProgress.bodyFatPercentage && (
                      <p>Body Fat: {selectedProgress.bodyFatPercentage}%</p>
                    )}
                    {selectedProgress.height && (
                      <p>Height: {selectedProgress.height} m</p>
                    )}
                    {selectedProgress.totalWeight && (
                      <p>Weight: {selectedProgress.totalWeight} kg</p>
                    )}
                    {selectedProgress.bmi && (
                      <p>BMI: {selectedProgress.bmi}</p>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedProgress(null)}
                >
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

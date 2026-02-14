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
import { PageHeader } from "@/components/page-header";
import { Patient, Progress, MealPlanListItem } from "@/types";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [activeMealPlan, setActiveMealPlan] = useState<MealPlanListItem | null>(null);
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
  console.log('selectedProgress :>> ', selectedProgress);
  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Patient Details" />

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <Link
          href="/professional/patients"
          className="inline-block mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Patients
        </Link>
        {error && (
          <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Link
            href={`/professional/patients/${patientId}/progress`}
            className="p-6 bg-white border rounded-lg hover:border-primary transition-colors"
          >
            <h2 className="text-lg font-semibold mb-2">Progress</h2>
            <p className="text-muted-foreground text-sm">
              View patient progress entries
            </p>
          </Link>
          <Link
            href={`/professional/patients/${patientId}/meal-plan`}
            className="p-6 bg-white border rounded-lg hover:border-primary transition-colors"
          >
            <h2 className="text-lg font-semibold mb-2">Meal Plans</h2>
            <p className="text-muted-foreground text-sm">
              View and manage meal plans
            </p>
          </Link>
          <Link
            href={`/professional/patients/${patientId}/appointments`}
            className="p-6 bg-white border rounded-lg hover:border-primary transition-colors"
          >
            <h2 className="text-lg font-semibold mb-2">Appointments</h2>
            <p className="text-muted-foreground text-sm">
              View all appointments for this patient
            </p>
          </Link>
        </div>

        {/* Active Meal Plan Section */}
        <div className="mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Active Meal Plan</CardTitle>
                <CardDescription>
                  Current meal plan for this patient
                </CardDescription>
              </div>
              {activeMealPlan ? (
                <Button
                  onClick={() =>
                    router.push(
                      `/professional/patients/${patientId}/meal-plan/${activeMealPlan.id}`
                    )
                  }
                >
                  Edit Meal Plan
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    router.push(
                      `/professional/patients/${patientId}/meal-plan/create`
                    )
                  }
                >
                  Create Meal Plan
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {activeMealPlan ? (
                <Link href={`/professional/patients/${patientId}/meal-plan/${activeMealPlan.id}`}>
                  <div className="p-4 bg-white border rounded-lg hover:border-primary transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{activeMealPlan.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activeMealPlan.mealCount} meal{activeMealPlan.mealCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        Active
                      </span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No active meal plan. Create one to get started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
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

                {/* Perimeters - Trunk */}
                {(selectedProgress.perimeterChest ||
                  selectedProgress.perimeterShoulder ||
                  selectedProgress.perimeterWaist ||
                  selectedProgress.perimeterAbdomen ||
                  selectedProgress.perimeterHip) && (
                  <div>
                    <h3 className="font-semibold mb-2">Perimeters - Trunk (cm)</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {selectedProgress.perimeterChest && (
                        <p>Chest: {selectedProgress.perimeterChest} cm</p>
                      )}
                      {selectedProgress.perimeterShoulder && (
                        <p>Shoulder: {selectedProgress.perimeterShoulder} cm</p>
                      )}
                      {selectedProgress.perimeterWaist && (
                        <p>Waist: {selectedProgress.perimeterWaist} cm</p>
                      )}
                      {selectedProgress.perimeterAbdomen && (
                        <p>Abdomen: {selectedProgress.perimeterAbdomen} cm</p>
                      )}
                      {selectedProgress.perimeterHip && (
                        <p>Hip: {selectedProgress.perimeterHip} cm</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Perimeters - Upper Limbs */}
                {(selectedProgress.perimeterBicepsLeftRelaxed ||
                  selectedProgress.perimeterBicepsLeftContracted ||
                  selectedProgress.perimeterBicepsRightRelaxed ||
                  selectedProgress.perimeterBicepsRightContracted ||
                  selectedProgress.perimeterForearmLeft ||
                  selectedProgress.perimeterForearmRight) && (
                  <div>
                    <h3 className="font-semibold mb-2">Perimeters - Upper Limbs (cm)</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {selectedProgress.perimeterBicepsLeftRelaxed && (
                        <p>Biceps Left (Relaxed): {selectedProgress.perimeterBicepsLeftRelaxed} cm</p>
                      )}
                      {selectedProgress.perimeterBicepsLeftContracted && (
                        <p>Biceps Left (Contracted): {selectedProgress.perimeterBicepsLeftContracted} cm</p>
                      )}
                      {selectedProgress.perimeterBicepsRightRelaxed && (
                        <p>Biceps Right (Relaxed): {selectedProgress.perimeterBicepsRightRelaxed} cm</p>
                      )}
                      {selectedProgress.perimeterBicepsRightContracted && (
                        <p>Biceps Right (Contracted): {selectedProgress.perimeterBicepsRightContracted} cm</p>
                      )}
                      {selectedProgress.perimeterForearmLeft && (
                        <p>Forearm Left: {selectedProgress.perimeterForearmLeft} cm</p>
                      )}
                      {selectedProgress.perimeterForearmRight && (
                        <p>Forearm Right: {selectedProgress.perimeterForearmRight} cm</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Perimeters - Lower Limbs */}
                {(selectedProgress.perimeterThighProximalLeft ||
                  selectedProgress.perimeterThighProximalRight ||
                  selectedProgress.perimeterThighMedialLeft ||
                  selectedProgress.perimeterThighMedialRight ||
                  selectedProgress.perimeterThighDistalLeft ||
                  selectedProgress.perimeterThighDistalRight ||
                  selectedProgress.perimeterCalfLeft ||
                  selectedProgress.perimeterCalfRight) && (
                  <div>
                    <h3 className="font-semibold mb-2">Perimeters - Lower Limbs (cm)</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {selectedProgress.perimeterThighProximalLeft && (
                        <p>Thigh Proximal Left: {selectedProgress.perimeterThighProximalLeft} cm</p>
                      )}
                      {selectedProgress.perimeterThighProximalRight && (
                        <p>Thigh Proximal Right: {selectedProgress.perimeterThighProximalRight} cm</p>
                      )}
                      {selectedProgress.perimeterThighMedialLeft && (
                        <p>Thigh Medial Left: {selectedProgress.perimeterThighMedialLeft} cm</p>
                      )}
                      {selectedProgress.perimeterThighMedialRight && (
                        <p>Thigh Medial Right: {selectedProgress.perimeterThighMedialRight} cm</p>
                      )}
                      {selectedProgress.perimeterThighDistalLeft && (
                        <p>Thigh Distal Left: {selectedProgress.perimeterThighDistalLeft} cm</p>
                      )}
                      {selectedProgress.perimeterThighDistalRight && (
                        <p>Thigh Distal Right: {selectedProgress.perimeterThighDistalRight} cm</p>
                      )}
                      {selectedProgress.perimeterCalfLeft && (
                        <p>Calf Left: {selectedProgress.perimeterCalfLeft} cm</p>
                      )}
                      {selectedProgress.perimeterCalfRight && (
                        <p>Calf Right: {selectedProgress.perimeterCalfRight} cm</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Skinfolds */}
                {(selectedProgress.skinfoldBiceps ||
                  selectedProgress.skinfoldTriceps ||
                  selectedProgress.skinfoldAxillary ||
                  selectedProgress.skinfoldSuprailiac ||
                  selectedProgress.skinfoldAbdominal ||
                  selectedProgress.skinfoldSubscapular ||
                  selectedProgress.skinfoldChest ||
                  selectedProgress.skinfoldThigh ||
                  selectedProgress.skinfoldCalf) && (
                  <div>
                    <h3 className="font-semibold mb-2">Skinfolds (mm)</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {selectedProgress.skinfoldBiceps && (
                        <p>Biceps: {selectedProgress.skinfoldBiceps} mm</p>
                      )}
                      {selectedProgress.skinfoldTriceps && (
                        <p>Triceps: {selectedProgress.skinfoldTriceps} mm</p>
                      )}
                      {selectedProgress.skinfoldAxillary && (
                        <p>Axillary: {selectedProgress.skinfoldAxillary} mm</p>
                      )}
                      {selectedProgress.skinfoldSuprailiac && (
                        <p>Suprailiac: {selectedProgress.skinfoldSuprailiac} mm</p>
                      )}
                      {selectedProgress.skinfoldAbdominal && (
                        <p>Abdominal: {selectedProgress.skinfoldAbdominal} mm</p>
                      )}
                      {selectedProgress.skinfoldSubscapular && (
                        <p>Subscapular: {selectedProgress.skinfoldSubscapular} mm</p>
                      )}
                      {selectedProgress.skinfoldChest && (
                        <p>Chest: {selectedProgress.skinfoldChest} mm</p>
                      )}
                      {selectedProgress.skinfoldThigh && (
                        <p>Thigh: {selectedProgress.skinfoldThigh} mm</p>
                      )}
                      {selectedProgress.skinfoldCalf && (
                        <p>Calf: {selectedProgress.skinfoldCalf} mm</p>
                      )}
                    </div>
                  </div>
                )}
           

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

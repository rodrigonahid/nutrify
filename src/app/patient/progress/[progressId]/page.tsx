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

interface Progress {
  id: number;
  patientId: number;
  bodyFatPercentage: string | null;
  height: string | null;
  totalWeight: string | null;
  bmi: string | null;
  perimeterChest: string | null;
  perimeterShoulder: string | null;
  perimeterWaist: string | null;
  perimeterAbdomen: string | null;
  perimeterHip: string | null;
  perimeterBicepsLeftRelaxed: string | null;
  perimeterBicepsLeftContracted: string | null;
  perimeterBicepsRightRelaxed: string | null;
  perimeterBicepsRightContracted: string | null;
  perimeterForearmLeft: string | null;
  perimeterForearmRight: string | null;
  perimeterThighProximalLeft: string | null;
  perimeterThighProximalRight: string | null;
  perimeterThighMedialLeft: string | null;
  perimeterThighMedialRight: string | null;
  perimeterThighDistalLeft: string | null;
  perimeterThighDistalRight: string | null;
  perimeterCalfLeft: string | null;
  perimeterCalfRight: string | null;
  skinfoldBiceps: string | null;
  skinfoldTriceps: string | null;
  skinfoldAxillary: string | null;
  skinfoldSuprailiac: string | null;
  skinfoldAbdominal: string | null;
  skinfoldSubscapular: string | null;
  skinfoldChest: string | null;
  skinfoldThigh: string | null;
  skinfoldCalf: string | null;
  createdAt: string;
}

export default function PatientProgressDetailPage() {
  const params = useParams();
  const progressId = params.progressId as string;

  const [progress, setProgress] = useState<Progress | null>(null);
  const [previous, setPrevious] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProgress();
  }, [progressId]);

  async function fetchProgress() {
    try {
      const response = await fetch(`/api/patient/progress/${progressId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch progress");
      }
      const data = await response.json();
      setProgress(data.progress);
      setPrevious(data.previous);
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

  function calculateDelta(
    current: string | null,
    prev: string | null
  ): string | null {
    if (!current || !prev) return null;
    const delta = parseFloat(current) - parseFloat(prev);
    const sign = delta > 0 ? "+" : "";
    return `${sign}${delta.toFixed(2)}`;
  }

  function renderMeasurement(
    label: string,
    current: string | null,
    previous: string | null,
    unit: string
  ) {
    if (!current) return null;

    const delta = calculateDelta(current, previous);

    return (
      <div className="flex justify-between items-center py-2 border-b last:border-0">
        <span className="text-sm font-medium">{label}</span>
        <div className="text-sm">
          <span className="font-semibold">
            {current} {unit}
          </span>
          {delta && (
            <span
              className={`ml-2 text-xs ${
                parseFloat(delta) > 0
                  ? "text-orange-600"
                  : parseFloat(delta) < 0
                  ? "text-green-600"
                  : "text-muted-foreground"
              }`}
            >
              ({delta})
            </span>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Progress entry not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Progress Details</h1>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <Link
          href="/patient/progress"
          className="inline-block mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Progress
        </Link>
        {error && (
          <div className="mb-6 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            {formatDate(progress.createdAt)}
          </h2>
          {previous && (
            <p className="text-sm text-muted-foreground">
              Compared to previous entry on {formatDate(previous.createdAt)}
            </p>
          )}
        </div>

        <div className="space-y-6">
          {/* Body Composition */}
          <Card>
            <CardHeader>
              <CardTitle>Body Composition</CardTitle>
            </CardHeader>
            <CardContent>
              {renderMeasurement(
                "Body Fat Percentage",
                progress.bodyFatPercentage,
                previous?.bodyFatPercentage || null,
                "%"
              )}
              {renderMeasurement(
                "Height",
                progress.height,
                previous?.height || null,
                "m"
              )}
              {renderMeasurement(
                "Weight",
                progress.totalWeight,
                previous?.totalWeight || null,
                "kg"
              )}
              {renderMeasurement(
                "BMI",
                progress.bmi,
                previous?.bmi || null,
                ""
              )}
            </CardContent>
          </Card>

          {/* Perimeters - Trunk */}
          {(progress.perimeterChest ||
            progress.perimeterShoulder ||
            progress.perimeterWaist ||
            progress.perimeterAbdomen ||
            progress.perimeterHip) && (
            <Card>
              <CardHeader>
                <CardTitle>Perimeters - Trunk</CardTitle>
                <CardDescription>Measurements in centimeters</CardDescription>
              </CardHeader>
              <CardContent>
                {renderMeasurement(
                  "Chest",
                  progress.perimeterChest,
                  previous?.perimeterChest || null,
                  "cm"
                )}
                {renderMeasurement(
                  "Shoulder",
                  progress.perimeterShoulder,
                  previous?.perimeterShoulder || null,
                  "cm"
                )}
                {renderMeasurement(
                  "Waist",
                  progress.perimeterWaist,
                  previous?.perimeterWaist || null,
                  "cm"
                )}
                {renderMeasurement(
                  "Abdomen",
                  progress.perimeterAbdomen,
                  previous?.perimeterAbdomen || null,
                  "cm"
                )}
                {renderMeasurement(
                  "Hip",
                  progress.perimeterHip,
                  previous?.perimeterHip || null,
                  "cm"
                )}
              </CardContent>
            </Card>
          )}

          {/* Perimeters - Upper Limbs */}
          {(progress.perimeterBicepsLeftRelaxed ||
            progress.perimeterBicepsLeftContracted ||
            progress.perimeterBicepsRightRelaxed ||
            progress.perimeterBicepsRightContracted ||
            progress.perimeterForearmLeft ||
            progress.perimeterForearmRight) && (
            <Card>
              <CardHeader>
                <CardTitle>Perimeters - Upper Limbs (Arms)</CardTitle>
                <CardDescription>Measurements in centimeters</CardDescription>
              </CardHeader>
              <CardContent>
                {renderMeasurement(
                  "Biceps Left (Relaxed)",
                  progress.perimeterBicepsLeftRelaxed,
                  previous?.perimeterBicepsLeftRelaxed || null,
                  "cm"
                )}
                {renderMeasurement(
                  "Biceps Left (Contracted)",
                  progress.perimeterBicepsLeftContracted,
                  previous?.perimeterBicepsLeftContracted || null,
                  "cm"
                )}
                {renderMeasurement(
                  "Biceps Right (Relaxed)",
                  progress.perimeterBicepsRightRelaxed,
                  previous?.perimeterBicepsRightRelaxed || null,
                  "cm"
                )}
                {renderMeasurement(
                  "Biceps Right (Contracted)",
                  progress.perimeterBicepsRightContracted,
                  previous?.perimeterBicepsRightContracted || null,
                  "cm"
                )}
                {renderMeasurement(
                  "Forearm Left",
                  progress.perimeterForearmLeft,
                  previous?.perimeterForearmLeft || null,
                  "cm"
                )}
                {renderMeasurement(
                  "Forearm Right",
                  progress.perimeterForearmRight,
                  previous?.perimeterForearmRight || null,
                  "cm"
                )}
              </CardContent>
            </Card>
          )}

          {/* Perimeters - Lower Limbs */}
          {(progress.perimeterThighProximalLeft ||
            progress.perimeterThighProximalRight ||
            progress.perimeterThighMedialLeft ||
            progress.perimeterThighMedialRight ||
            progress.perimeterThighDistalLeft ||
            progress.perimeterThighDistalRight ||
            progress.perimeterCalfLeft ||
            progress.perimeterCalfRight) && (
            <Card>
              <CardHeader>
                <CardTitle>Perimeters - Lower Limbs (Legs)</CardTitle>
                <CardDescription>Measurements in centimeters</CardDescription>
              </CardHeader>
              <CardContent>
                {renderMeasurement(
                  "Thigh Proximal Left",
                  progress.perimeterThighProximalLeft,
                  previous?.perimeterThighProximalLeft || null,
                  "cm"
                )}
                {renderMeasurement(
                  "Thigh Proximal Right",
                  progress.perimeterThighProximalRight,
                  previous?.perimeterThighProximalRight || null,
                  "cm"
                )}
                {renderMeasurement(
                  "Thigh Medial Left",
                  progress.perimeterThighMedialLeft,
                  previous?.perimeterThighMedialLeft || null,
                  "cm"
                )}
                {renderMeasurement(
                  "Thigh Medial Right",
                  progress.perimeterThighMedialRight,
                  previous?.perimeterThighMedialRight || null,
                  "cm"
                )}
                {renderMeasurement(
                  "Thigh Distal Left",
                  progress.perimeterThighDistalLeft,
                  previous?.perimeterThighDistalLeft || null,
                  "cm"
                )}
                {renderMeasurement(
                  "Thigh Distal Right",
                  progress.perimeterThighDistalRight,
                  previous?.perimeterThighDistalRight || null,
                  "cm"
                )}
                {renderMeasurement(
                  "Calf Left",
                  progress.perimeterCalfLeft,
                  previous?.perimeterCalfLeft || null,
                  "cm"
                )}
                {renderMeasurement(
                  "Calf Right",
                  progress.perimeterCalfRight,
                  previous?.perimeterCalfRight || null,
                  "cm"
                )}
              </CardContent>
            </Card>
          )}

          {/* Skinfolds */}
          {(progress.skinfoldBiceps ||
            progress.skinfoldTriceps ||
            progress.skinfoldAxillary ||
            progress.skinfoldSuprailiac ||
            progress.skinfoldAbdominal ||
            progress.skinfoldSubscapular ||
            progress.skinfoldChest ||
            progress.skinfoldThigh ||
            progress.skinfoldCalf) && (
            <Card>
              <CardHeader>
                <CardTitle>Skinfolds</CardTitle>
                <CardDescription>Measurements in millimeters</CardDescription>
              </CardHeader>
              <CardContent>
                {renderMeasurement(
                  "Biceps",
                  progress.skinfoldBiceps,
                  previous?.skinfoldBiceps || null,
                  "mm"
                )}
                {renderMeasurement(
                  "Triceps",
                  progress.skinfoldTriceps,
                  previous?.skinfoldTriceps || null,
                  "mm"
                )}
                {renderMeasurement(
                  "Axillary",
                  progress.skinfoldAxillary,
                  previous?.skinfoldAxillary || null,
                  "mm"
                )}
                {renderMeasurement(
                  "Suprailiac",
                  progress.skinfoldSuprailiac,
                  previous?.skinfoldSuprailiac || null,
                  "mm"
                )}
                {renderMeasurement(
                  "Abdominal",
                  progress.skinfoldAbdominal,
                  previous?.skinfoldAbdominal || null,
                  "mm"
                )}
                {renderMeasurement(
                  "Subscapular",
                  progress.skinfoldSubscapular,
                  previous?.skinfoldSubscapular || null,
                  "mm"
                )}
                {renderMeasurement(
                  "Chest",
                  progress.skinfoldChest,
                  previous?.skinfoldChest || null,
                  "mm"
                )}
                {renderMeasurement(
                  "Thigh",
                  progress.skinfoldThigh,
                  previous?.skinfoldThigh || null,
                  "mm"
                )}
                {renderMeasurement(
                  "Calf",
                  progress.skinfoldCalf,
                  previous?.skinfoldCalf || null,
                  "mm"
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

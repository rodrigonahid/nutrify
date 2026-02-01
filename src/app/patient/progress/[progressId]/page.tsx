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
import { PageHeader } from "@/components/page-header";
import { DeltaIndicator } from "@/components/delta-indicator";
import { Progress } from "@/types/progress";


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

  function renderMeasurement(
    label: string,
    current: string | null,
    previous: string | null,
    unit: string
  ) {
    return (
      <div className="flex justify-between items-center py-2 border-b last:border-0">
        <span className="text-sm font-medium">{label}</span>
        <div className="text-sm flex items-center gap-2">
          {current ? (
            <>
              <span className="font-semibold">
                {current} {unit}
              </span>
              <DeltaIndicator
                current={current}
                previous={previous}
                unit={unit}
              />
            </>
          ) : (
            <span className="text-muted-foreground text-xs">Not recorded</span>
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
      <PageHeader title="Progress Details" />

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <Link
          href="/patient/progress"
          className="inline-block mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Progress
        </Link>
        {error && (
          <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
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
                "cm"
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

          {/* Perimeters - Upper Limbs */}
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

          {/* Perimeters - Lower Limbs */}
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

          {/* Skinfolds */}
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
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoutButton } from "@/components/logout-button";

interface ProgressFormData {
  // Body Composition
  bodyFatPercentage: string;
  height: string;
  totalWeight: string;
  bmi: string;

  // Perimeters - Trunk
  perimeterChest: string;
  perimeterShoulder: string;
  perimeterWaist: string;
  perimeterAbdomen: string;
  perimeterHip: string;

  // Perimeters - Upper Limbs
  perimeterBicepsLeftRelaxed: string;
  perimeterBicepsLeftContracted: string;
  perimeterBicepsRightRelaxed: string;
  perimeterBicepsRightContracted: string;
  perimeterForearmLeft: string;
  perimeterForearmRight: string;

  // Perimeters - Lower Limbs
  perimeterThighProximalLeft: string;
  perimeterThighProximalRight: string;
  perimeterThighMedialLeft: string;
  perimeterThighMedialRight: string;
  perimeterThighDistalLeft: string;
  perimeterThighDistalRight: string;
  perimeterCalfLeft: string;
  perimeterCalfRight: string;

  // Skinfolds
  skinfoldBiceps: string;
  skinfoldTriceps: string;
  skinfoldAxillary: string;
  skinfoldSuprailiac: string;
  skinfoldAbdominal: string;
  skinfoldSubscapular: string;
  skinfoldChest: string;
  skinfoldThigh: string;
  skinfoldCalf: string;
}

export default function CreateProgressPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [formData, setFormData] = useState<ProgressFormData>({
    bodyFatPercentage: "",
    height: "",
    totalWeight: "",
    bmi: "",
    perimeterChest: "",
    perimeterShoulder: "",
    perimeterWaist: "",
    perimeterAbdomen: "",
    perimeterHip: "",
    perimeterBicepsLeftRelaxed: "",
    perimeterBicepsLeftContracted: "",
    perimeterBicepsRightRelaxed: "",
    perimeterBicepsRightContracted: "",
    perimeterForearmLeft: "",
    perimeterForearmRight: "",
    perimeterThighProximalLeft: "",
    perimeterThighProximalRight: "",
    perimeterThighMedialLeft: "",
    perimeterThighMedialRight: "",
    perimeterThighDistalLeft: "",
    perimeterThighDistalRight: "",
    perimeterCalfLeft: "",
    perimeterCalfRight: "",
    skinfoldBiceps: "",
    skinfoldTriceps: "",
    skinfoldAxillary: "",
    skinfoldSuprailiac: "",
    skinfoldAbdominal: "",
    skinfoldSubscapular: "",
    skinfoldChest: "",
    skinfoldThigh: "",
    skinfoldCalf: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(field: keyof ProgressFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Convert string values to numbers, filtering out empty strings
      const payload: Record<string, number> = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "") {
          payload[key] = parseFloat(value);
        }
      });

      const response = await fetch(
        `/api/professional/patients/${patientId}/progress`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create progress entry");
      }

      // Redirect back to patient detail page
      router.push(`/professional/patients/${patientId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create progress entry"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/professional/patients/${patientId}`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Patient
            </Link>
            <h1 className="text-xl font-bold">Add Progress Entry</h1>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <div className="mb-6 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Body Composition */}
          <Card>
            <CardHeader>
              <CardTitle>Body Composition</CardTitle>
              <CardDescription>
                Basic measurements and body composition data
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bodyFatPercentage">Body Fat (%)</Label>
                <Input
                  id="bodyFatPercentage"
                  type="number"
                  step="0.01"
                  value={formData.bodyFatPercentage}
                  onChange={(e) =>
                    handleChange("bodyFatPercentage", e.target.value)
                  }
                  placeholder="8.50"
                />
              </div>
              <div>
                <Label htmlFor="height">Height (m)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.01"
                  value={formData.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                  placeholder="1.71"
                />
              </div>
              <div>
                <Label htmlFor="totalWeight">Weight (kg)</Label>
                <Input
                  id="totalWeight"
                  type="number"
                  step="0.01"
                  value={formData.totalWeight}
                  onChange={(e) => handleChange("totalWeight", e.target.value)}
                  placeholder="67.20"
                />
              </div>
              <div>
                <Label htmlFor="bmi">BMI</Label>
                <Input
                  id="bmi"
                  type="number"
                  step="0.01"
                  value={formData.bmi}
                  onChange={(e) => handleChange("bmi", e.target.value)}
                  placeholder="23.0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Perimeters - Trunk */}
          <Card>
            <CardHeader>
              <CardTitle>Perimeters - Trunk</CardTitle>
              <CardDescription>
                Circumference measurements in centimeters (cm)
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="perimeterChest">Chest</Label>
                <Input
                  id="perimeterChest"
                  type="number"
                  step="0.01"
                  value={formData.perimeterChest}
                  onChange={(e) =>
                    handleChange("perimeterChest", e.target.value)
                  }
                  placeholder="97.5"
                />
              </div>
              <div>
                <Label htmlFor="perimeterShoulder">Shoulder</Label>
                <Input
                  id="perimeterShoulder"
                  type="number"
                  step="0.01"
                  value={formData.perimeterShoulder}
                  onChange={(e) =>
                    handleChange("perimeterShoulder", e.target.value)
                  }
                  placeholder="115.0"
                />
              </div>
              <div>
                <Label htmlFor="perimeterWaist">Waist</Label>
                <Input
                  id="perimeterWaist"
                  type="number"
                  step="0.01"
                  value={formData.perimeterWaist}
                  onChange={(e) =>
                    handleChange("perimeterWaist", e.target.value)
                  }
                  placeholder="80.0"
                />
              </div>
              <div>
                <Label htmlFor="perimeterAbdomen">Abdomen</Label>
                <Input
                  id="perimeterAbdomen"
                  type="number"
                  step="0.01"
                  value={formData.perimeterAbdomen}
                  onChange={(e) =>
                    handleChange("perimeterAbdomen", e.target.value)
                  }
                  placeholder="82.0"
                />
              </div>
              <div>
                <Label htmlFor="perimeterHip">Hip</Label>
                <Input
                  id="perimeterHip"
                  type="number"
                  step="0.01"
                  value={formData.perimeterHip}
                  onChange={(e) => handleChange("perimeterHip", e.target.value)}
                  placeholder="92.0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Perimeters - Upper Limbs */}
          <Card>
            <CardHeader>
              <CardTitle>Perimeters - Upper Limbs (Arms)</CardTitle>
              <CardDescription>
                Arm circumferences in centimeters (cm)
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="perimeterBicepsLeftRelaxed">
                  Biceps Left (Relaxed)
                </Label>
                <Input
                  id="perimeterBicepsLeftRelaxed"
                  type="number"
                  step="0.01"
                  value={formData.perimeterBicepsLeftRelaxed}
                  onChange={(e) =>
                    handleChange("perimeterBicepsLeftRelaxed", e.target.value)
                  }
                  placeholder="30.0"
                />
              </div>
              <div>
                <Label htmlFor="perimeterBicepsLeftContracted">
                  Biceps Left (Contracted)
                </Label>
                <Input
                  id="perimeterBicepsLeftContracted"
                  type="number"
                  step="0.01"
                  value={formData.perimeterBicepsLeftContracted}
                  onChange={(e) =>
                    handleChange("perimeterBicepsLeftContracted", e.target.value)
                  }
                  placeholder="33.5"
                />
              </div>
              <div>
                <Label htmlFor="perimeterBicepsRightRelaxed">
                  Biceps Right (Relaxed)
                </Label>
                <Input
                  id="perimeterBicepsRightRelaxed"
                  type="number"
                  step="0.01"
                  value={formData.perimeterBicepsRightRelaxed}
                  onChange={(e) =>
                    handleChange("perimeterBicepsRightRelaxed", e.target.value)
                  }
                  placeholder="30.0"
                />
              </div>
              <div>
                <Label htmlFor="perimeterBicepsRightContracted">
                  Biceps Right (Contracted)
                </Label>
                <Input
                  id="perimeterBicepsRightContracted"
                  type="number"
                  step="0.01"
                  value={formData.perimeterBicepsRightContracted}
                  onChange={(e) =>
                    handleChange("perimeterBicepsRightContracted", e.target.value)
                  }
                  placeholder="32.5"
                />
              </div>
              <div>
                <Label htmlFor="perimeterForearmLeft">Forearm Left</Label>
                <Input
                  id="perimeterForearmLeft"
                  type="number"
                  step="0.01"
                  value={formData.perimeterForearmLeft}
                  onChange={(e) =>
                    handleChange("perimeterForearmLeft", e.target.value)
                  }
                  placeholder="27.0"
                />
              </div>
              <div>
                <Label htmlFor="perimeterForearmRight">Forearm Right</Label>
                <Input
                  id="perimeterForearmRight"
                  type="number"
                  step="0.01"
                  value={formData.perimeterForearmRight}
                  onChange={(e) =>
                    handleChange("perimeterForearmRight", e.target.value)
                  }
                  placeholder="27.0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Perimeters - Lower Limbs */}
          <Card>
            <CardHeader>
              <CardTitle>Perimeters - Lower Limbs (Legs)</CardTitle>
              <CardDescription>
                Leg circumferences in centimeters (cm)
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="perimeterThighProximalLeft">
                  Thigh Proximal Left
                </Label>
                <Input
                  id="perimeterThighProximalLeft"
                  type="number"
                  step="0.01"
                  value={formData.perimeterThighProximalLeft}
                  onChange={(e) =>
                    handleChange("perimeterThighProximalLeft", e.target.value)
                  }
                  placeholder="54.0"
                />
              </div>
              <div>
                <Label htmlFor="perimeterThighProximalRight">
                  Thigh Proximal Right
                </Label>
                <Input
                  id="perimeterThighProximalRight"
                  type="number"
                  step="0.01"
                  value={formData.perimeterThighProximalRight}
                  onChange={(e) =>
                    handleChange("perimeterThighProximalRight", e.target.value)
                  }
                  placeholder="54.5"
                />
              </div>
              <div>
                <Label htmlFor="perimeterThighMedialLeft">
                  Thigh Medial Left
                </Label>
                <Input
                  id="perimeterThighMedialLeft"
                  type="number"
                  step="0.01"
                  value={formData.perimeterThighMedialLeft}
                  onChange={(e) =>
                    handleChange("perimeterThighMedialLeft", e.target.value)
                  }
                  placeholder="51.0"
                />
              </div>
              <div>
                <Label htmlFor="perimeterThighMedialRight">
                  Thigh Medial Right
                </Label>
                <Input
                  id="perimeterThighMedialRight"
                  type="number"
                  step="0.01"
                  value={formData.perimeterThighMedialRight}
                  onChange={(e) =>
                    handleChange("perimeterThighMedialRight", e.target.value)
                  }
                  placeholder="52.5"
                />
              </div>
              <div>
                <Label htmlFor="perimeterThighDistalLeft">
                  Thigh Distal Left
                </Label>
                <Input
                  id="perimeterThighDistalLeft"
                  type="number"
                  step="0.01"
                  value={formData.perimeterThighDistalLeft}
                  onChange={(e) =>
                    handleChange("perimeterThighDistalLeft", e.target.value)
                  }
                  placeholder="47.0"
                />
              </div>
              <div>
                <Label htmlFor="perimeterThighDistalRight">
                  Thigh Distal Right
                </Label>
                <Input
                  id="perimeterThighDistalRight"
                  type="number"
                  step="0.01"
                  value={formData.perimeterThighDistalRight}
                  onChange={(e) =>
                    handleChange("perimeterThighDistalRight", e.target.value)
                  }
                  placeholder="47.5"
                />
              </div>
              <div>
                <Label htmlFor="perimeterCalfLeft">Calf Left</Label>
                <Input
                  id="perimeterCalfLeft"
                  type="number"
                  step="0.01"
                  value={formData.perimeterCalfLeft}
                  onChange={(e) =>
                    handleChange("perimeterCalfLeft", e.target.value)
                  }
                  placeholder="35.0"
                />
              </div>
              <div>
                <Label htmlFor="perimeterCalfRight">Calf Right</Label>
                <Input
                  id="perimeterCalfRight"
                  type="number"
                  step="0.01"
                  value={formData.perimeterCalfRight}
                  onChange={(e) =>
                    handleChange("perimeterCalfRight", e.target.value)
                  }
                  placeholder="35.3"
                />
              </div>
            </CardContent>
          </Card>

          {/* Skinfolds */}
          <Card>
            <CardHeader>
              <CardTitle>Skinfolds</CardTitle>
              <CardDescription>
                Skinfold measurements in millimeters (mm)
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="skinfoldBiceps">Biceps</Label>
                <Input
                  id="skinfoldBiceps"
                  type="number"
                  step="0.01"
                  value={formData.skinfoldBiceps}
                  onChange={(e) =>
                    handleChange("skinfoldBiceps", e.target.value)
                  }
                  placeholder="5.0"
                />
              </div>
              <div>
                <Label htmlFor="skinfoldTriceps">Triceps</Label>
                <Input
                  id="skinfoldTriceps"
                  type="number"
                  step="0.01"
                  value={formData.skinfoldTriceps}
                  onChange={(e) =>
                    handleChange("skinfoldTriceps", e.target.value)
                  }
                  placeholder="6.0"
                />
              </div>
              <div>
                <Label htmlFor="skinfoldAxillary">Axillary</Label>
                <Input
                  id="skinfoldAxillary"
                  type="number"
                  step="0.01"
                  value={formData.skinfoldAxillary}
                  onChange={(e) =>
                    handleChange("skinfoldAxillary", e.target.value)
                  }
                  placeholder="9.0"
                />
              </div>
              <div>
                <Label htmlFor="skinfoldSuprailiac">Suprailiac</Label>
                <Input
                  id="skinfoldSuprailiac"
                  type="number"
                  step="0.01"
                  value={formData.skinfoldSuprailiac}
                  onChange={(e) =>
                    handleChange("skinfoldSuprailiac", e.target.value)
                  }
                  placeholder="10.0"
                />
              </div>
              <div>
                <Label htmlFor="skinfoldAbdominal">Abdominal</Label>
                <Input
                  id="skinfoldAbdominal"
                  type="number"
                  step="0.01"
                  value={formData.skinfoldAbdominal}
                  onChange={(e) =>
                    handleChange("skinfoldAbdominal", e.target.value)
                  }
                  placeholder="14.0"
                />
              </div>
              <div>
                <Label htmlFor="skinfoldSubscapular">Subscapular</Label>
                <Input
                  id="skinfoldSubscapular"
                  type="number"
                  step="0.01"
                  value={formData.skinfoldSubscapular}
                  onChange={(e) =>
                    handleChange("skinfoldSubscapular", e.target.value)
                  }
                  placeholder="10.0"
                />
              </div>
              <div>
                <Label htmlFor="skinfoldChest">Chest</Label>
                <Input
                  id="skinfoldChest"
                  type="number"
                  step="0.01"
                  value={formData.skinfoldChest}
                  onChange={(e) => handleChange("skinfoldChest", e.target.value)}
                  placeholder="4.0"
                />
              </div>
              <div>
                <Label htmlFor="skinfoldThigh">Thigh</Label>
                <Input
                  id="skinfoldThigh"
                  type="number"
                  step="0.01"
                  value={formData.skinfoldThigh}
                  onChange={(e) => handleChange("skinfoldThigh", e.target.value)}
                  placeholder="10.0"
                />
              </div>
              <div>
                <Label htmlFor="skinfoldCalf">Calf</Label>
                <Input
                  id="skinfoldCalf"
                  type="number"
                  step="0.01"
                  value={formData.skinfoldCalf}
                  onChange={(e) => handleChange("skinfoldCalf", e.target.value)}
                  placeholder="4.0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push(`/professional/patients/${patientId}`)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating..." : "Create Progress Entry"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FormField } from "@/components/ui/form-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { z } from "zod";
import { progressSchema } from "@/lib/validation";

type ProgressFormData = z.infer<typeof progressSchema>;

interface ProgressFormFieldsProps {
  register: UseFormRegister<ProgressFormData>;
  errors: FieldErrors<ProgressFormData>;
  disabled?: boolean;
}

export function ProgressFormFields({
  register,
  errors,
  disabled = false,
}: ProgressFormFieldsProps) {
  return (
    <>
      {/* Body Composition */}
      <Card>
        <CardHeader>
          <CardTitle>Body Composition</CardTitle>
          <CardDescription>All measurements are optional</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Body Fat (%)"
            type="number"
            step="0.1"
            placeholder="e.g., 15.5"
            registration={register("bodyFatPercentage", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.bodyFatPercentage}
            hint="0-60%"
            disabled={disabled}
          />
          <FormField
            label="Height (m)"
            type="number"
            step="0.01"
            placeholder="e.g., 1.75"
            registration={register("height", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.height}
            hint="0.5-2.5 meters"
            disabled={disabled}
          />
          <FormField
            label="Weight (kg)"
            type="number"
            step="0.1"
            placeholder="e.g., 70.5"
            registration={register("totalWeight", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.totalWeight}
            hint="20-300 kg"
            disabled={disabled}
          />
          <FormField
            label="BMI"
            type="number"
            step="0.1"
            placeholder="e.g., 22.5"
            registration={register("bmi", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.bmi}
            hint="10-60"
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Perimeters - Trunk */}
      <Card>
        <CardHeader>
          <CardTitle>Perimeters - Trunk (cm)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField
            label="Chest"
            type="number"
            step="0.1"
            placeholder="e.g., 95"
            registration={register("perimeterChest", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.perimeterChest}
            hint="40-200 cm"
            disabled={disabled}
          />
          <FormField
            label="Shoulder"
            type="number"
            step="0.1"
            placeholder="e.g., 110"
            registration={register("perimeterShoulder", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.perimeterShoulder}
            hint="40-200 cm"
            disabled={disabled}
          />
          <FormField
            label="Waist"
            type="number"
            step="0.1"
            placeholder="e.g., 80"
            registration={register("perimeterWaist", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.perimeterWaist}
            hint="40-200 cm"
            disabled={disabled}
          />
          <FormField
            label="Abdomen"
            type="number"
            step="0.1"
            placeholder="e.g., 85"
            registration={register("perimeterAbdomen", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.perimeterAbdomen}
            hint="40-200 cm"
            disabled={disabled}
          />
          <FormField
            label="Hip"
            type="number"
            step="0.1"
            placeholder="e.g., 95"
            registration={register("perimeterHip", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.perimeterHip}
            hint="50-200 cm"
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Perimeters - Upper Limbs */}
      <Card>
        <CardHeader>
          <CardTitle>Perimeters - Upper Limbs (cm)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Biceps Left (Relaxed)"
            type="number"
            step="0.1"
            placeholder="e.g., 30"
            registration={register("perimeterBicepsLeftRelaxed", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.perimeterBicepsLeftRelaxed}
            hint="15-80 cm"
            disabled={disabled}
          />
          <FormField
            label="Biceps Right (Relaxed)"
            type="number"
            step="0.1"
            placeholder="e.g., 30"
            registration={register("perimeterBicepsRightRelaxed", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.perimeterBicepsRightRelaxed}
            hint="15-80 cm"
            disabled={disabled}
          />
          <FormField
            label="Biceps Left (Contracted)"
            type="number"
            step="0.1"
            placeholder="e.g., 32"
            registration={register("perimeterBicepsLeftContracted", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.perimeterBicepsLeftContracted}
            hint="15-80 cm"
            disabled={disabled}
          />
          <FormField
            label="Biceps Right (Contracted)"
            type="number"
            step="0.1"
            placeholder="e.g., 32"
            registration={register("perimeterBicepsRightContracted", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.perimeterBicepsRightContracted}
            hint="15-80 cm"
            disabled={disabled}
          />
          <FormField
            label="Forearm Left"
            type="number"
            step="0.1"
            placeholder="e.g., 26"
            registration={register("perimeterForearmLeft", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.perimeterForearmLeft}
            hint="15-60 cm"
            disabled={disabled}
          />
          <FormField
            label="Forearm Right"
            type="number"
            step="0.1"
            placeholder="e.g., 26"
            registration={register("perimeterForearmRight", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.perimeterForearmRight}
            hint="15-60 cm"
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Perimeters - Lower Limbs */}
      <Card>
        <CardHeader>
          <CardTitle>Perimeters - Lower Limbs (cm)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Thigh Proximal Left"
            type="number"
            step="0.1"
            placeholder="e.g., 55"
            registration={register("perimeterThighProximalLeft", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.perimeterThighProximalLeft}
            hint="30-120 cm"
            disabled={disabled}
          />
          <FormField
            label="Thigh Proximal Right"
            type="number"
            step="0.1"
            placeholder="e.g., 55"
            registration={register("perimeterThighProximalRight", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.perimeterThighProximalRight}
            hint="30-120 cm"
            disabled={disabled}
          />
          <FormField
            label="Thigh Medial Left"
            type="number"
            step="0.1"
            placeholder="e.g., 50"
            registration={register("perimeterThighMedialLeft", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.perimeterThighMedialLeft}
            hint="30-120 cm"
            disabled={disabled}
          />
          <FormField
            label="Thigh Medial Right"
            type="number"
            step="0.1"
            placeholder="e.g., 50"
            registration={register("perimeterThighMedialRight", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.perimeterThighMedialRight}
            hint="30-120 cm"
            disabled={disabled}
          />
          <FormField
            label="Thigh Distal Left"
            type="number"
            step="0.1"
            placeholder="e.g., 45"
            registration={register("perimeterThighDistalLeft", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.perimeterThighDistalLeft}
            hint="30-120 cm"
            disabled={disabled}
          />
          <FormField
            label="Thigh Distal Right"
            type="number"
            step="0.1"
            placeholder="e.g., 45"
            registration={register("perimeterThighDistalRight", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.perimeterThighDistalRight}
            hint="30-120 cm"
            disabled={disabled}
          />
          <FormField
            label="Calf Left"
            type="number"
            step="0.1"
            placeholder="e.g., 36"
            registration={register("perimeterCalfLeft", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.perimeterCalfLeft}
            hint="20-70 cm"
            disabled={disabled}
          />
          <FormField
            label="Calf Right"
            type="number"
            step="0.1"
            placeholder="e.g., 36"
            registration={register("perimeterCalfRight", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.perimeterCalfRight}
            hint="20-70 cm"
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Skinfolds */}
      <Card>
        <CardHeader>
          <CardTitle>Skinfolds (mm)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField
            label="Biceps"
            type="number"
            step="0.1"
            placeholder="e.g., 5.5"
            registration={register("skinfoldBiceps", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.skinfoldBiceps}
            hint="0-50 mm"
            disabled={disabled}
          />
          <FormField
            label="Triceps"
            type="number"
            step="0.1"
            placeholder="e.g., 12.5"
            registration={register("skinfoldTriceps", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.skinfoldTriceps}
            hint="0-50 mm"
            disabled={disabled}
          />
          <FormField
            label="Axillary"
            type="number"
            step="0.1"
            placeholder="e.g., 10"
            registration={register("skinfoldAxillary", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.skinfoldAxillary}
            hint="0-50 mm"
            disabled={disabled}
          />
          <FormField
            label="Suprailiac"
            type="number"
            step="0.1"
            placeholder="e.g., 15"
            registration={register("skinfoldSuprailiac", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.skinfoldSuprailiac}
            hint="0-50 mm"
            disabled={disabled}
          />
          <FormField
            label="Abdominal"
            type="number"
            step="0.1"
            placeholder="e.g., 20"
            registration={register("skinfoldAbdominal", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.skinfoldAbdominal}
            hint="0-50 mm"
            disabled={disabled}
          />
          <FormField
            label="Subscapular"
            type="number"
            step="0.1"
            placeholder="e.g., 12"
            registration={register("skinfoldSubscapular", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.skinfoldSubscapular}
            hint="0-50 mm"
            disabled={disabled}
          />
          <FormField
            label="Chest"
            type="number"
            step="0.1"
            placeholder="e.g., 8"
            registration={register("skinfoldChest", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.skinfoldChest}
            hint="0-50 mm"
            disabled={disabled}
          />
          <FormField
            label="Thigh"
            type="number"
            step="0.1"
            placeholder="e.g., 18"
            registration={register("skinfoldThigh", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.skinfoldThigh}
            hint="0-50 mm"
            disabled={disabled}
          />
          <FormField
            label="Calf"
            type="number"
            step="0.1"
            placeholder="e.g., 10"
            registration={register("skinfoldCalf", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.skinfoldCalf}
            hint="0-50 mm"
            disabled={disabled}
          />
        </CardContent>
      </Card>
    </>
  );
}

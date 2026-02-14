"use client";

import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import { FormField } from "@/components/ui/form-field";
import { z } from "zod";
import { progressSchema } from "@/lib/validation";
import { Progress } from "@/types/progress";

type ProgressFormData = z.infer<typeof progressSchema>;

interface ProgressFormFieldsProps {
  register: UseFormRegister<ProgressFormData>;
  errors: FieldErrors<ProgressFormData>;
  disabled?: boolean;
  previousProgress?: Progress | null;
  watch: UseFormWatch<ProgressFormData>;
}

function Section({
  title,
  subtitle,
  cols = 2,
  children,
}: {
  title: string;
  subtitle?: string;
  cols?: 2 | 3;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#F3F4F6]">
        <p className="text-[14px] font-semibold text-[#111827]">{title}</p>
        {subtitle && (
          <p className="text-[12px] text-[#9CA3AF] mt-0.5">{subtitle}</p>
        )}
      </div>
      <div
        className={
          cols === 3
            ? "p-4 grid grid-cols-2 sm:grid-cols-3 gap-4"
            : "p-4 grid grid-cols-2 gap-4"
        }
      >
        {children}
      </div>
    </div>
  );
}

export function ProgressFormFields({
  register,
  errors,
  disabled = false,
  previousProgress,
  watch,
}: ProgressFormFieldsProps) {
  const formValues = watch();

  return (
    <div className="space-y-4">

      {/* Body Composition */}
      <Section title="Body Composition" subtitle="All measurements are optional">
        <FormField
          label="Body Fat (%)"
          type="number"
          step="0.1"
          placeholder="e.g., 15.5"
          registration={register("bodyFatPercentage", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.bodyFatPercentage}
          previousValue={previousProgress?.bodyFatPercentage ? `${previousProgress.bodyFatPercentage}%` : null}
          currentValue={formValues.bodyFatPercentage}
          unit="%"
          disabled={disabled}
        />
        <FormField
          label="Height (cm)"
          type="number"
          step="1"
          placeholder="e.g., 175"
          registration={register("height", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.height}
          previousValue={previousProgress?.height ? `${previousProgress.height} cm` : null}
          currentValue={formValues.height}
          unit="cm"
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
          previousValue={previousProgress?.totalWeight ? `${previousProgress.totalWeight} kg` : null}
          currentValue={formValues.totalWeight}
          unit="kg"
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
          previousValue={previousProgress?.bmi || null}
          currentValue={formValues.bmi}
          disabled={disabled}
        />
      </Section>

      {/* Perimeters - Trunk */}
      <Section title="Perimeters — Trunk (cm)" cols={3}>
        <FormField
          label="Chest"
          type="number"
          step="1"
          placeholder="e.g., 95"
          registration={register("perimeterChest", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.perimeterChest}
          previousValue={previousProgress?.perimeterChest ? `${previousProgress.perimeterChest} cm` : null}
          currentValue={formValues.perimeterChest}
          unit="cm"
          disabled={disabled}
        />
        <FormField
          label="Shoulder"
          type="number"
          step="1"
          placeholder="e.g., 110"
          registration={register("perimeterShoulder", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.perimeterShoulder}
          previousValue={previousProgress?.perimeterShoulder ? `${previousProgress.perimeterShoulder} cm` : null}
          currentValue={formValues.perimeterShoulder}
          unit="cm"
          disabled={disabled}
        />
        <FormField
          label="Waist"
          type="number"
          step="1"
          placeholder="e.g., 80"
          registration={register("perimeterWaist", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.perimeterWaist}
          previousValue={previousProgress?.perimeterWaist ? `${previousProgress.perimeterWaist} cm` : null}
          currentValue={formValues.perimeterWaist}
          unit="cm"
          disabled={disabled}
        />
        <FormField
          label="Abdomen"
          type="number"
          step="1"
          placeholder="e.g., 85"
          registration={register("perimeterAbdomen", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.perimeterAbdomen}
          previousValue={previousProgress?.perimeterAbdomen ? `${previousProgress.perimeterAbdomen} cm` : null}
          currentValue={formValues.perimeterAbdomen}
          unit="cm"
          disabled={disabled}
        />
        <FormField
          label="Hip"
          type="number"
          step="1"
          placeholder="e.g., 95"
          registration={register("perimeterHip", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.perimeterHip}
          previousValue={previousProgress?.perimeterHip ? `${previousProgress.perimeterHip} cm` : null}
          currentValue={formValues.perimeterHip}
          unit="cm"
          disabled={disabled}
        />
      </Section>

      {/* Perimeters - Upper Limbs */}
      <Section title="Perimeters — Upper Limbs (cm)">
        <FormField
          label="Biceps Left (Relaxed)"
          type="number"
          step="1"
          placeholder="e.g., 30"
          registration={register("perimeterBicepsLeftRelaxed", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.perimeterBicepsLeftRelaxed}
          previousValue={previousProgress?.perimeterBicepsLeftRelaxed ? `${previousProgress.perimeterBicepsLeftRelaxed} cm` : null}
          currentValue={formValues.perimeterBicepsLeftRelaxed}
          unit="cm"
          disabled={disabled}
        />
        <FormField
          label="Biceps Right (Relaxed)"
          type="number"
          step="1"
          placeholder="e.g., 30"
          registration={register("perimeterBicepsRightRelaxed", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.perimeterBicepsRightRelaxed}
          previousValue={previousProgress?.perimeterBicepsRightRelaxed ? `${previousProgress.perimeterBicepsRightRelaxed} cm` : null}
          currentValue={formValues.perimeterBicepsRightRelaxed}
          unit="cm"
          disabled={disabled}
        />
        <FormField
          label="Biceps Left (Contracted)"
          type="number"
          step="1"
          placeholder="e.g., 32"
          registration={register("perimeterBicepsLeftContracted", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.perimeterBicepsLeftContracted}
          previousValue={previousProgress?.perimeterBicepsLeftContracted ? `${previousProgress.perimeterBicepsLeftContracted} cm` : null}
          currentValue={formValues.perimeterBicepsLeftContracted}
          unit="cm"
          disabled={disabled}
        />
        <FormField
          label="Biceps Right (Contracted)"
          type="number"
          step="1"
          placeholder="e.g., 32"
          registration={register("perimeterBicepsRightContracted", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.perimeterBicepsRightContracted}
          previousValue={previousProgress?.perimeterBicepsRightContracted ? `${previousProgress.perimeterBicepsRightContracted} cm` : null}
          currentValue={formValues.perimeterBicepsRightContracted}
          unit="cm"
          disabled={disabled}
        />
        <FormField
          label="Forearm Left"
          type="number"
          step="1"
          placeholder="e.g., 26"
          registration={register("perimeterForearmLeft", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.perimeterForearmLeft}
          previousValue={previousProgress?.perimeterForearmLeft ? `${previousProgress.perimeterForearmLeft} cm` : null}
          currentValue={formValues.perimeterForearmLeft}
          unit="cm"
          disabled={disabled}
        />
        <FormField
          label="Forearm Right"
          type="number"
          step="1"
          placeholder="e.g., 26"
          registration={register("perimeterForearmRight", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.perimeterForearmRight}
          previousValue={previousProgress?.perimeterForearmRight ? `${previousProgress.perimeterForearmRight} cm` : null}
          currentValue={formValues.perimeterForearmRight}
          unit="cm"
          disabled={disabled}
        />
      </Section>

      {/* Perimeters - Lower Limbs */}
      <Section title="Perimeters — Lower Limbs (cm)">
        <FormField
          label="Thigh Proximal Left"
          type="number"
          step="1"
          placeholder="e.g., 55"
          registration={register("perimeterThighProximalLeft", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.perimeterThighProximalLeft}
          previousValue={previousProgress?.perimeterThighProximalLeft ? `${previousProgress.perimeterThighProximalLeft} cm` : null}
          currentValue={formValues.perimeterThighProximalLeft}
          unit="cm"
          disabled={disabled}
        />
        <FormField
          label="Thigh Proximal Right"
          type="number"
          step="1"
          placeholder="e.g., 55"
          registration={register("perimeterThighProximalRight", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.perimeterThighProximalRight}
          previousValue={previousProgress?.perimeterThighProximalRight ? `${previousProgress.perimeterThighProximalRight} cm` : null}
          currentValue={formValues.perimeterThighProximalRight}
          unit="cm"
          disabled={disabled}
        />
        <FormField
          label="Thigh Medial Left"
          type="number"
          step="1"
          placeholder="e.g., 50"
          registration={register("perimeterThighMedialLeft", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.perimeterThighMedialLeft}
          previousValue={previousProgress?.perimeterThighMedialLeft ? `${previousProgress.perimeterThighMedialLeft} cm` : null}
          currentValue={formValues.perimeterThighMedialLeft}
          unit="cm"
          disabled={disabled}
        />
        <FormField
          label="Thigh Medial Right"
          type="number"
          step="1"
          placeholder="e.g., 50"
          registration={register("perimeterThighMedialRight", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.perimeterThighMedialRight}
          previousValue={previousProgress?.perimeterThighMedialRight ? `${previousProgress.perimeterThighMedialRight} cm` : null}
          currentValue={formValues.perimeterThighMedialRight}
          unit="cm"
          disabled={disabled}
        />
        <FormField
          label="Thigh Distal Left"
          type="number"
          step="1"
          placeholder="e.g., 45"
          registration={register("perimeterThighDistalLeft", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.perimeterThighDistalLeft}
          previousValue={previousProgress?.perimeterThighDistalLeft ? `${previousProgress.perimeterThighDistalLeft} cm` : null}
          currentValue={formValues.perimeterThighDistalLeft}
          unit="cm"
          disabled={disabled}
        />
        <FormField
          label="Thigh Distal Right"
          type="number"
          step="1"
          placeholder="e.g., 45"
          registration={register("perimeterThighDistalRight", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.perimeterThighDistalRight}
          previousValue={previousProgress?.perimeterThighDistalRight ? `${previousProgress.perimeterThighDistalRight} cm` : null}
          currentValue={formValues.perimeterThighDistalRight}
          unit="cm"
          disabled={disabled}
        />
        <FormField
          label="Calf Left"
          type="number"
          step="1"
          placeholder="e.g., 36"
          registration={register("perimeterCalfLeft", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.perimeterCalfLeft}
          previousValue={previousProgress?.perimeterCalfLeft ? `${previousProgress.perimeterCalfLeft} cm` : null}
          currentValue={formValues.perimeterCalfLeft}
          unit="cm"
          disabled={disabled}
        />
        <FormField
          label="Calf Right"
          type="number"
          step="1"
          placeholder="e.g., 36"
          registration={register("perimeterCalfRight", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.perimeterCalfRight}
          previousValue={previousProgress?.perimeterCalfRight ? `${previousProgress.perimeterCalfRight} cm` : null}
          currentValue={formValues.perimeterCalfRight}
          unit="cm"
          disabled={disabled}
        />
      </Section>

      {/* Skinfolds */}
      <Section title="Skinfolds (mm)" cols={3}>
        <FormField
          label="Biceps"
          type="number"
          step="0.1"
          placeholder="e.g., 5.5"
          registration={register("skinfoldBiceps", {
            setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
          })}
          error={errors.skinfoldBiceps}
          previousValue={previousProgress?.skinfoldBiceps ? `${previousProgress.skinfoldBiceps} mm` : null}
          currentValue={formValues.skinfoldBiceps}
          unit="mm"
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
          previousValue={previousProgress?.skinfoldTriceps ? `${previousProgress.skinfoldTriceps} mm` : null}
          currentValue={formValues.skinfoldTriceps}
          unit="mm"
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
          previousValue={previousProgress?.skinfoldAxillary ? `${previousProgress.skinfoldAxillary} mm` : null}
          currentValue={formValues.skinfoldAxillary}
          unit="mm"
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
          previousValue={previousProgress?.skinfoldSuprailiac ? `${previousProgress.skinfoldSuprailiac} mm` : null}
          currentValue={formValues.skinfoldSuprailiac}
          unit="mm"
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
          previousValue={previousProgress?.skinfoldAbdominal ? `${previousProgress.skinfoldAbdominal} mm` : null}
          currentValue={formValues.skinfoldAbdominal}
          unit="mm"
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
          previousValue={previousProgress?.skinfoldSubscapular ? `${previousProgress.skinfoldSubscapular} mm` : null}
          currentValue={formValues.skinfoldSubscapular}
          unit="mm"
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
          previousValue={previousProgress?.skinfoldChest ? `${previousProgress.skinfoldChest} mm` : null}
          currentValue={formValues.skinfoldChest}
          unit="mm"
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
          previousValue={previousProgress?.skinfoldThigh ? `${previousProgress.skinfoldThigh} mm` : null}
          currentValue={formValues.skinfoldThigh}
          unit="mm"
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
          previousValue={previousProgress?.skinfoldCalf ? `${previousProgress.skinfoldCalf} mm` : null}
          currentValue={formValues.skinfoldCalf}
          unit="mm"
          disabled={disabled}
        />
      </Section>

    </div>
  );
}

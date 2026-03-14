"use client";

import { useState } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import { FormField } from "@/components/ui/form-field";
import { z } from "zod";
import { progressSchema } from "@/lib/validation";
import { Progress } from "@/types/progress";
import { ChevronDown, Scale, Ruler, Scissors } from "lucide-react";

type ProgressFormData = z.infer<typeof progressSchema>;
type SubSection = "trunk" | "upper" | "lower" | null;
type MainSection = "composition" | "perimeters" | "skinfolds" | null;

interface ProgressFormFieldsProps {
  register: UseFormRegister<ProgressFormData>;
  errors: FieldErrors<ProgressFormData>;
  disabled?: boolean;
  previousProgress?: Progress | null;
  watch: UseFormWatch<ProgressFormData>;
}

function AccordionSection({
  icon,
  title,
  open,
  onToggle,
  children,
  isLast = false,
}: {
  icon: React.ReactNode;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-3">
      {/* Timeline icon + vertical connector */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={onToggle}
          className="w-9 h-9 rounded-full bg-[#2E8B5A] flex items-center justify-center text-white shrink-0 hover:bg-[#277A4F] transition-colors duration-150"
          aria-label={open ? "Recolher seção" : "Expandir seção"}
        >
          {icon}
        </button>
        {!isLast && (
          <div className="w-px flex-1 bg-[#E5E7EB] mt-1 min-h-6" />
        )}
      </div>

      {/* Section card */}
      <div className="flex-1 pb-3">
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={onToggle}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#FAFAFA] transition-colors duration-150"
          >
            <p className="text-[14px] font-semibold text-[#111827]">{title}</p>
            <ChevronDown
              size={15}
              className="text-[#9CA3AF] shrink-0 transition-transform duration-200 ease-out"
              style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          <div
            style={{
              display: "grid",
              gridTemplateRows: open ? "1fr" : "0fr",
              transition: "grid-template-rows 200ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div className="overflow-hidden">
              <div className="border-t border-[#F3F4F6]">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubSection({
  label,
  open,
  onToggle,
  children,
  isLast = false,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className={!isLast ? "border-b border-[#F3F4F6]" : undefined}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-[13px] font-medium text-[#2E8B5A]">{label}</span>
        <ChevronDown
          size={14}
          className="text-[#9CA3AF] shrink-0 transition-transform duration-200 ease-out"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 180ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function SideGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-[12px] font-semibold text-[#374151] mb-2">{label}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
  const [activeSection, setActiveSection] = useState<MainSection>("composition");
  const [activeSubSection, setActiveSubSection] = useState<SubSection>("trunk");

  function toggleMain(section: Exclude<MainSection, null>) {
    setActiveSection((prev) => (prev === section ? null : section));
  }

  function toggleSub(sub: SubSection) {
    setActiveSubSection((prev) => (prev === sub ? null : sub));
  }

  return (
    <div>
      {/* 1. Composição Corporal */}
      <AccordionSection icon={<Scale size={16} />} title="Composição Corporal" open={activeSection === "composition"} onToggle={() => toggleMain("composition")}>
        <div className="p-4 grid grid-cols-2 gap-4">
          <FormField
            label="Gordura corporal (%)"
            type="number"
            step="0.1"
            placeholder="ex: 15.5"
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
            label="Altura (cm)"
            type="number"
            step="1"
            placeholder="ex: 175"
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
            label="Peso (kg)"
            type="number"
            step="0.1"
            placeholder="ex: 70.5"
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
            label="IMC"
            type="number"
            step="0.1"
            placeholder="ex: 22.5"
            registration={register("bmi", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.bmi}
            previousValue={previousProgress?.bmi || null}
            currentValue={formValues.bmi}
            disabled={disabled}
          />
        </div>
      </AccordionSection>

      {/* 2. Circunferências — single section with 3 nested sub-sections */}
      <AccordionSection icon={<Ruler size={16} />} title="Circunferências (cm)" open={activeSection === "perimeters"} onToggle={() => toggleMain("perimeters")}>
        {/* Tronco */}
        <SubSection
          label="Circunferências do tronco"
          open={activeSubSection === "trunk"}
          onToggle={() => toggleSub("trunk")}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <FormField
              label="Pescoço"
              type="number"
              step="1"
              placeholder="ex: 38"
              registration={register("perimeterNeck", {
                setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
              })}
              error={errors.perimeterNeck}
              previousValue={previousProgress?.perimeterNeck ? `${previousProgress.perimeterNeck} cm` : null}
              currentValue={formValues.perimeterNeck}
              unit="cm"
              disabled={disabled}
            />
            <FormField
              label="Ombros"
              type="number"
              step="1"
              placeholder="ex: 110"
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
              label="Peitoral"
              type="number"
              step="1"
              placeholder="ex: 95"
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
              label="Abdômen"
              type="number"
              step="1"
              placeholder="ex: 85"
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
              label="Cintura"
              type="number"
              step="1"
              placeholder="ex: 80"
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
              label="Quadril"
              type="number"
              step="1"
              placeholder="ex: 95"
              registration={register("perimeterHip", {
                setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
              })}
              error={errors.perimeterHip}
              previousValue={previousProgress?.perimeterHip ? `${previousProgress.perimeterHip} cm` : null}
              currentValue={formValues.perimeterHip}
              unit="cm"
              disabled={disabled}
            />
          </div>
        </SubSection>

        {/* Membros Superiores */}
        <SubSection
          label="Circunferências dos membros superiores"
          open={activeSubSection === "upper"}
          onToggle={() => toggleSub("upper")}
        >
          <SideGroup label="Lado direito">
            <FormField
              label="Bíceps relax."
              type="number"
              step="1"
              placeholder="ex: 30"
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
              label="Bíceps cont."
              type="number"
              step="1"
              placeholder="ex: 32"
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
              label="Antebraço"
              type="number"
              step="1"
              placeholder="ex: 26"
              registration={register("perimeterForearmRight", {
                setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
              })}
              error={errors.perimeterForearmRight}
              previousValue={previousProgress?.perimeterForearmRight ? `${previousProgress.perimeterForearmRight} cm` : null}
              currentValue={formValues.perimeterForearmRight}
              unit="cm"
              disabled={disabled}
            />
            <FormField
              label="Punho"
              type="number"
              step="1"
              placeholder="ex: 17"
              registration={register("perimeterWristRight", {
                setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
              })}
              error={errors.perimeterWristRight}
              previousValue={previousProgress?.perimeterWristRight ? `${previousProgress.perimeterWristRight} cm` : null}
              currentValue={formValues.perimeterWristRight}
              unit="cm"
              disabled={disabled}
            />
          </SideGroup>
          <SideGroup label="Lado esquerdo">
            <FormField
              label="Bíceps relax."
              type="number"
              step="1"
              placeholder="ex: 30"
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
              label="Bíceps cont."
              type="number"
              step="1"
              placeholder="ex: 32"
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
              label="Antebraço"
              type="number"
              step="1"
              placeholder="ex: 26"
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
              label="Punho"
              type="number"
              step="1"
              placeholder="ex: 17"
              registration={register("perimeterWristLeft", {
                setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
              })}
              error={errors.perimeterWristLeft}
              previousValue={previousProgress?.perimeterWristLeft ? `${previousProgress.perimeterWristLeft} cm` : null}
              currentValue={formValues.perimeterWristLeft}
              unit="cm"
              disabled={disabled}
            />
          </SideGroup>
        </SubSection>

        {/* Membros Inferiores */}
        <SubSection
          label="Circunferências dos membros inferiores"
          open={activeSubSection === "lower"}
          onToggle={() => toggleSub("lower")}
          isLast
        >
          <SideGroup label="Lado direito">
            <FormField
              label="Coxa prox."
              type="number"
              step="1"
              placeholder="ex: 55"
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
              label="Coxa medial"
              type="number"
              step="1"
              placeholder="ex: 50"
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
              label="Coxa distal"
              type="number"
              step="1"
              placeholder="ex: 45"
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
              label="Panturrilha"
              type="number"
              step="1"
              placeholder="ex: 36"
              registration={register("perimeterCalfRight", {
                setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
              })}
              error={errors.perimeterCalfRight}
              previousValue={previousProgress?.perimeterCalfRight ? `${previousProgress.perimeterCalfRight} cm` : null}
              currentValue={formValues.perimeterCalfRight}
              unit="cm"
              disabled={disabled}
            />
          </SideGroup>
          <SideGroup label="Lado esquerdo">
            <FormField
              label="Coxa prox."
              type="number"
              step="1"
              placeholder="ex: 55"
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
              label="Coxa medial"
              type="number"
              step="1"
              placeholder="ex: 50"
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
              label="Coxa distal"
              type="number"
              step="1"
              placeholder="ex: 45"
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
              label="Panturrilha"
              type="number"
              step="1"
              placeholder="ex: 36"
              registration={register("perimeterCalfLeft", {
                setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
              })}
              error={errors.perimeterCalfLeft}
              previousValue={previousProgress?.perimeterCalfLeft ? `${previousProgress.perimeterCalfLeft} cm` : null}
              currentValue={formValues.perimeterCalfLeft}
              unit="cm"
              disabled={disabled}
            />
          </SideGroup>
        </SubSection>
      </AccordionSection>

      {/* 3. Dobras Cutâneas */}
      <AccordionSection icon={<Scissors size={16} />} title="Dobras Cutâneas (mm)" open={activeSection === "skinfolds"} onToggle={() => toggleMain("skinfolds")} isLast>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <FormField
            label="Bíceps"
            type="number"
            step="0.1"
            placeholder="ex: 5.5"
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
            label="Tríceps"
            type="number"
            step="0.1"
            placeholder="ex: 12.5"
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
            label="Axilar Média"
            type="number"
            step="0.1"
            placeholder="ex: 10"
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
            label="Suprailíaca"
            type="number"
            step="0.1"
            placeholder="ex: 15"
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
            placeholder="ex: 20"
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
            label="Subescapular"
            type="number"
            step="0.1"
            placeholder="ex: 12"
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
            label="Torácica"
            type="number"
            step="0.1"
            placeholder="ex: 8"
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
            label="Coxa"
            type="number"
            step="0.1"
            placeholder="ex: 18"
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
            label="Panturrilha"
            type="number"
            step="0.1"
            placeholder="ex: 10"
            registration={register("skinfoldCalf", {
              setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
            })}
            error={errors.skinfoldCalf}
            previousValue={previousProgress?.skinfoldCalf ? `${previousProgress.skinfoldCalf} mm` : null}
            currentValue={formValues.skinfoldCalf}
            unit="mm"
            disabled={disabled}
          />
        </div>
      </AccordionSection>
    </div>
  );
}

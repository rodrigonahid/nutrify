"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Loader2, Trash2 } from "lucide-react";
import { progressSchema } from "@/lib/validation";
import { ProgressFormFields } from "@/components/progress-form-fields";
import { ProgressImages } from "@/components/progress-images";
import { Progress, ProgressImage } from "@/types";

type ProgressFormData = z.infer<typeof progressSchema>;

type SaveStatus = "idle" | "pending" | "saving" | "saved";

function fmt(val: number | undefined | null, decimals = 1): string {
  if (val == null) return "—";
  return Number.isInteger(val) ? String(val) : val.toFixed(decimals);
}

function Delta({ current, prev }: { current: number | null | undefined; prev: number | null }) {
  if (current == null || prev == null) return null;
  const d = +(current - prev).toFixed(2);
  if (d === 0) return null;
  return (
    <span className="text-[11px] font-medium ml-1 text-[#9CA3AF]">
      {d > 0 ? `+${d}` : d}
    </span>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  if (status === "pending") return <span className="text-[12px] text-[#9CA3AF]">Alterações não salvas</span>;
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-[#9CA3AF]">
        <Loader2 size={12} className="animate-spin" />
        Salvando…
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-[#16A34A]">
      <Check size={12} />
      Salvo
    </span>
  );
}

export default function EditProgressPage() {
  const { patientId, progressId } = useParams<{ patientId: string; progressId: string }>();
  const router = useRouter();

  const [initializing, setInitializing] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [updatePatientProfile, setUpdatePatientProfile] = useState(true);
  const [lastProgress, setLastProgress] = useState<Progress | null>(null);
  const [images, setImages] = useState<ProgressImage[]>([]);

  const isReadyRef = useRef(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
  });

  useEffect(() => {
    async function init() {
      try {
        const [entryRes, listRes, imagesRes] = await Promise.all([
          fetch(`/api/professional/patients/${patientId}/progress/${progressId}`),
          fetch(`/api/professional/patients/${patientId}/progress`),
          fetch(`/api/professional/patients/${patientId}/progress/${progressId}/images`),
        ]);

        if (!entryRes.ok) {
          setError("Registro não encontrado.");
          return;
        }

        const { progress: entry } = await entryRes.json();

        // Build form defaults from existing entry values
        const defaults: Partial<ProgressFormData> = {};
        const numericFields: (keyof ProgressFormData)[] = [
          "bodyFatPercentage", "height", "totalWeight", "bmi",
          "perimeterNeck", "perimeterChest", "perimeterShoulder", "perimeterWaist",
          "perimeterAbdomen", "perimeterHip",
          "perimeterBicepsLeftRelaxed", "perimeterBicepsLeftContracted",
          "perimeterBicepsRightRelaxed", "perimeterBicepsRightContracted",
          "perimeterForearmLeft", "perimeterForearmRight",
          "perimeterWristLeft", "perimeterWristRight",
          "perimeterThighProximalLeft", "perimeterThighProximalRight",
          "perimeterThighMedialLeft", "perimeterThighMedialRight",
          "perimeterThighDistalLeft", "perimeterThighDistalRight",
          "perimeterCalfLeft", "perimeterCalfRight",
          "skinfoldBiceps", "skinfoldTriceps", "skinfoldAxillary", "skinfoldSuprailiac",
          "skinfoldAbdominal", "skinfoldSubscapular", "skinfoldChest", "skinfoldThigh", "skinfoldCalf",
        ];
        for (const key of numericFields) {
          const val = entry[key];
          if (val != null) (defaults as Record<string, unknown>)[key] = parseFloat(val);
        }

        reset(defaults);

        // Find the previous published entry for comparison
        if (listRes.ok) {
          const { progress: list } = await listRes.json();
          const published = (list as Progress[]).filter((p) => !p.isDraft && p.id !== entry.id);
          if (published.length > 0) setLastProgress(published[0]);
        }

        if (imagesRes.ok) {
          const { images: imgs } = await imagesRes.json();
          setImages(imgs ?? []);
        }
      } catch {
        setError("Falha ao carregar registro.");
      } finally {
        setInitializing(false);
        // Give the reset a tick to settle before enabling auto-save
        setTimeout(() => { isReadyRef.current = true; }, 50);
      }
    }

    init();
  }, [patientId, progressId, reset]);

  const formValues = watch();
  const formValuesRef = useRef(formValues);
  formValuesRef.current = formValues;

  const doAutoSave = useCallback(async () => {
    const values = formValuesRef.current;
    const body = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v ?? null])
    );
    setSaveStatus("saving");
    try {
      await fetch(`/api/professional/patients/${patientId}/progress/${progressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("pending");
    }
  }, [patientId, progressId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formValuesStr = JSON.stringify(formValues);
  useEffect(() => {
    if (!isReadyRef.current) return;
    setSaveStatus("pending");
    clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(doAutoSave, 1500);
    return () => clearTimeout(autoSaveTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValuesStr]);

  async function onPublish(data: ProgressFormData) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/professional/patients/${patientId}/progress/${progressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, isDraft: false, updatePatientProfile }),
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Falha ao publicar registro");
      }
      router.push(`/professional/patients/${patientId}/progress`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao publicar registro");
      setSubmitting(false);
    }
  }

  async function onDiscard() {
    if (!confirm("Descartar este rascunho? Esta ação não pode ser desfeita.")) return;
    setDiscarding(true);
    await fetch(`/api/professional/patients/${patientId}/progress/${progressId}`, {
      method: "DELETE",
    }).catch(() => {});
    router.push(`/professional/patients/${patientId}/progress`);
  }

  // Summary panel
  const weight = formValues.totalWeight ?? null;
  const heightCm = formValues.height ?? null;
  const bmiCalc = weight && heightCm ? +(weight / ((heightCm / 100) ** 2)).toFixed(1) : null;
  const bmiDisplay = formValues.bmi ?? bmiCalc;
  const bodyFat = formValues.bodyFatPercentage ?? null;
  const waist = formValues.perimeterWaist ?? null;
  const hip = formValues.perimeterHip ?? null;
  const waistHipRatio = waist && hip ? +(waist / hip).toFixed(2) : null;

  const prevWeight = lastProgress?.totalWeight ? parseFloat(lastProgress.totalWeight) : null;
  const prevHeight = lastProgress?.height ? parseFloat(lastProgress.height) : null;
  const prevBmi = lastProgress?.bmi ? parseFloat(lastProgress.bmi) : null;
  const prevBodyFat = lastProgress?.bodyFatPercentage ? parseFloat(lastProgress.bodyFatPercentage) : null;
  const prevWaist = lastProgress?.perimeterWaist ? parseFloat(lastProgress.perimeterWaist) : null;
  const prevHip = lastProgress?.perimeterHip ? parseFloat(lastProgress.perimeterHip) : null;
  const prevWaistHip = prevWaist && prevHip ? +(prevWaist / prevHip).toFixed(2) : null;

  const overviewRows = [
    { label: "Peso", current: weight, prev: prevWeight, unit: " kg" },
    { label: "Altura", current: heightCm, prev: prevHeight, unit: " cm" },
    { label: "IMC", current: bmiDisplay, prev: prevBmi },
    { label: "Gordura corporal", current: bodyFat, prev: prevBodyFat, unit: "%" },
    { label: "Cintura", current: waist, prev: prevWaist, unit: " cm" },
    { label: "Quadril", current: hip, prev: prevHip, unit: " cm" },
    { label: "Rel. Cintura/Quadril", current: waistHipRatio, prev: prevWaistHip },
  ];

  const hasAnyData = overviewRows.some((r) => r.current != null);

  return (
    <div className="p-4 md:p-6 max-w-[1080px]">

      <Link
        href={`/professional/patients/${patientId}/progress`}
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-5"
      >
        ← Voltar ao progresso
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight">
              Novo Registro
            </h1>
            <span className="inline-flex items-center h-5 px-2 rounded-full bg-[#FEF9C3] border border-[#FDE047] text-[11px] font-semibold text-[#854D0E]">
              Rascunho
            </span>
          </div>
          <p className="text-sm font-medium text-[#6B7280]">
            Todas as medidas são opcionais — preencha o que foi medido hoje.
          </p>
        </div>
        <div className="pt-1">
          <SaveIndicator status={saveStatus} />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {initializing ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden animate-pulse">
              <div className="px-4 py-3 border-b border-[#F3F4F6]">
                <div className="h-4 w-40 bg-[#F3F4F6] rounded" />
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-1.5">
                    <div className="h-3 w-24 bg-[#F3F4F6] rounded" />
                    <div className="h-10 bg-[#F3F4F6] rounded-[10px]" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

          <div className="space-y-3">
            <form onSubmit={handleSubmit(onPublish)} className="space-y-3">

              <ProgressFormFields
                register={register}
                errors={errors}
                disabled={submitting}
                previousProgress={lastProgress}
                watch={watch}
              />

              <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3.5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updatePatientProfile}
                    onChange={(e) => setUpdatePatientProfile(e.target.checked)}
                    disabled={submitting}
                    className="mt-0.5 h-4 w-4 rounded border-[#D1D5DB] text-[#2E8B5A] focus:ring-[#2E8B5A] disabled:opacity-50 cursor-pointer"
                  />
                  <div>
                    <p className="text-[14px] font-semibold text-[#111827]">Atualizar perfil do paciente</p>
                    <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                      Altura e peso inseridos acima também serão atualizados no perfil do paciente
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onDiscard}
                  disabled={discarding || submitting}
                  className="flex items-center justify-center gap-2 h-11 px-4 text-[14px] font-semibold text-[#DC2626] bg-white border border-[#E5E7EB] rounded-[10px] hover:border-[#FECACA] hover:bg-[#FEF2F2] transition-all duration-150 disabled:opacity-50"
                >
                  {discarding ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Descartar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-11 flex items-center justify-center gap-2 text-[14px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] hover:bg-[#277A4F] transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Publicando…
                    </>
                  ) : "Publicar registro"}
                </button>
              </div>

            </form>

            <ProgressImages
              images={images}
              uploadUrl={`/api/professional/patients/${patientId}/progress/${progressId}/images`}
              deleteUrlBase={`/api/professional/patients/${patientId}/progress/${progressId}/images`}
              onImagesChange={setImages}
            />
          </div>

          {/* Sticky summary panel */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-[#F3F4F6]">
                <p className="text-[14px] font-semibold text-[#111827]">Resumo</p>
                <p className="text-[12px] text-[#9CA3AF] mt-0.5">Atualiza conforme você preenche</p>
              </div>
              {!hasAnyData ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-[13px] text-[#9CA3AF]">Preencha os campos ao lado para ver o resumo aqui.</p>
                </div>
              ) : (
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[#F3F4F6]">
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Parâmetro</th>
                      <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Atual</th>
                      <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Anterior</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overviewRows.map((row) => {
                      if (row.current == null && row.prev == null) return null;
                      return (
                        <tr key={row.label} className="border-b border-[#F9FAFB] last:border-0">
                          <td className="px-4 py-2.5 text-[#374151] text-[12.5px]">{row.label}</td>
                          <td className="px-3 py-2.5 text-right">
                            {row.current != null ? (
                              <span className="font-semibold text-[#111827]">{fmt(row.current)}{row.unit ?? ""}</span>
                            ) : (
                              <span className="text-[#D1D5DB]">—</span>
                            )}
                            <Delta current={row.current} prev={row.prev} />
                          </td>
                          <td className="px-4 py-2.5 text-right text-[#9CA3AF] text-[12px]">
                            {row.prev != null ? `${fmt(row.prev)}${row.unit ?? ""}` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

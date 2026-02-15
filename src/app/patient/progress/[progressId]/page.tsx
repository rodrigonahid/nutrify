"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DeltaIndicator } from "@/components/delta-indicator";
import { Progress } from "@/types/progress";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Row({ label, current, prev, unit }: { label: string; current: string | null; prev: string | null; unit: string }) {
  if (!current) return null;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#F3F4F6] last:border-0">
      <span className="text-[13px] font-medium text-[#374151]">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[13px] font-semibold text-[#111827]">{current}{unit ? ` ${unit}` : ""}</span>
        <DeltaIndicator current={current} previous={prev} unit={unit} />
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#F3F4F6]">
        <p className="text-[14px] font-semibold text-[#111827]">{title}</p>
        {subtitle && <p className="text-[12px] text-[#9CA3AF] mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-4">{children}</div>
    </div>
  );
}

function SkeletonSection() {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden animate-pulse">
      <div className="px-4 py-3 border-b border-[#F3F4F6]"><div className="h-4 w-32 bg-[#F3F4F6] rounded" /></div>
      <div className="px-4 py-2 space-y-3">
        {[1,2,3,4].map(i => <div key={i} className="h-3 bg-[#F3F4F6] rounded" />)}
      </div>
    </div>
  );
}

export default function PatientProgressDetailPage() {
  const params = useParams();
  const progressId = params.progressId as string;
  const [progress, setProgress] = useState<Progress | null>(null);
  const [previous, setPrevious] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/patient/progress/${progressId}`)
      .then((r) => r.json())
      .then((d) => { setProgress(d.progress); setPrevious(d.previous); })
      .catch(() => setError("Failed to load progress data"))
      .finally(() => setLoading(false));
  }, [progressId]);

  return (
    <div className="p-4 md:p-8 max-w-[900px]">
      <Link href="/patient/progress" className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6">
        ← Back to Progress
      </Link>

      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
          {loading ? <span className="inline-block w-48 h-6 bg-[#F3F4F6] rounded animate-pulse" /> : progress ? formatDate(progress.createdAt) : "Entry"}
        </h1>
        {!loading && previous && (
          <p className="text-sm font-medium text-[#6B7280]">vs. {formatDate(previous.createdAt)}</p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">{error}</div>
      )}

      {loading ? (
        <div className="space-y-4">
          <SkeletonSection /><SkeletonSection /><SkeletonSection />
        </div>
      ) : !progress ? null : (
        <div className="space-y-4">
          <Section title="Body Composition">
            <Row label="Weight" current={progress.totalWeight} prev={previous?.totalWeight || null} unit="kg" />
            <Row label="Height" current={progress.height} prev={previous?.height || null} unit="cm" />
            <Row label="BMI" current={progress.bmi} prev={previous?.bmi || null} unit="" />
            <Row label="Body Fat" current={progress.bodyFatPercentage} prev={previous?.bodyFatPercentage || null} unit="%" />
          </Section>

          <Section title="Trunk" subtitle="cm">
            <Row label="Chest" current={progress.perimeterChest} prev={previous?.perimeterChest || null} unit="cm" />
            <Row label="Shoulder" current={progress.perimeterShoulder} prev={previous?.perimeterShoulder || null} unit="cm" />
            <Row label="Waist" current={progress.perimeterWaist} prev={previous?.perimeterWaist || null} unit="cm" />
            <Row label="Abdomen" current={progress.perimeterAbdomen} prev={previous?.perimeterAbdomen || null} unit="cm" />
            <Row label="Hip" current={progress.perimeterHip} prev={previous?.perimeterHip || null} unit="cm" />
          </Section>

          <Section title="Upper Limbs" subtitle="cm">
            <Row label="Biceps Left (Relaxed)" current={progress.perimeterBicepsLeftRelaxed} prev={previous?.perimeterBicepsLeftRelaxed || null} unit="cm" />
            <Row label="Biceps Left (Contracted)" current={progress.perimeterBicepsLeftContracted} prev={previous?.perimeterBicepsLeftContracted || null} unit="cm" />
            <Row label="Biceps Right (Relaxed)" current={progress.perimeterBicepsRightRelaxed} prev={previous?.perimeterBicepsRightRelaxed || null} unit="cm" />
            <Row label="Biceps Right (Contracted)" current={progress.perimeterBicepsRightContracted} prev={previous?.perimeterBicepsRightContracted || null} unit="cm" />
            <Row label="Forearm Left" current={progress.perimeterForearmLeft} prev={previous?.perimeterForearmLeft || null} unit="cm" />
            <Row label="Forearm Right" current={progress.perimeterForearmRight} prev={previous?.perimeterForearmRight || null} unit="cm" />
          </Section>

          <Section title="Lower Limbs" subtitle="cm">
            <Row label="Thigh Proximal Left" current={progress.perimeterThighProximalLeft} prev={previous?.perimeterThighProximalLeft || null} unit="cm" />
            <Row label="Thigh Proximal Right" current={progress.perimeterThighProximalRight} prev={previous?.perimeterThighProximalRight || null} unit="cm" />
            <Row label="Thigh Medial Left" current={progress.perimeterThighMedialLeft} prev={previous?.perimeterThighMedialLeft || null} unit="cm" />
            <Row label="Thigh Medial Right" current={progress.perimeterThighMedialRight} prev={previous?.perimeterThighMedialRight || null} unit="cm" />
            <Row label="Thigh Distal Left" current={progress.perimeterThighDistalLeft} prev={previous?.perimeterThighDistalLeft || null} unit="cm" />
            <Row label="Thigh Distal Right" current={progress.perimeterThighDistalRight} prev={previous?.perimeterThighDistalRight || null} unit="cm" />
            <Row label="Calf Left" current={progress.perimeterCalfLeft} prev={previous?.perimeterCalfLeft || null} unit="cm" />
            <Row label="Calf Right" current={progress.perimeterCalfRight} prev={previous?.perimeterCalfRight || null} unit="cm" />
          </Section>

          <Section title="Skinfolds" subtitle="mm">
            <Row label="Biceps" current={progress.skinfoldBiceps} prev={previous?.skinfoldBiceps || null} unit="mm" />
            <Row label="Triceps" current={progress.skinfoldTriceps} prev={previous?.skinfoldTriceps || null} unit="mm" />
            <Row label="Axillary" current={progress.skinfoldAxillary} prev={previous?.skinfoldAxillary || null} unit="mm" />
            <Row label="Suprailiac" current={progress.skinfoldSuprailiac} prev={previous?.skinfoldSuprailiac || null} unit="mm" />
            <Row label="Abdominal" current={progress.skinfoldAbdominal} prev={previous?.skinfoldAbdominal || null} unit="mm" />
            <Row label="Subscapular" current={progress.skinfoldSubscapular} prev={previous?.skinfoldSubscapular || null} unit="mm" />
            <Row label="Chest" current={progress.skinfoldChest} prev={previous?.skinfoldChest || null} unit="mm" />
            <Row label="Thigh" current={progress.skinfoldThigh} prev={previous?.skinfoldThigh || null} unit="mm" />
            <Row label="Calf" current={progress.skinfoldCalf} prev={previous?.skinfoldCalf || null} unit="mm" />
          </Section>
        </div>
      )}
    </div>
  );
}

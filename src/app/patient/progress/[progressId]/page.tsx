"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DeltaIndicator } from "@/components/delta-indicator";
import { Progress } from "@/types/progress";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
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
      .catch(() => setError("Falha ao carregar dados de progresso"))
      .finally(() => setLoading(false));
  }, [progressId]);

  return (
    <div className="p-4 md:p-8 max-w-[900px]">
      <Link href="/patient/progress" className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6">
        ← Voltar ao progresso
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
          <Section title="Composição Corporal">
            <Row label="Peso" current={progress.totalWeight} prev={previous?.totalWeight || null} unit="kg" />
            <Row label="Altura" current={progress.height} prev={previous?.height || null} unit="cm" />
            <Row label="IMC" current={progress.bmi} prev={previous?.bmi || null} unit="" />
            <Row label="Gordura Corporal" current={progress.bodyFatPercentage} prev={previous?.bodyFatPercentage || null} unit="%" />
          </Section>

          <Section title="Tronco" subtitle="cm">
            <Row label="Tórax" current={progress.perimeterChest} prev={previous?.perimeterChest || null} unit="cm" />
            <Row label="Ombro" current={progress.perimeterShoulder} prev={previous?.perimeterShoulder || null} unit="cm" />
            <Row label="Cintura" current={progress.perimeterWaist} prev={previous?.perimeterWaist || null} unit="cm" />
            <Row label="Abdômen" current={progress.perimeterAbdomen} prev={previous?.perimeterAbdomen || null} unit="cm" />
            <Row label="Quadril" current={progress.perimeterHip} prev={previous?.perimeterHip || null} unit="cm" />
          </Section>

          <Section title="Membros Superiores" subtitle="cm">
            <Row label="Bíceps Esq (Relaxado)" current={progress.perimeterBicepsLeftRelaxed} prev={previous?.perimeterBicepsLeftRelaxed || null} unit="cm" />
            <Row label="Bíceps Esq (Contraído)" current={progress.perimeterBicepsLeftContracted} prev={previous?.perimeterBicepsLeftContracted || null} unit="cm" />
            <Row label="Bíceps Dir (Relaxado)" current={progress.perimeterBicepsRightRelaxed} prev={previous?.perimeterBicepsRightRelaxed || null} unit="cm" />
            <Row label="Bíceps Dir (Contraído)" current={progress.perimeterBicepsRightContracted} prev={previous?.perimeterBicepsRightContracted || null} unit="cm" />
            <Row label="Antebraço Esq" current={progress.perimeterForearmLeft} prev={previous?.perimeterForearmLeft || null} unit="cm" />
            <Row label="Antebraço Dir" current={progress.perimeterForearmRight} prev={previous?.perimeterForearmRight || null} unit="cm" />
          </Section>

          <Section title="Membros Inferiores" subtitle="cm">
            <Row label="Coxa Proximal Esq" current={progress.perimeterThighProximalLeft} prev={previous?.perimeterThighProximalLeft || null} unit="cm" />
            <Row label="Coxa Proximal Dir" current={progress.perimeterThighProximalRight} prev={previous?.perimeterThighProximalRight || null} unit="cm" />
            <Row label="Coxa Medial Esq" current={progress.perimeterThighMedialLeft} prev={previous?.perimeterThighMedialLeft || null} unit="cm" />
            <Row label="Coxa Medial Dir" current={progress.perimeterThighMedialRight} prev={previous?.perimeterThighMedialRight || null} unit="cm" />
            <Row label="Coxa Distal Esq" current={progress.perimeterThighDistalLeft} prev={previous?.perimeterThighDistalLeft || null} unit="cm" />
            <Row label="Coxa Distal Dir" current={progress.perimeterThighDistalRight} prev={previous?.perimeterThighDistalRight || null} unit="cm" />
            <Row label="Panturrilha Esq" current={progress.perimeterCalfLeft} prev={previous?.perimeterCalfLeft || null} unit="cm" />
            <Row label="Panturrilha Dir" current={progress.perimeterCalfRight} prev={previous?.perimeterCalfRight || null} unit="cm" />
          </Section>

          <Section title="Dobras Cutâneas" subtitle="mm">
            <Row label="Bíceps" current={progress.skinfoldBiceps} prev={previous?.skinfoldBiceps || null} unit="mm" />
            <Row label="Tríceps" current={progress.skinfoldTriceps} prev={previous?.skinfoldTriceps || null} unit="mm" />
            <Row label="Axilar" current={progress.skinfoldAxillary} prev={previous?.skinfoldAxillary || null} unit="mm" />
            <Row label="Suprailíaca" current={progress.skinfoldSuprailiac} prev={previous?.skinfoldSuprailiac || null} unit="mm" />
            <Row label="Abdominal" current={progress.skinfoldAbdominal} prev={previous?.skinfoldAbdominal || null} unit="mm" />
            <Row label="Subescapular" current={progress.skinfoldSubscapular} prev={previous?.skinfoldSubscapular || null} unit="mm" />
            <Row label="Peitoral" current={progress.skinfoldChest} prev={previous?.skinfoldChest || null} unit="mm" />
            <Row label="Coxa" current={progress.skinfoldThigh} prev={previous?.skinfoldThigh || null} unit="mm" />
            <Row label="Panturrilha" current={progress.skinfoldCalf} prev={previous?.skinfoldCalf || null} unit="mm" />
          </Section>
        </div>
      )}
    </div>
  );
}

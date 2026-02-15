"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Progress } from "@/types";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function fmt(value: string | null, unit = "") {
  if (!value) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : `${num % 1 === 0 ? num : num.toFixed(1)}${unit ? ` ${unit}` : ""}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1">
        {label}
      </p>
      <p className="text-[16px] font-bold text-[#111827]">{value}</p>
    </div>
  );
}

function Section({
  title,
  cols = 3,
  children,
}: {
  title: string;
  cols?: 2 | 3 | 4;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#F3F4F6]">
        <p className="text-[14px] font-semibold text-[#111827]">{title}</p>
      </div>
      <div
        className={[
          "p-4 grid gap-5",
          cols === 2 ? "grid-cols-2" : cols === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

export default function ProgressDetailPage() {
  const params = useParams();
  const patientId = params.patientId as string;
  const progressId = params.progressId as string;

  const [entry, setEntry] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/professional/patients/${patientId}/progress/${progressId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.progress) setEntry(data.progress);
        else setError("Registro de progresso não encontrado");
      })
      .catch(() => setError("Falha ao carregar registro de progresso"))
      .finally(() => setLoading(false));
  }, [patientId, progressId]);

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      {/* Back link */}
      <Link
        href={`/professional/patients/${patientId}/progress`}
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Voltar ao progresso
      </Link>

      {/* Page heading */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
            {loading ? (
              <span className="inline-block w-56 h-6 bg-[#F3F4F6] rounded animate-pulse" />
            ) : entry ? (
              formatDate(entry.createdAt)
            ) : (
              "Registro de progresso"
            )}
          </h1>
          <p className="text-sm font-medium text-[#6B7280]">Registro de medidas</p>
        </div>
        <Link
          href={`/professional/patients/${patientId}/progress/create`}
          className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#2E8B5A] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#277A4F] transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)]"
        >
          <Plus size={13} strokeWidth={2.5} />
          Novo registro
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          {[4, 5, 6].map((count, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#F3F4F6]">
                <div className="h-4 w-36 bg-[#F3F4F6] rounded" />
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-5">
                {Array.from({ length: count }).map((_, j) => (
                  <div key={j}>
                    <div className="h-2.5 w-20 bg-[#F3F4F6] rounded mb-2" />
                    <div className="h-5 w-16 bg-[#F3F4F6] rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {!loading && entry && (
        <div className="space-y-4">

          {/* Body Composition — always show if any value exists */}
          {(entry.bodyFatPercentage || entry.height || entry.totalWeight || entry.bmi) && (
            <Section title="Composição Corporal" cols={4}>
              {fmt(entry.bodyFatPercentage, "%") && (
                <Stat label="Gordura Corporal" value={fmt(entry.bodyFatPercentage, "%")!} />
              )}
              {fmt(entry.height, "cm") && (
                <Stat label="Altura" value={fmt(entry.height, "cm")!} />
              )}
              {fmt(entry.totalWeight, "kg") && (
                <Stat label="Peso" value={fmt(entry.totalWeight, "kg")!} />
              )}
              {fmt(entry.bmi) && (
                <Stat label="IMC" value={fmt(entry.bmi)!} />
              )}
            </Section>
          )}

          {/* Perimeters — Trunk */}
          {(entry.perimeterChest || entry.perimeterShoulder || entry.perimeterWaist ||
            entry.perimeterAbdomen || entry.perimeterHip) && (
            <Section title="Perímetros — Tronco (cm)">
              {fmt(entry.perimeterChest, "cm") && (
                <Stat label="Tórax" value={fmt(entry.perimeterChest, "cm")!} />
              )}
              {fmt(entry.perimeterShoulder, "cm") && (
                <Stat label="Ombro" value={fmt(entry.perimeterShoulder, "cm")!} />
              )}
              {fmt(entry.perimeterWaist, "cm") && (
                <Stat label="Cintura" value={fmt(entry.perimeterWaist, "cm")!} />
              )}
              {fmt(entry.perimeterAbdomen, "cm") && (
                <Stat label="Abdômen" value={fmt(entry.perimeterAbdomen, "cm")!} />
              )}
              {fmt(entry.perimeterHip, "cm") && (
                <Stat label="Quadril" value={fmt(entry.perimeterHip, "cm")!} />
              )}
            </Section>
          )}

          {/* Perimeters — Upper Limbs */}
          {(entry.perimeterBicepsLeftRelaxed || entry.perimeterBicepsRightRelaxed ||
            entry.perimeterBicepsLeftContracted || entry.perimeterBicepsRightContracted ||
            entry.perimeterForearmLeft || entry.perimeterForearmRight) && (
            <Section title="Perímetros — Membros Superiores (cm)">
              {fmt(entry.perimeterBicepsLeftRelaxed, "cm") && (
                <Stat label="Bíceps E (Relaxado)" value={fmt(entry.perimeterBicepsLeftRelaxed, "cm")!} />
              )}
              {fmt(entry.perimeterBicepsRightRelaxed, "cm") && (
                <Stat label="Bíceps D (Relaxado)" value={fmt(entry.perimeterBicepsRightRelaxed, "cm")!} />
              )}
              {fmt(entry.perimeterBicepsLeftContracted, "cm") && (
                <Stat label="Bíceps E (Contraído)" value={fmt(entry.perimeterBicepsLeftContracted, "cm")!} />
              )}
              {fmt(entry.perimeterBicepsRightContracted, "cm") && (
                <Stat label="Bíceps D (Contraído)" value={fmt(entry.perimeterBicepsRightContracted, "cm")!} />
              )}
              {fmt(entry.perimeterForearmLeft, "cm") && (
                <Stat label="Antebraço E" value={fmt(entry.perimeterForearmLeft, "cm")!} />
              )}
              {fmt(entry.perimeterForearmRight, "cm") && (
                <Stat label="Antebraço D" value={fmt(entry.perimeterForearmRight, "cm")!} />
              )}
            </Section>
          )}

          {/* Perimeters — Lower Limbs */}
          {(entry.perimeterThighProximalLeft || entry.perimeterThighProximalRight ||
            entry.perimeterThighMedialLeft || entry.perimeterThighMedialRight ||
            entry.perimeterThighDistalLeft || entry.perimeterThighDistalRight ||
            entry.perimeterCalfLeft || entry.perimeterCalfRight) && (
            <Section title="Perímetros — Membros Inferiores (cm)">
              {fmt(entry.perimeterThighProximalLeft, "cm") && (
                <Stat label="Coxa Proximal E" value={fmt(entry.perimeterThighProximalLeft, "cm")!} />
              )}
              {fmt(entry.perimeterThighProximalRight, "cm") && (
                <Stat label="Coxa Proximal D" value={fmt(entry.perimeterThighProximalRight, "cm")!} />
              )}
              {fmt(entry.perimeterThighMedialLeft, "cm") && (
                <Stat label="Coxa Medial E" value={fmt(entry.perimeterThighMedialLeft, "cm")!} />
              )}
              {fmt(entry.perimeterThighMedialRight, "cm") && (
                <Stat label="Coxa Medial D" value={fmt(entry.perimeterThighMedialRight, "cm")!} />
              )}
              {fmt(entry.perimeterThighDistalLeft, "cm") && (
                <Stat label="Coxa Distal E" value={fmt(entry.perimeterThighDistalLeft, "cm")!} />
              )}
              {fmt(entry.perimeterThighDistalRight, "cm") && (
                <Stat label="Coxa Distal D" value={fmt(entry.perimeterThighDistalRight, "cm")!} />
              )}
              {fmt(entry.perimeterCalfLeft, "cm") && (
                <Stat label="Panturrilha E" value={fmt(entry.perimeterCalfLeft, "cm")!} />
              )}
              {fmt(entry.perimeterCalfRight, "cm") && (
                <Stat label="Panturrilha D" value={fmt(entry.perimeterCalfRight, "cm")!} />
              )}
            </Section>
          )}

          {/* Skinfolds */}
          {(entry.skinfoldBiceps || entry.skinfoldTriceps || entry.skinfoldAxillary ||
            entry.skinfoldSuprailiac || entry.skinfoldAbdominal || entry.skinfoldSubscapular ||
            entry.skinfoldChest || entry.skinfoldThigh || entry.skinfoldCalf) && (
            <Section title="Dobras Cutâneas (mm)">
              {fmt(entry.skinfoldBiceps, "mm") && (
                <Stat label="Bíceps" value={fmt(entry.skinfoldBiceps, "mm")!} />
              )}
              {fmt(entry.skinfoldTriceps, "mm") && (
                <Stat label="Tríceps" value={fmt(entry.skinfoldTriceps, "mm")!} />
              )}
              {fmt(entry.skinfoldAxillary, "mm") && (
                <Stat label="Axilar" value={fmt(entry.skinfoldAxillary, "mm")!} />
              )}
              {fmt(entry.skinfoldSuprailiac, "mm") && (
                <Stat label="Suprailíaca" value={fmt(entry.skinfoldSuprailiac, "mm")!} />
              )}
              {fmt(entry.skinfoldAbdominal, "mm") && (
                <Stat label="Abdominal" value={fmt(entry.skinfoldAbdominal, "mm")!} />
              )}
              {fmt(entry.skinfoldSubscapular, "mm") && (
                <Stat label="Subescapular" value={fmt(entry.skinfoldSubscapular, "mm")!} />
              )}
              {fmt(entry.skinfoldChest, "mm") && (
                <Stat label="Peitoral" value={fmt(entry.skinfoldChest, "mm")!} />
              )}
              {fmt(entry.skinfoldThigh, "mm") && (
                <Stat label="Coxa" value={fmt(entry.skinfoldThigh, "mm")!} />
              )}
              {fmt(entry.skinfoldCalf, "mm") && (
                <Stat label="Panturrilha" value={fmt(entry.skinfoldCalf, "mm")!} />
              )}
            </Section>
          )}

          {/* No data recorded */}
          {!entry.bodyFatPercentage && !entry.height && !entry.totalWeight && !entry.bmi &&
           !entry.perimeterChest && !entry.perimeterWaist && !entry.perimeterHip &&
           !entry.perimeterBicepsLeftRelaxed && !entry.perimeterCalfLeft &&
           !entry.skinfoldBiceps && !entry.skinfoldTriceps && (
            <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-10 text-center">
              <p className="text-[14px] font-medium text-[#9CA3AF]">
                Nenhuma medida foi registrada para este registro.
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

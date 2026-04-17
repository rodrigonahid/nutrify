"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, TrendingUp, Plus, BarChart2, Camera, X } from "lucide-react";
import { Progress, ProgressImage } from "@/types";
import { ProgressImages } from "@/components/progress-images";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="w-10 h-10 rounded-[8px] bg-[#F3F4F6] shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-28 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-48 bg-[#F3F4F6] rounded" />
      </div>
      <div className="h-3 w-10 bg-[#F3F4F6] rounded" />
    </div>
  );
}

export default function PatientProgressPage() {
  const params = useParams();
  const patientId = params.patientId as string;

  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [modalEntry, setModalEntry] = useState<Progress | null>(null);
  const [modalImages, setModalImages] = useState<ProgressImage[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/professional/patients/${patientId}/progress`)
      .then((r) => r.json())
      .then((data) => setProgress(data.progress ?? []))
      .catch(() => setError("Falha ao carregar progresso"))
      .finally(() => setLoading(false));
  }, [patientId]);

  // Close modal on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function openModal(entry: Progress) {
    setModalEntry(entry);
    setModalImages(entry.images ?? []);
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    setModalEntry(null);
    document.body.style.overflow = "";
  }

  function handleModalImagesChange(newImages: ProgressImage[]) {
    setModalImages(newImages);
    if (!modalEntry) return;
    setProgress((prev) =>
      prev.map((p) => (p.id === modalEntry.id ? { ...p, images: newImages } : p))
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      {/* Back link */}
      <Link
        href={`/professional/patients/${patientId}`}
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Voltar ao paciente
      </Link>

      {/* Page heading */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
            Progresso
          </h1>
          {!loading && (
            <p className="text-sm font-medium text-[#6B7280]">
              {progress.length === 0
                ? "Nenhum registro ainda"
                : `${progress.length} registro${progress.length !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span title={!loading && progress.length < 2 ? "Você precisa de pelo menos 2 registros para comparar" : undefined}>
            {!loading && progress.length >= 2 ? (
              <Link
                href={`/professional/patients/${patientId}/progress/evolution`}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] rounded-[8px] hover:bg-[rgba(46,139,90,0.14)] transition-colors duration-150"
              >
                <BarChart2 size={14} strokeWidth={2.2} />
                Ver evolução
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-semibold text-[#9CA3AF] bg-[#F3F4F6] rounded-[8px] cursor-not-allowed">
                <BarChart2 size={14} strokeWidth={2.2} />
                Ver evolução
              </span>
            )}
          </span>
          <Link
            href={`/professional/patients/${patientId}/progress/create`}
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#2E8B5A] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#277A4F] transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)]"
          >
            <Plus size={13} strokeWidth={2.5} />
            Adicionar
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {/* Progress list */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">

        {loading && (
          <div className="divide-y divide-[#F3F4F6]">
            {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {!loading && progress.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center mb-4">
              <TrendingUp size={22} className="text-[#9CA3AF]" />
            </div>
            <p className="text-[15px] font-semibold text-[#374151] mb-1">
              Nenhum registro de progresso ainda
            </p>
            <p className="text-[13px] text-[#9CA3AF]">
              Adicione o primeiro registro para começar a acompanhar o progresso deste paciente.
            </p>
          </div>
        )}

        {!loading && progress.length > 0 && (
          <div className="divide-y divide-[#F3F4F6]">
            {progress.map((entry) => {
              const firstImage = entry.images?.[0];
              const imageCount = entry.images?.length ?? 0;

              return (
                <div key={entry.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#F9FAFB] transition-colors duration-100 group">

                  {/* Photo thumbnail / camera button */}
                  <button
                    type="button"
                    onClick={() => openModal(entry)}
                    title={imageCount > 0 ? `${imageCount} foto${imageCount !== 1 ? "s" : ""}` : "Adicionar fotos"}
                    className="relative shrink-0 w-10 h-10 rounded-[8px] overflow-hidden border border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-center hover:border-[#2E8B5A] hover:bg-[rgba(46,139,90,0.04)] transition-colors duration-150"
                  >
                    {firstImage ? (
                      <Image
                        src={firstImage.url}
                        alt="Foto de progresso"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <Camera size={15} className="text-[#C4C9D4] group-hover:text-[#9CA3AF] transition-colors duration-150" />
                    )}
                    {imageCount > 1 && (
                      <span className="absolute bottom-0 right-0 bg-black/50 text-white text-[9px] font-bold px-1 leading-4 rounded-tl-[4px]">
                        +{imageCount - 1}
                      </span>
                    )}
                  </button>

                  {/* Row link → edit if draft, detail if published */}
                  <Link
                    href={
                      entry.isDraft
                        ? `/professional/patients/${patientId}/progress/${entry.id}/edit`
                        : `/professional/patients/${patientId}/progress/${entry.id}`
                    }
                    className="flex-1 min-w-0 flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-semibold text-[#111827]">
                          {formatDate(entry.createdAt)}
                        </p>
                        {entry.isDraft && (
                          <span className="inline-flex items-center h-4 px-1.5 rounded-full bg-[#FEF9C3] border border-[#FDE047] text-[10px] font-semibold text-[#854D0E]">
                            Rascunho
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 mt-0.5">
                        {entry.totalWeight && (
                          <span className="text-[12px] text-[#9CA3AF]">{entry.totalWeight} kg</span>
                        )}
                        {entry.bmi && (
                          <span className="text-[12px] text-[#9CA3AF]">IMC {entry.bmi}</span>
                        )}
                        {entry.bodyFatPercentage && (
                          <span className="text-[12px] text-[#9CA3AF]">{entry.bodyFatPercentage}% gordura</span>
                        )}
                        {entry.perimeterWaist && (
                          <span className="text-[12px] text-[#9CA3AF]">cintura {entry.perimeterWaist} cm</span>
                        )}
                        {entry.isDraft && !entry.totalWeight && !entry.bmi && !entry.bodyFatPercentage && !entry.perimeterWaist && (
                          <span className="text-[12px] text-[#C4C9D4]">Nenhuma medida ainda</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      strokeWidth={2}
                      className="text-[#D1D5DB] group-hover:text-[#9CA3AF] transition-colors duration-100 shrink-0"
                    />
                  </Link>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image modal */}
      {modalEntry && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={closeModal}
        >
          <div
            ref={modalRef}
            className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#F3F4F6] shrink-0">
              <div>
                <p className="text-[15px] font-semibold text-[#111827]">Fotos</p>
                <p className="text-[12px] text-[#9CA3AF]">{formatDate(modalEntry.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors duration-150"
              >
                <X size={17} />
              </button>
            </div>

            {/* Modal body — scrollable */}
            <div className="overflow-y-auto p-4">
              <ProgressImages
                images={modalImages}
                uploadUrl={`/api/professional/patients/${patientId}/progress/${modalEntry.id}/images`}
                deleteUrlBase={`/api/professional/patients/${patientId}/progress/${modalEntry.id}/images`}
                onImagesChange={handleModalImagesChange}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

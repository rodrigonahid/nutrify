"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { X, ImagePlus, Loader2, ZoomIn } from "lucide-react";

interface ProgressImage {
  id: number;
  url: string;
  createdAt: string;
}

interface Props {
  /** Fetched images to display */
  images: ProgressImage[];
  /** If provided, enables upload + delete */
  uploadUrl?: string;
  deleteUrlBase?: string;
  onImagesChange?: (images: ProgressImage[]) => void;
}

export function ProgressImages({ images, uploadUrl, deleteUrlBase, onImagesChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const canEdit = !!uploadUrl;

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || !uploadUrl) return;
    setUploadError("");

    for (const file of Array.from(files)) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(uploadUrl, { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Falha ao enviar imagem");
        onImagesChange?.([...images, data.image]);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Falha ao enviar imagem");
      } finally {
        setUploading(false);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  }, [uploadUrl, images, onImagesChange]);

  async function handleDelete(imageId: number) {
    if (!deleteUrlBase) return;
    setDeletingId(imageId);
    try {
      const res = await fetch(`${deleteUrlBase}/${imageId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao remover imagem");
      onImagesChange?.(images.filter((img) => img.id !== imageId));
    } catch {
      // silently ignore
    } finally {
      setDeletingId(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  if (!canEdit && images.length === 0) return null;

  return (
    <>
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center justify-between">
          <p className="text-[14px] font-semibold text-[#111827]">Fotos</p>
          {canEdit && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[12px] font-semibold text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-50 transition-colors duration-150"
            >
              {uploading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <ImagePlus size={13} />
              )}
              {uploading ? "Enviando…" : "Adicionar foto"}
            </button>
          )}
        </div>

        <div className="p-4">
          {images.length === 0 && canEdit ? (
            /* Drop zone when empty */
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center gap-2 py-10 cursor-pointer hover:border-[#2E8B5A] hover:bg-[rgba(46,139,90,0.02)] transition-colors duration-150"
            >
              <ImagePlus size={22} className="text-[#9CA3AF]" />
              <p className="text-[13px] font-medium text-[#9CA3AF]">Arraste fotos ou clique para selecionar</p>
              <p className="text-[12px] text-[#C4C9D4]">JPG, PNG ou WebP · máx. 10 MB por foto</p>
            </div>
          ) : (
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}
            >
              {images.map((img) => (
                <div key={img.id} className="relative group aspect-square rounded-[10px] overflow-hidden bg-[#F3F4F6]">
                  <Image
                    src={img.url}
                    alt="Foto de progresso"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-150 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLightbox(img.url)}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center transition-opacity duration-150 hover:bg-white"
                    >
                      <ZoomIn size={14} className="text-[#374151]" />
                    </button>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleDelete(img.id)}
                        disabled={deletingId === img.id}
                        className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center transition-opacity duration-150 hover:bg-white disabled:opacity-50"
                      >
                        {deletingId === img.id ? (
                          <Loader2 size={13} className="animate-spin text-[#374151]" />
                        ) : (
                          <X size={13} className="text-[#DC2626]" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add more tile */}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-[10px] border-2 border-dashed border-[#E5E7EB] flex flex-col items-center justify-center gap-1 hover:border-[#2E8B5A] hover:bg-[rgba(46,139,90,0.02)] disabled:opacity-50 transition-colors duration-150"
                >
                  {uploading ? (
                    <Loader2 size={18} className="text-[#9CA3AF] animate-spin" />
                  ) : (
                    <ImagePlus size={18} className="text-[#9CA3AF]" />
                  )}
                </button>
              )}
            </div>
          )}

          {uploadError && (
            <p className="mt-2 text-[12px] font-semibold text-[#DC2626]">{uploadError}</p>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-150"
          >
            <X size={18} className="text-white" />
          </button>
          <div className="relative max-w-3xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightbox}
              alt="Foto de progresso"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, Plus, X } from "lucide-react";
import { ExerciseDetailModal } from "@/components/exercise-detail-modal";

interface Exercise {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-36 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-52 bg-[#F3F4F6] rounded" />
      </div>
      <div className="h-5 w-16 bg-[#F3F4F6] rounded-full" />
    </div>
  );
}

const inputClass =
  "w-full h-10 px-3 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E8B5A] focus:ring-2 focus:ring-[rgba(46,139,90,0.15)] transition-all duration-150";
const labelClass = "block text-[12px] font-semibold text-[#374151] mb-1";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Exercise detail modal
  const [detailExerciseId, setDetailExerciseId] = useState<number | null>(null);

  // Create exercise modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/patient/training/exercises")
      .then((r) => r.json())
      .then((d) => setExercises(d.exercises ?? []))
      .catch(() => setError("Failed to load exercises"))
      .finally(() => setLoading(false));
  }, []);

  function openModal() {
    setNewName("");
    setNewDescription("");
    setModalError("");
    setModalOpen(true);
    setTimeout(() => nameRef.current?.focus(), 80);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    setModalError("");
    try {
      const res = await fetch("/api/patient/training/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create exercise");
      setExercises((prev) => [...prev, data.exercise]);
      closeModal();
      setDetailExerciseId(data.exercise.id);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Failed to create exercise");
      setCreating(false);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-[900px]">
      <Link
        href="/patient/training"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Back to Training
      </Link>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
            Exercise Library
          </h1>
          {!loading && (
            <p className="text-sm font-medium text-[#6B7280]">
              {exercises.length === 0
                ? "No exercises yet"
                : `${exercises.length} exercise${exercises.length !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] hover:bg-[#277A4F] hover:-translate-y-px transition-all duration-150"
        >
          <Plus size={14} />
          New Exercise
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden divide-y divide-[#F3F4F6]">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : exercises.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center py-14 px-6 text-center">
          <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center mb-4">
            <BookOpen size={22} className="text-[#9CA3AF]" />
          </div>
          <p className="text-[15px] font-semibold text-[#374151] mb-1">No exercises yet</p>
          <p className="text-[13px] text-[#9CA3AF] mb-4">Create your first exercise.</p>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] hover:bg-[#277A4F] transition-all duration-150"
          >
            <Plus size={14} />
            Create your first exercise
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="divide-y divide-[#F3F4F6]">
            {exercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => setDetailExerciseId(exercise.id)}
                className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-[#F9FAFB] transition-colors duration-100 text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#111827]">{exercise.name}</p>
                  {exercise.description && (
                    <p className="text-[12px] text-[#9CA3AF] truncate mt-0.5">
                      {exercise.description}
                    </p>
                  )}
                </div>
                <span className="text-[12px] font-semibold text-[#2E8B5A] shrink-0">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Exercise Detail Modal */}
      {detailExerciseId !== null && (
        <ExerciseDetailModal
          exerciseId={detailExerciseId}
          onClose={() => setDetailExerciseId(null)}
        />
      )}

      {/* Create Exercise Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <h2 className="text-[16px] font-extrabold text-[#111827]">New Exercise</h2>
              <button
                onClick={closeModal}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors duration-100"
              >
                <X size={15} />
              </button>
            </div>

            {/* Error */}
            {modalError && (
              <div className="mx-5 mb-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-3 py-2 text-[12.5px] font-semibold text-[#DC2626]">
                {modalError}
              </div>
            )}

            {/* Form */}
            <div className="px-5 pb-3 space-y-3">
              <div>
                <label className={labelClass}>
                  Nome <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && newName.trim()) handleCreate(); }}
                  placeholder="ex.: Supino reto"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Descrição <span className="font-normal text-[#9CA3AF]">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Observações sobre o exercício"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pt-3 pb-5 border-t border-[#F3F4F6]">
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className="w-full h-10 rounded-[10px] bg-[#2E8B5A] text-white text-[13px] font-bold hover:bg-[#267a50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                {creating ? "Criando…" : "Criar exercício"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

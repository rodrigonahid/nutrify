"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Play, Plus, X } from "lucide-react";
import { ExerciseDetailModal } from "@/components/exercise-detail-modal";

interface WorkoutExercise {
  id: number;
  orderIndex: number;
  exerciseId: number;
  exerciseName: string;
  exerciseDescription: string | null;
}

interface Workout {
  id: number;
  name: string;
  description: string | null;
  assignedByProfessionalId: number | null;
  createdAt: string;
}

interface Exercise {
  id: number;
  name: string;
  description: string | null;
}

function SkeletonPanel() {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden animate-pulse">
      <div className="px-4 py-3 border-b border-[#F3F4F6]">
        <div className="h-4 w-32 bg-[#F3F4F6] rounded" />
      </div>
      <div className="p-4 space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-3 bg-[#F3F4F6] rounded" />)}
      </div>
    </div>
  );
}

export default function WorkoutDetailPage() {
  const params = useParams();
  const workoutId = params.workoutId as string;
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Exercise detail modal
  const [detailExerciseId, setDetailExerciseId] = useState<number | null>(null);

  // Add-exercise modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");

  // Existing exercise selection
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [modalError, setModalError] = useState("");

  // New exercise form
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/patient/training/workouts/${workoutId}`)
      .then((r) => r.json())
      .then((d) => { setWorkout(d.workout); setExercises(d.exercises ?? []); })
      .catch(() => setError("Falha ao carregar treino"))
      .finally(() => setLoading(false));
  }, [workoutId]);

  function openModal() {
    setModalOpen(true);
    setActiveTab("existing");
    setSearch("");
    setSelectedExerciseId(null);
    setModalError("");
    setNewName("");
    setNewDescription("");

    // Fetch exercises if not yet loaded
    if (allExercises.length === 0) {
      setExercisesLoading(true);
      fetch("/api/patient/training/exercises")
        .then((r) => r.json())
        .then((exData) => setAllExercises(exData.exercises ?? []))
        .finally(() => setExercisesLoading(false));
    }

    setTimeout(() => searchRef.current?.focus(), 80);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function handleAddExisting() {
    if (!selectedExerciseId) return;
    setAdding(true);
    setModalError("");
    try {
      const res = await fetch(`/api/patient/training/workouts/${workoutId}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId: selectedExerciseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao adicionar exercício");
      setExercises((prev) => [...prev, data.workoutExercise]);
      closeModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Falha ao adicionar exercício");
    } finally {
      setAdding(false);
    }
  }

  async function handleCreateAndAdd() {
    if (!newName.trim()) return;
    setCreating(true);
    setModalError("");
    try {
      // 1. Create the exercise
      const createRes = await fetch("/api/patient/training/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || null,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error ?? "Falha ao criar exercício");

      const exerciseId = createData.exercise?.id;

      // 2. Add to workout
      const addRes = await fetch(`/api/patient/training/workouts/${workoutId}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId }),
      });
      const addData = await addRes.json();
      if (!addRes.ok) throw new Error(addData.error ?? "Falha ao adicionar exercício");

      setExercises((prev) => [...prev, addData.workoutExercise]);
      // Also add to allExercises for future modal opens
      setAllExercises((prev) => [...prev, createData.exercise]);
      closeModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Falha ao criar exercício");
    } finally {
      setCreating(false);
    }
  }

  const filteredExercises = allExercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass =
    "w-full h-10 px-3 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E8B5A] focus:ring-2 focus:ring-[rgba(46,139,90,0.15)] transition-all duration-150";
  const labelClass = "block text-[12px] font-semibold text-[#374151] mb-1";

  return (
    <div className="p-4 md:p-8 max-w-[900px]">
      <Link
        href="/patient/training/workouts"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Back to Workouts
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight">
              {loading ? (
                <span className="inline-block w-40 h-6 bg-[#F3F4F6] rounded animate-pulse" />
              ) : (
                workout?.name ?? "Workout"
              )}
            </h1>
            {!loading && workout?.assignedByProfessionalId && (
              <span className="text-[11px] font-semibold text-[#2563EB] bg-[rgba(37,99,235,0.08)] px-2.5 py-0.5 rounded-full">
                Assigned
              </span>
            )}
          </div>
          {!loading && workout?.description && (
            <p className="text-sm font-medium text-[#6B7280]">{workout.description}</p>
          )}
        </div>

        {!loading && workout && (
          <div className="flex items-center gap-2">
            <button
              onClick={openModal}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-semibold text-[#374151] bg-white border border-[#E5E7EB] rounded-[10px] hover:bg-[#F9FAFB] transition-colors duration-150"
            >
              <Plus size={13} />
              Exercício
            </button>
            <Link
              href={`/patient/training/sessions/new?workoutId=${workout.id}`}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] hover:bg-[#277A4F] hover:-translate-y-px transition-all duration-150"
            >
              <Play size={13} />
              Start Session
            </Link>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonPanel />
      ) : exercises.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center">
          <p className="text-[14px] text-[#6B7280]">No exercises in this workout.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F3F4F6]">
            <p className="text-[14px] font-semibold text-[#111827]">
              {exercises.length} Exercise{exercises.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {[...exercises]
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((ex, idx) => (
                <button
                  key={ex.id}
                  onClick={() => setDetailExerciseId(ex.exerciseId)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-[#F9FAFB] transition-colors duration-100 text-left"
                >
                  <span className="text-[12px] font-semibold text-[#9CA3AF] w-5 shrink-0">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#111827]">{ex.exerciseName}</p>
                    {ex.exerciseDescription && (
                      <p className="text-[12px] text-[#9CA3AF] mt-0.5 truncate">{ex.exerciseDescription}</p>
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

      {/* Add Exercise Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[85vh]">

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
              <h2 className="text-[16px] font-extrabold text-[#111827]">Adicionar exercício</h2>
              <button
                onClick={closeModal}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors duration-100"
              >
                <X size={15} />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-5 pb-3 shrink-0">
              <div className="flex gap-1 bg-[#F3F4F6] rounded-[10px] p-1">
                {(["existing", "new"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setModalError(""); }}
                    className={`flex-1 h-8 rounded-[8px] text-[13px] font-semibold transition-all duration-150 ${
                      activeTab === tab
                        ? "bg-white text-[#111827] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                        : "text-[#6B7280] hover:text-[#374151]"
                    }`}
                  >
                    {tab === "existing" ? "Existentes" : "Novo exercício"}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal error */}
            {modalError && (
              <div className="mx-5 mb-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-3 py-2 text-[12.5px] font-semibold text-[#DC2626] shrink-0">
                {modalError}
              </div>
            )}

            {/* Tab content */}
            {activeTab === "existing" ? (
              <>
                {/* Search */}
                <div className="px-5 pb-3 shrink-0">
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar exercício…"
                    className={inputClass}
                  />
                </div>

                {/* Exercise list */}
                <div className="flex-1 overflow-y-auto px-5 pb-3 min-h-0">
                  {exercisesLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-[#F3F4F6] rounded-[10px] animate-pulse" />
                      ))}
                    </div>
                  ) : filteredExercises.length === 0 ? (
                    <p className="text-[13px] text-[#9CA3AF] text-center py-6">
                      {search ? "Nenhum exercício encontrado." : "Nenhum exercício cadastrado."}
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {filteredExercises.map((ex) => (
                        <button
                          key={ex.id}
                          onClick={() => setSelectedExerciseId(ex.id === selectedExerciseId ? null : ex.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left transition-all duration-100 ${
                            selectedExerciseId === ex.id
                              ? "bg-[rgba(46,139,90,0.08)] border border-[rgba(46,139,90,0.2)]"
                              : "border border-transparent hover:bg-[#F9FAFB]"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors duration-100 ${
                              selectedExerciseId === ex.id
                                ? "border-[#2E8B5A] bg-[#2E8B5A]"
                                : "border-[#D1D5DB]"
                            }`}
                          >
                            {selectedExerciseId === ex.id && (
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#111827] truncate">{ex.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 pt-3 pb-5 border-t border-[#F3F4F6] shrink-0">
                  <button
                    onClick={handleAddExisting}
                    disabled={!selectedExerciseId || adding}
                    className="w-full h-10 rounded-[10px] bg-[#2E8B5A] text-white text-[13px] font-bold hover:bg-[#267a50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    {adding ? "Adicionando…" : "Adicionar ao treino"}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* New exercise form */}
                <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-3">
                  <div>
                    <label className={labelClass}>Nome <span className="text-[#DC2626]">*</span></label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="ex.: Supino reto"
                      className={inputClass}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Descrição <span className="font-normal text-[#9CA3AF]">(opcional)</span></label>
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
                <div className="px-5 pt-3 pb-5 border-t border-[#F3F4F6] shrink-0">
                  <button
                    onClick={handleCreateAndAdd}
                    disabled={!newName.trim() || creating}
                    className="w-full h-10 rounded-[10px] bg-[#2E8B5A] text-white text-[13px] font-bold hover:bg-[#267a50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    {creating ? "Criando…" : "Criar e adicionar"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Play, Plus, X, ChevronUp, ChevronDown, ArrowUpDown, Trophy } from "lucide-react";
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

function fmtWeight(w: string) {
  const n = parseFloat(w);
  return n % 1 === 0 ? String(parseInt(w)) : String(n);
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

  // Exercise detail sheet
  const [detailExerciseId, setDetailExerciseId] = useState<number | null>(null);

  // Add-exercise modal
  const [modalOpen, setModalOpen] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState<number | "new" | null>(null);
  const [modalError, setModalError] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Reorder state
  const [reorderMode, setReorderMode] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // PRs: exerciseId -> best { weightKg, reps } or null
  const [prs, setPrs] = useState<Record<number, { weightKg: string; reps: number | null } | null>>({});

  useEffect(() => {
    fetch(`/api/patient/training/workouts/${workoutId}`)
      .then((r) => r.json())
      .then(async (d) => {
        setWorkout(d.workout);
        const sorted = [...(d.exercises ?? [])].sort((a: WorkoutExercise, b: WorkoutExercise) => a.orderIndex - b.orderIndex);
        setExercises(sorted);

        const results = await Promise.all(
          sorted.map((ex: WorkoutExercise) =>
            fetch(`/api/patient/training/exercises/${ex.exerciseId}/prs`)
              .then((r) => r.json())
              .then((data) => ({ exerciseId: ex.exerciseId, prs: data.prs ?? [] }))
              .catch(() => ({ exerciseId: ex.exerciseId, prs: [] }))
          )
        );
        const map: Record<number, { weightKg: string; reps: number | null } | null> = {};
        for (const { exerciseId, prs: list } of results) {
          if (list.length === 0) { map[exerciseId] = null; continue; }
          const best = list.reduce((b: { weightKg: string; reps: number | null }, p: { weightKg: string; reps: number | null }) =>
            parseFloat(p.weightKg) > parseFloat(b.weightKg) ? p : b
          );
          map[exerciseId] = { weightKg: best.weightKg, reps: best.reps };
        }
        setPrs(map);
      })
      .catch(() => setError("Falha ao carregar treino"))
      .finally(() => setLoading(false));
  }, [workoutId]);

  function openModal() {
    setSearch("");
    setModalError("");
    setModalOpen(true);

    if (allExercises.length === 0) {
      setExercisesLoading(true);
      fetch("/api/patient/training/exercises")
        .then((r) => r.json())
        .then((d) => setAllExercises(d.exercises ?? []))
        .finally(() => setExercisesLoading(false));
    }

    setTimeout(() => searchRef.current?.focus(), 80);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function handleAddExercise(exerciseId: number) {
    setAdding(exerciseId);
    setModalError("");
    try {
      const res = await fetch(`/api/patient/training/workouts/${workoutId}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao adicionar exercício");
      setExercises((prev) => [...prev, data.workoutExercise]);
      setPrs((prev) => ({ ...prev, [exerciseId]: prev[exerciseId] ?? null }));
      closeModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Falha ao adicionar exercício");
    } finally {
      setAdding(null);
    }
  }

  async function handleCreateAndAdd() {
    const name = search.trim();
    if (!name) return;
    setAdding("new");
    setModalError("");
    try {
      const createRes = await fetch("/api/patient/training/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error ?? "Falha ao criar exercício");

      const exerciseId = createData.exercise?.id;

      const addRes = await fetch(`/api/patient/training/workouts/${workoutId}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId }),
      });
      const addData = await addRes.json();
      if (!addRes.ok) throw new Error(addData.error ?? "Falha ao adicionar exercício");

      setExercises((prev) => [...prev, addData.workoutExercise]);
      setAllExercises((prev) => [...prev, createData.exercise]);
      setPrs((prev) => ({ ...prev, [exerciseId]: null }));
      closeModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Falha ao criar exercício");
    } finally {
      setAdding(null);
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const sorted = [...exercises];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    // Optimistic swap
    const newOrder = [...sorted];
    const aIdx = newOrder[index].orderIndex;
    const bIdx = newOrder[swapIndex].orderIndex;
    newOrder[index] = { ...newOrder[index], orderIndex: bIdx };
    newOrder[swapIndex] = { ...newOrder[swapIndex], orderIndex: aIdx };
    newOrder.sort((a, b) => a.orderIndex - b.orderIndex);
    setExercises(newOrder);
    setSavingOrder(true);

    try {
      const res = await fetch(`/api/patient/training/workouts/${workoutId}/exercises`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercises: newOrder.map((e) => ({ id: e.id, orderIndex: e.orderIndex })),
        }),
      });
      if (!res.ok) throw new Error("Falha ao reordenar");
    } catch {
      setExercises(sorted);
    } finally {
      setSavingOrder(false);
    }
  }

  const filteredExercises = allExercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const showCreateButton = search.trim().length > 0 && filteredExercises.length === 0 && !exercisesLoading;

  const inputClass =
    "w-full h-10 px-3 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E8B5A] focus:ring-2 focus:ring-[rgba(46,139,90,0.15)] transition-all duration-150";

  return (
    <div className="p-4 md:p-8 max-w-[900px]">
      <Link
        href="/patient/training/workouts"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Voltar aos treinos
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight">
              {loading ? (
                <span className="inline-block w-40 h-6 bg-[#F3F4F6] rounded animate-pulse" />
              ) : (
                workout?.name ?? "Treino"
              )}
            </h1>
            {!loading && workout?.assignedByProfessionalId && (
              <span className="text-[11px] font-semibold text-[#2563EB] bg-[rgba(37,99,235,0.08)] px-2.5 py-0.5 rounded-full">
                Atribuído
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
              Iniciar sessão
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
          <p className="text-[14px] text-[#6B7280]">Nenhum exercício neste treino.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[#111827]">
              {exercises.length} exercício{exercises.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => setReorderMode((v) => !v)}
              className={`w-7 h-7 flex items-center justify-center rounded-[8px] transition-all duration-200 ${
                reorderMode
                  ? "bg-[rgba(46,139,90,0.12)] text-[#2E8B5A]"
                  : "text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F3F4F6]"
              }`}
              aria-label="Reordenar exercícios"
            >
              <ArrowUpDown size={14} />
            </button>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {exercises.map((ex, idx) => (
              <div
                key={ex.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                {/* Animated reorder buttons — slide in from left */}
                <div
                  style={{
                    width: reorderMode ? 28 : 0,
                    overflow: "hidden",
                    flexShrink: 0,
                    transition: "width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      transform: reorderMode ? "translateX(0)" : "translateX(-28px)",
                      opacity: reorderMode ? 1 : 0,
                      transition: "transform 220ms cubic-bezier(0.4, 0, 0.2, 1), opacity 160ms ease",
                    }}
                    className="flex flex-col gap-0.5"
                  >
                    <button
                      onClick={() => handleMove(idx, "up")}
                      disabled={idx === 0 || savingOrder}
                      className="w-7 h-6 flex items-center justify-center rounded text-[#9CA3AF] hover:text-[#2E8B5A] hover:bg-[rgba(46,139,90,0.08)] disabled:opacity-20 disabled:cursor-default transition-all duration-100"
                      aria-label="Mover para cima"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      onClick={() => handleMove(idx, "down")}
                      disabled={idx === exercises.length - 1 || savingOrder}
                      className="w-7 h-6 flex items-center justify-center rounded text-[#9CA3AF] hover:text-[#2E8B5A] hover:bg-[rgba(46,139,90,0.08)] disabled:opacity-20 disabled:cursor-default transition-all duration-100"
                      aria-label="Mover para baixo"
                    >
                      <ChevronDown size={13} />
                    </button>
                  </div>
                </div>

                {/* Index */}
                <span className="text-[12px] font-semibold text-[#9CA3AF] w-5 shrink-0 text-center">
                  {idx + 1}
                </span>

                {/* Name — tap to open detail */}
                <button
                  onClick={() => setDetailExerciseId(ex.exerciseId)}
                  className="flex-1 min-w-0 text-left py-0.5"
                >
                  <p className="text-[14px] font-semibold text-[#111827] hover:text-[#2E8B5A] transition-colors">
                    {ex.exerciseName}
                  </p>
                  {ex.exerciseDescription && (
                    <p className="text-[12px] text-[#9CA3AF] mt-0.5 truncate">{ex.exerciseDescription}</p>
                  )}
                </button>

                {/* PR badge */}
                {prs[ex.exerciseId] && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Trophy size={10} className="text-[#F59E0B]" />
                    <span className="text-[12px] font-semibold text-[#6B7280]">
                      {fmtWeight(prs[ex.exerciseId]!.weightKg)} kg
                      {prs[ex.exerciseId]!.reps ? ` × ${prs[ex.exerciseId]!.reps}` : ""}
                    </span>
                  </div>
                )}

                <span className="text-[12px] font-semibold text-[#2E8B5A] shrink-0">→</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exercise Detail Sheet */}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col h-[480px] max-h-[85vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
              <h2 className="text-[16px] font-extrabold text-[#111827]">Adicionar exercício</h2>
              <button
                onClick={closeModal}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors duration-100"
              >
                <X size={15} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pb-3 shrink-0">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setModalError(""); }}
                placeholder="Buscar exercício…"
                className={inputClass}
              />
            </div>

            {modalError && (
              <div className="mx-5 mb-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-3 py-2 text-[12.5px] font-semibold text-[#DC2626] shrink-0">
                {modalError}
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto px-5 pb-5 min-h-0">
              {exercisesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-[#F3F4F6] rounded-[10px] animate-pulse" />
                  ))}
                </div>
              ) : showCreateButton ? (
                <div className="py-4 text-center">
                  <p className="text-[13px] text-[#9CA3AF] mb-3">Nenhum resultado para "{search}"</p>
                  <button
                    onClick={handleCreateAndAdd}
                    disabled={adding === "new"}
                    className="inline-flex items-center gap-1.5 h-9 px-4 text-[13px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] hover:bg-[#277A4F] disabled:opacity-60 transition-all duration-150"
                  >
                    <Plus size={13} />
                    {adding === "new" ? "Criando…" : `Criar "${search.trim()}" e adicionar`}
                  </button>
                </div>
              ) : filteredExercises.length === 0 ? (
                <p className="text-[13px] text-[#9CA3AF] text-center py-6">
                  Nenhum exercício cadastrado ainda.
                </p>
              ) : (
                <div className="space-y-1">
                  {filteredExercises.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => handleAddExercise(ex.id)}
                      disabled={adding === ex.id}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-[10px] text-left border border-transparent hover:bg-[#F9FAFB] hover:border-[#E5E7EB] disabled:opacity-50 transition-all duration-100"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#111827] truncate">{ex.name}</p>
                        {ex.description && (
                          <p className="text-[11px] text-[#9CA3AF] truncate mt-0.5">{ex.description}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-[12px] font-semibold text-[#2E8B5A]">
                        {adding === ex.id ? "…" : "+"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

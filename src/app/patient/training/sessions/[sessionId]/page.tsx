"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Trash2, Plus, Trophy, ChevronDown, ChevronUp, Zap, Dumbbell } from "lucide-react";

interface SetData {
  id: number;
  setNumber: number;
  weightKg: string | null;
  reps: number | null;
  notes: string | null;
}

interface ExerciseData {
  sessionExerciseId: number;
  orderIndex: number;
  exerciseId: number;
  exerciseName: string;
  exerciseDescription: string | null;
  sets: SetData[];
}

interface Session {
  id: number;
  date: string;
  notes: string | null;
  workoutId: number | null;
}

interface PrData {
  id: number;
  weightKg: string;
  reps: number | null;
  date: string;
  notes: string | null;
}

interface AddSetForm {
  weightKg: string;
  reps: string;
  notes: string;
}

function formatSessionDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toLocaleDateString("pt-BR", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toLocaleDateString("pt-BR", {
    month: "short",
    day: "numeric",
  });
}

// ── New PR Toast ─────────────────────────────────────
function NewPrToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3800);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-[#2E8B5A] text-white px-5 py-3 rounded-2xl shadow-[0_8px_32px_rgba(46,139,90,0.35)] font-semibold text-[14px] whitespace-nowrap"
      style={{ animation: "prToastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both" }}
    >
      <Zap size={16} className="shrink-0" fill="white" />
      {message}
    </div>
  );
}

// ── PR History strip ──────────────────────────────────
function PrHistory({ prs, expanded }: { prs: PrData[]; expanded: boolean }) {
  if (!expanded || prs.length === 0) return null;
  const sorted = [...prs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="px-4 pb-3 pt-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-2">
        Histórico de PRs
      </p>
      <div className="flex flex-col gap-1.5">
        {sorted.map((pr, i) => (
          <div key={pr.id} className="flex items-center gap-3">
            <span className="text-[11px] text-[#9CA3AF] w-16 shrink-0">
              {formatShortDate(pr.date)}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={[
                "text-[13px] font-bold",
                i === 0 ? "text-[#2E8B5A]" : "text-[#374151]",
              ].join(" ")}>
                {parseFloat(pr.weightKg).toFixed(pr.weightKg.includes(".") && !pr.weightKg.endsWith(".00") ? 1 : 0)} kg
              </span>
              {pr.reps && (
                <span className="text-[11px] text-[#9CA3AF]">× {pr.reps}</span>
              )}
              {i === 0 && (
                <span className="text-[10px] font-bold text-[#2E8B5A] bg-[rgba(46,139,90,0.1)] px-1.5 py-0.5 rounded-full">
                  ATUAL
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Exercise Card ─────────────────────────────────────
function ExerciseCard({
  ex,
  prs,
  addForm,
  submitting,
  flashPr,
  onAddSet,
  onDeleteSet,
  onFormChange,
}: {
  ex: ExerciseData;
  prs: PrData[];
  addForm: AddSetForm;
  submitting: boolean;
  flashPr: boolean;
  onAddSet: () => void;
  onDeleteSet: (setId: number) => void;
  onFormChange: (field: keyof AddSetForm, value: string) => void;
}) {
  const [showPrHistory, setShowPrHistory] = useState(false);

  const bestPr = prs.length > 0
    ? prs.reduce((best, pr) => parseFloat(pr.weightKg) > parseFloat(best.weightKg) ? pr : best, prs[0])
    : null;

  const inputCls = "h-10 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:bg-white focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.14)] transition-all duration-150";

  return (
    <div
      className={[
        "bg-white rounded-2xl overflow-hidden transition-all duration-500",
        flashPr
          ? "shadow-[0_0_0_2px_#2E8B5A,0_8px_32px_rgba(46,139,90,0.18)]"
          : "border border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.04)]",
      ].join(" ")}
    >
      {/* ── Header ── */}
      <div className={[
        "px-4 py-3.5 flex items-center justify-between transition-colors duration-500",
        flashPr ? "bg-[rgba(46,139,90,0.06)]" : "bg-white border-b border-[#F3F4F6]",
      ].join(" ")}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-[7px] bg-[rgba(46,139,90,0.10)] flex items-center justify-center shrink-0">
            <Dumbbell size={13} className="text-[#2E8B5A]" strokeWidth={2.2} />
          </div>
          <h3 className="text-[14px] font-bold text-[#111827] truncate">
            {ex.exerciseName}
          </h3>
          {ex.sets.length > 0 && (
            <span className="shrink-0 text-[11px] font-semibold text-[#9CA3AF] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
              {ex.sets.length} série{ex.sets.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* PR badge */}
        {bestPr && (
          <button
            onClick={() => setShowPrHistory((v) => !v)}
            className={[
              "shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors duration-150",
              showPrHistory
                ? "bg-[#2E8B5A] text-white"
                : "bg-[rgba(46,139,90,0.10)] text-[#2E8B5A] hover:bg-[rgba(46,139,90,0.16)]",
            ].join(" ")}
          >
            <Trophy size={10} strokeWidth={2.5} />
            {parseFloat(bestPr.weightKg).toFixed(
              bestPr.weightKg.includes(".") && !bestPr.weightKg.endsWith(".00") ? 1 : 0
            )} kg
            {showPrHistory ? <ChevronUp size={10} strokeWidth={2.5} /> : <ChevronDown size={10} strokeWidth={2.5} />}
          </button>
        )}
      </div>

      {/* ── PR History ── */}
      <PrHistory prs={prs} expanded={showPrHistory} />

      {/* ── Sets list ── */}
      {ex.sets.length > 0 && (
        <div className="px-4 py-2 space-y-1">
          {ex.sets.map((set) => (
            <div
              key={set.id}
              className="flex items-center gap-3 py-2 group"
            >
              {/* Set number */}
              <span className="w-6 h-6 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[11px] font-bold text-[#9CA3AF] shrink-0">
                {set.setNumber}
              </span>

              {/* Weight */}
              <div className="flex-1 flex items-baseline gap-3 min-w-0">
                {set.weightKg ? (
                  <span className="text-[15px] font-bold text-[#111827] tracking-tight">
                    {parseFloat(set.weightKg).toFixed(
                      set.weightKg.includes(".") && !set.weightKg.endsWith(".00") ? 1 : 0
                    )}
                    <span className="text-[12px] font-medium text-[#9CA3AF] ml-0.5">kg</span>
                  </span>
                ) : (
                  <span className="text-[15px] font-bold text-[#D1D5DB]">—</span>
                )}

                {/* Reps */}
                {set.reps && (
                  <span className="text-[13px] font-medium text-[#6B7280]">
                    × {set.reps}
                  </span>
                )}

                {/* Notes */}
                {set.notes && (
                  <span className="text-[12px] text-[#9CA3AF] truncate hidden sm:block">
                    {set.notes}
                  </span>
                )}
              </div>

              {/* Delete */}
              <button
                onClick={() => onDeleteSet(set.id)}
                className="opacity-0 group-hover:opacity-100 text-[#D1D5DB] hover:text-[#DC2626] transition-all duration-100 shrink-0"
                title="Remover série"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Add set form ── */}
      <div className={[
        "px-4 py-3 border-t border-[#F3F4F6]",
        ex.sets.length > 0 ? "mt-1" : "",
      ].join(" ")}>
        {/* Mobile: inputs on top row, button full-width below */}
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Peso (kg)"
              value={addForm.weightKg}
              onChange={(e) => onFormChange("weightKg", e.target.value)}
              className={`${inputCls} flex-1 min-w-0 w-0`}
              min="0"
              step="0.5"
            />
            <input
              type="number"
              placeholder="Repetições"
              value={addForm.reps}
              onChange={(e) => onFormChange("reps", e.target.value)}
              className={`${inputCls} flex-1 min-w-0 w-0`}
              min="0"
            />
          </div>
          <button
            onClick={onAddSet}
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-1.5 h-10 text-[13px] font-bold text-white bg-[#2E8B5A] rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_2px_8px_rgba(46,139,90,0.20)] hover:bg-[#277A4F] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
          >
            <Plus size={14} strokeWidth={2.5} />
            {submitting ? "Adicionando…" : "Adicionar série"}
          </button>
        </div>

        {/* Desktop: all inline */}
        <div className="hidden sm:flex items-center gap-2">
          <input
            type="number"
            placeholder="kg"
            value={addForm.weightKg}
            onChange={(e) => onFormChange("weightKg", e.target.value)}
            className={`${inputCls} w-24`}
            min="0"
            step="0.5"
          />
          <input
            type="number"
            placeholder="reps"
            value={addForm.reps}
            onChange={(e) => onFormChange("reps", e.target.value)}
            className={`${inputCls} w-24`}
            min="0"
          />
          <input
            type="text"
            placeholder="obs."
            value={addForm.notes}
            onChange={(e) => onFormChange("notes", e.target.value)}
            className={`${inputCls} flex-1 min-w-0`}
          />
          <button
            onClick={onAddSet}
            disabled={submitting}
            className="shrink-0 inline-flex items-center gap-1.5 h-10 px-4 text-[13px] font-bold text-white bg-[#2E8B5A] rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_2px_8px_rgba(46,139,90,0.20)] hover:bg-[#277A4F] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
          >
            <Plus size={14} strokeWidth={2.5} />
            {submitting ? "…" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden animate-pulse">
      <div className="px-4 py-3.5 border-b border-[#F3F4F6] flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-[7px] bg-[#F3F4F6]" />
        <div className="h-4 w-32 bg-[#F3F4F6] rounded" />
      </div>
      <div className="px-4 py-4 space-y-2">
        <div className="h-3 bg-[#F3F4F6] rounded w-3/4" />
        <div className="h-3 bg-[#F3F4F6] rounded w-1/2" />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────
export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [exercisePrs, setExercisePrs] = useState<Record<number, PrData[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addForms, setAddForms] = useState<Record<number, AddSetForm>>({});
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});
  const [flashPr, setFlashPr] = useState<Record<number, boolean>>({});
  const [prToast, setPrToast] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    const res = await fetch(`/api/patient/training/sessions/${sessionId}`);
    if (!res.ok) throw new Error("Falha ao carregar sessão");
    const data = await res.json();
    setSession(data.session);
    setExercises(data.exercises);
    setAddForms((prev) => {
      const merged: Record<number, AddSetForm> = {};
      for (const ex of data.exercises) {
        merged[ex.sessionExerciseId] = prev[ex.sessionExerciseId] ?? { weightKg: "", reps: "", notes: "" };
      }
      return merged;
    });
    return data.exercises as ExerciseData[];
  }, [sessionId]);

  const loadPrs = useCallback(async (exs: ExerciseData[]) => {
    const results = await Promise.all(
      exs.map((ex) =>
        fetch(`/api/patient/training/exercises/${ex.exerciseId}/prs`)
          .then((r) => r.json())
          .then((d) => ({ exerciseId: ex.exerciseId, prs: d.prs ?? [] }))
          .catch(() => ({ exerciseId: ex.exerciseId, prs: [] }))
      )
    );
    const map: Record<number, PrData[]> = {};
    for (const r of results) map[r.exerciseId] = r.prs;
    setExercisePrs(map);
  }, []);

  useEffect(() => {
    loadSession()
      .then(loadPrs)
      .catch(() => setError("Falha ao carregar sessão"))
      .finally(() => setLoading(false));
  }, [loadSession, loadPrs]);

  const handleAddSet = async (sessionExerciseId: number, exerciseId: number) => {
    const form = addForms[sessionExerciseId];
    if (!form) return;
    setSubmitting((prev) => ({ ...prev, [sessionExerciseId]: true }));
    try {
      const res = await fetch(`/api/patient/training/sessions/${sessionId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionExerciseId,
          weightKg: form.weightKg ? parseFloat(form.weightKg) : undefined,
          reps: form.reps ? parseInt(form.reps) : undefined,
          notes: form.notes || undefined,
        }),
      });
      if (!res.ok) throw new Error("Falha ao adicionar série");
      const data = await res.json();

      // New PR celebration
      if (data.newPr) {
        const weight = parseFloat(data.newPr.weightKg);
        setPrToast(`Novo PR! ${weight % 1 === 0 ? weight.toFixed(0) : weight.toFixed(1)} kg`);
        setFlashPr((prev) => ({ ...prev, [sessionExerciseId]: true }));
        setTimeout(() => setFlashPr((prev) => ({ ...prev, [sessionExerciseId]: false })), 2000);
        // Refresh PRs for this exercise
        fetch(`/api/patient/training/exercises/${exerciseId}/prs`)
          .then((r) => r.json())
          .then((d) => setExercisePrs((prev) => ({ ...prev, [exerciseId]: d.prs ?? [] })));
      }

      setAddForms((prev) => ({
        ...prev,
        [sessionExerciseId]: { weightKg: "", reps: "", notes: "" },
      }));
      await loadSession();
    } catch {
      setError("Falha ao adicionar série");
    } finally {
      setSubmitting((prev) => ({ ...prev, [sessionExerciseId]: false }));
    }
  };

  const handleDeleteSet = async (setId: number) => {
    try {
      const res = await fetch(
        `/api/patient/training/sessions/${sessionId}/sets/${setId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      await loadSession();
    } catch {
      setError("Falha ao excluir série");
    }
  };

  const totalSets = exercises.reduce((s, ex) => s + ex.sets.length, 0);

  return (
    <>
      <style>{`
        @keyframes prToastIn {
          from { opacity: 0; transform: translate(-50%, -16px) scale(0.92); }
          to   { opacity: 1; transform: translate(-50%, 0)    scale(1); }
        }
      `}</style>

      {prToast && (
        <NewPrToast message={prToast} onDismiss={() => setPrToast(null)} />
      )}

      <div className="p-4 md:p-8 max-w-[680px]">
        {/* Back link */}
        <Link
          href="/patient/training/sessions"
          className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
        >
          ← Voltar às sessões
        </Link>

        {/* Header */}
        <div className="mb-6">
          {loading ? (
            <div className="space-y-2">
              <div className="h-7 w-52 bg-[#F3F4F6] rounded-lg animate-pulse" />
              <div className="h-4 w-24 bg-[#F3F4F6] rounded animate-pulse" />
            </div>
          ) : (
            <>
              <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight capitalize mb-0.5">
                {session ? formatSessionDate(session.date) : "Sessão"}
              </h1>
              <div className="flex items-center gap-3">
                {totalSets > 0 && (
                  <span className="text-[13px] font-medium text-[#9CA3AF]">
                    {totalSets} série{totalSets !== 1 ? "s" : ""} registrada{totalSets !== 1 ? "s" : ""}
                  </span>
                )}
                {session?.notes && (
                  <>
                    <span className="text-[#E5E7EB]">·</span>
                    <span className="text-[13px] text-[#6B7280]">{session.notes}</span>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
            {error}
          </div>
        )}

        {/* Exercise cards */}
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="space-y-4">
            {exercises.map((ex) => (
              <ExerciseCard
                key={ex.sessionExerciseId}
                ex={ex}
                prs={exercisePrs[ex.exerciseId] ?? []}
                addForm={addForms[ex.sessionExerciseId] ?? { weightKg: "", reps: "", notes: "" }}
                submitting={submitting[ex.sessionExerciseId] ?? false}
                flashPr={flashPr[ex.sessionExerciseId] ?? false}
                onAddSet={() => handleAddSet(ex.sessionExerciseId, ex.exerciseId)}
                onDeleteSet={handleDeleteSet}
                onFormChange={(field, value) =>
                  setAddForms((prev) => ({
                    ...prev,
                    [ex.sessionExerciseId]: {
                      ...prev[ex.sessionExerciseId],
                      [field]: value,
                    },
                  }))
                }
              />
            ))}

            {exercises.length === 0 && (
              <div className="bg-white border border-[#E5E7EB] rounded-2xl px-5 py-8 text-center">
                <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center mx-auto mb-3">
                  <Dumbbell size={18} className="text-[#9CA3AF]" />
                </div>
                <p className="text-[14px] font-semibold text-[#374151] mb-1">Nenhum exercício</p>
                <p className="text-[13px] text-[#9CA3AF]">Esta sessão não tem exercícios registrados.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

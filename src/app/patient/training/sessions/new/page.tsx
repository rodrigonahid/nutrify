"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Exercise {
  id: number;
  name: string;
}

interface Workout {
  id: number;
  name: string;
  exercises: Array<{ exerciseId: number; exerciseName: string }>;
}

const inputCls = "w-full h-11 px-3.5 bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-[10px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] hover:bg-[#F3F4F6] focus:outline-none focus:bg-white focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.16)] transition-all duration-150";
const labelCls = "block text-[14px] font-semibold text-[#374151] mb-1.5";

function NewSessionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedWorkoutId = searchParams.get("workoutId");

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [workoutId, setWorkoutId] = useState(preselectedWorkoutId ?? "");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadAll = async () => {
      const [exRes, workoutsRes] = await Promise.all([
        fetch("/api/patient/training/exercises"),
        fetch("/api/patient/training/workouts"),
      ]);
      const [exData, workoutsData] = await Promise.all([
        exRes.json(),
        workoutsRes.json(),
      ]);
      setExercises(exData.exercises ?? []);

      const workoutDetails: Workout[] = [];
      for (const w of workoutsData.workouts ?? []) {
        const wRes = await fetch(`/api/patient/training/workouts/${w.id}`);
        const wData = await wRes.json();
        workoutDetails.push({
          id: w.id,
          name: w.name,
          exercises: wData.exercises.map((e: { exerciseId: number; exerciseName: string }) => ({
            exerciseId: e.exerciseId,
            exerciseName: e.exerciseName,
          })),
        });
      }
      setWorkouts(workoutDetails);

      if (preselectedWorkoutId) {
        const found = workoutDetails.find((w) => w.id === parseInt(preselectedWorkoutId));
        if (found) setSelectedIds(new Set(found.exercises.map((e) => e.exerciseId)));
      }
    };
    loadAll().catch(() => setError("Failed to load data"));
  }, [preselectedWorkoutId]);

  const handleWorkoutChange = (wId: string) => {
    setWorkoutId(wId);
    if (!wId) return;
    const found = workouts.find((w) => w.id === parseInt(wId));
    if (found) setSelectedIds(new Set(found.exercises.map((e) => e.exerciseId)));
  };

  const toggleExercise = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.size === 0) { setError("Please select at least one exercise"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/patient/training/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          workoutId: workoutId ? parseInt(workoutId) : undefined,
          notes: notes || undefined,
          exerciseIds: Array.from(selectedIds),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create session");
      }
      const data = await res.json();
      router.push(`/patient/training/sessions/${data.session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626]">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="date" className={labelCls}>Date *</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="workout" className={labelCls}>Workout Template (optional)</label>
        <select
          id="workout"
          value={workoutId}
          onChange={(e) => handleWorkoutChange(e.target.value)}
          className={inputCls}
        >
          <option value="">— No template —</option>
          {workouts.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls}>Exercises *</label>
        {exercises.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-[13px] text-[#6B7280]">
            No exercises yet.{" "}
            <Link href="/patient/training/exercises/create" className="text-[#2E8B5A] font-semibold hover:underline">
              Create exercises first
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden divide-y divide-[#F3F4F6] max-h-64 overflow-y-auto">
            {exercises.map((ex) => (
              <label
                key={ex.id}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F9FAFB] transition-colors duration-100"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(ex.id)}
                  onChange={() => toggleExercise(ex.id)}
                  className="w-4 h-4 accent-[#2E8B5A]"
                />
                <span className="flex-1 text-[13px] font-medium text-[#374151]">{ex.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="notes" className={labelCls}>Notes</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional session notes"
          rows={2}
          className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-[10px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] focus:outline-none focus:bg-white focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.16)] transition-all duration-150 resize-none"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center h-11 px-5 text-[14px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] hover:bg-[#277A4F] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
        >
          {loading ? "Creating…" : "Start Session"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center h-11 px-5 text-[14px] font-semibold text-[#374151] bg-white border-[1.5px] border-[#E5E7EB] rounded-[10px] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-all duration-150"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function NewSessionPage() {
  return (
    <div className="p-4 md:p-8 max-w-[680px]">
      <Link
        href="/patient/training/sessions"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Back to Sessions
      </Link>

      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight">
          New Training Session
        </h1>
      </div>

      <Suspense fallback={
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-11 bg-[#F3F4F6] rounded-[10px] animate-pulse" />)}
        </div>
      }>
        <NewSessionForm />
      </Suspense>
    </div>
  );
}

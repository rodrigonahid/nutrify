"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, X } from "lucide-react";

interface Exercise {
  id: number;
  name: string;
  muscleGroupName: string | null;
}

const inputCls = "w-full h-11 px-3.5 bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-[10px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] hover:bg-[#F3F4F6] focus:outline-none focus:bg-white focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.16)] transition-all duration-150";
const labelCls = "block text-[14px] font-semibold text-[#374151] mb-1.5";

export default function CreateWorkoutPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Inline create exercise state
  const [showCreate, setShowCreate] = useState(false);
  const [newExName, setNewExName] = useState("");
  const [creatingEx, setCreatingEx] = useState(false);
  const [createError, setCreateError] = useState("");

  const loadExercises = () =>
    fetch("/api/patient/training/exercises")
      .then((r) => r.json())
      .then((d) => setExercises(d.exercises ?? []));

  useEffect(() => {
    loadExercises().catch(() => setError("Failed to load exercises"));
  }, []);

  const handleCreateExercise = async () => {
    if (!newExName.trim()) return;
    setCreatingEx(true);
    setCreateError("");
    try {
      const res = await fetch("/api/patient/training/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newExName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create exercise");
      }
      const data = await res.json();
      await loadExercises();
      setSelectedIds((prev) => new Set([...prev, data.exercise.id]));
      setNewExName("");
      setShowCreate(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create exercise");
    } finally {
      setCreatingEx(false);
    }
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
      const res = await fetch("/api/patient/training/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
          exerciseIds: Array.from(selectedIds),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create workout");
      }
      router.push("/patient/training/workouts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[680px]">
      <Link
        href="/patient/training/workouts"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Back to Workouts
      </Link>

      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight">New Workout</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626]">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className={labelCls}>Workout Name *</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Push Day A"
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="description" className={labelCls}>Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={2}
            className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-[10px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] focus:outline-none focus:bg-white focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.16)] transition-all duration-150 resize-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelCls.replace(" mb-1.5", "")}>Exercises *</label>
            <button
              type="button"
              onClick={() => { setShowCreate((v) => !v); setCreateError(""); }}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#6B7280] hover:text-[#2E8B5A] transition-colors"
            >
              {showCreate ? (
                <><X size={12} /> Cancel</>
              ) : (
                <><Plus size={12} /> New exercise</>
              )}
            </button>
          </div>

          {showCreate && (
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3.5 mb-3 space-y-2.5">
              <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
                Create new exercise
              </p>
              {createError && (
                <p className="text-[12px] font-semibold text-[#DC2626]">{createError}</p>
              )}
              <input
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateExercise(); } }}
                placeholder="Exercise name"
                className={inputCls}
              />
              <button
                type="button"
                onClick={handleCreateExercise}
                disabled={creatingEx}
                className="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-semibold text-white bg-[#2E8B5A] rounded-[8px] hover:bg-[#277A4F] disabled:opacity-60 transition-colors"
              >
                {creatingEx ? "Creating…" : "Create & add"}
              </button>
            </div>
          )}

          {exercises.length === 0 && !showCreate ? (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-[13px] text-[#6B7280]">
              No exercises yet. Click <strong>New exercise</strong> above to create one.
            </div>
          ) : exercises.length > 0 ? (
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
                  {ex.muscleGroupName && (
                    <span className="text-[11px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
                      {ex.muscleGroupName}
                    </span>
                  )}
                </label>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center h-11 px-5 text-[14px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] hover:bg-[#277A4F] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
          >
            {loading ? "Creating…" : "Create Workout"}
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
    </div>
  );
}

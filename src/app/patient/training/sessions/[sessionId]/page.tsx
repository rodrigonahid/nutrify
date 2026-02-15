"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Trash2, Plus } from "lucide-react";

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
  muscleGroupName: string | null;
  sets: SetData[];
}

interface Session {
  id: number;
  date: string;
  notes: string | null;
  muscleGroupName: string | null;
  workoutId: number | null;
}

interface AddSetForm {
  weightKg: string;
  reps: string;
  notes: string;
}

function SkeletonExercise() {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden animate-pulse">
      <div className="px-4 py-3 border-b border-[#F3F4F6]">
        <div className="h-4 w-40 bg-[#F3F4F6] rounded" />
      </div>
      <div className="p-4 space-y-2">
        {[1, 2].map((i) => <div key={i} className="h-3 bg-[#F3F4F6] rounded" />)}
      </div>
    </div>
  );
}

function formatSessionDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const inputCls = "h-9 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] text-[13px] text-[#111827] placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] focus:outline-none focus:bg-white focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.16)] transition-all duration-150";

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<Session | null>(null);
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addForms, setAddForms] = useState<Record<number, AddSetForm>>({});
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});

  const loadSession = useCallback(async () => {
    const res = await fetch(`/api/patient/training/sessions/${sessionId}`);
    if (!res.ok) throw new Error("Failed to load session");
    const data = await res.json();
    setSession(data.session);
    setExercises(data.exercises);
    const forms: Record<number, AddSetForm> = {};
    for (const ex of data.exercises) {
      forms[ex.sessionExerciseId] = { weightKg: "", reps: "", notes: "" };
    }
    setAddForms((prev) => {
      const merged = { ...forms };
      for (const key of Object.keys(prev)) {
        merged[parseInt(key)] = prev[parseInt(key)];
      }
      return merged;
    });
  }, [sessionId]);

  useEffect(() => {
    loadSession()
      .catch(() => setError("Failed to load session"))
      .finally(() => setLoading(false));
  }, [loadSession]);

  const handleAddSet = async (sessionExerciseId: number) => {
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
      if (!res.ok) throw new Error("Failed to add set");
      setAddForms((prev) => ({
        ...prev,
        [sessionExerciseId]: { weightKg: "", reps: "", notes: "" },
      }));
      await loadSession();
    } catch {
      setError("Failed to add set");
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
      if (!res.ok) throw new Error("Failed to delete set");
      await loadSession();
    } catch {
      setError("Failed to delete set");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[900px]">
      <Link
        href="/patient/training/sessions"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Back to Sessions
      </Link>

      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
          {loading ? (
            <span className="inline-block w-48 h-6 bg-[#F3F4F6] rounded animate-pulse" />
          ) : (
            session ? formatSessionDate(session.date) : "Session"
          )}
        </h1>
        {!loading && session?.muscleGroupName && (
          <span className="inline-block text-[11px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2.5 py-0.5 rounded-full mt-1">
            {session.muscleGroupName}
          </span>
        )}
        {!loading && session?.notes && (
          <p className="text-sm font-medium text-[#6B7280] mt-1">{session.notes}</p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <SkeletonExercise />
          <SkeletonExercise />
        </div>
      ) : (
        <div className="space-y-4">
          {exercises.map((ex) => (
            <div
              key={ex.sessionExerciseId}
              className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden"
            >
              {/* Exercise header */}
              <div className="px-4 py-3 border-b border-[#F3F4F6]">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/patient/training/exercises/${ex.exerciseId}`}
                    className="text-[14px] font-semibold text-[#111827] hover:text-[#2E8B5A] transition-colors"
                  >
                    {ex.exerciseName}
                  </Link>
                  {ex.muscleGroupName && (
                    <span className="text-[11px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
                      {ex.muscleGroupName}
                    </span>
                  )}
                </div>
              </div>

              {/* Sets table */}
              {ex.sets.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-[#F3F4F6]">
                        <th className="text-left px-4 py-2 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider w-10">Set</th>
                        <th className="text-left px-4 py-2 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Weight</th>
                        <th className="text-left px-4 py-2 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Reps</th>
                        <th className="text-left px-4 py-2 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Notes</th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {ex.sets.map((set) => (
                        <tr key={set.id} className="border-b border-[#F3F4F6] last:border-0">
                          <td className="px-4 py-2.5 text-[#9CA3AF]">{set.setNumber}</td>
                          <td className="px-4 py-2.5 font-medium text-[#111827]">
                            {set.weightKg ? `${set.weightKg} kg` : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-[#374151]">{set.reps ?? "—"}</td>
                          <td className="px-4 py-2.5 text-[#9CA3AF] text-[12px]">{set.notes ?? ""}</td>
                          <td className="px-2 py-2.5">
                            <button
                              onClick={() => handleDeleteSet(set.id)}
                              className="text-[#D1D5DB] hover:text-[#DC2626] transition-colors duration-100"
                              title="Delete set"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add set form */}
              <div className="px-4 py-3 bg-[#F9FAFB] border-t border-[#F3F4F6]">
                <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                  Add Set
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="kg"
                      value={addForms[ex.sessionExerciseId]?.weightKg ?? ""}
                      onChange={(e) =>
                        setAddForms((prev) => ({
                          ...prev,
                          [ex.sessionExerciseId]: {
                            ...prev[ex.sessionExerciseId],
                            weightKg: e.target.value,
                          },
                        }))
                      }
                      className={`${inputCls} w-20`}
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="reps"
                      value={addForms[ex.sessionExerciseId]?.reps ?? ""}
                      onChange={(e) =>
                        setAddForms((prev) => ({
                          ...prev,
                          [ex.sessionExerciseId]: {
                            ...prev[ex.sessionExerciseId],
                            reps: e.target.value,
                          },
                        }))
                      }
                      className={`${inputCls} w-20`}
                      min="0"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="notes (optional)"
                    value={addForms[ex.sessionExerciseId]?.notes ?? ""}
                    onChange={(e) =>
                      setAddForms((prev) => ({
                        ...prev,
                        [ex.sessionExerciseId]: {
                          ...prev[ex.sessionExerciseId],
                          notes: e.target.value,
                        },
                      }))
                    }
                    className={`${inputCls} w-36`}
                  />
                  <button
                    onClick={() => handleAddSet(ex.sessionExerciseId)}
                    disabled={submitting[ex.sessionExerciseId]}
                    className="inline-flex items-center gap-1 h-9 px-3 text-[13px] font-semibold text-white bg-[#2E8B5A] rounded-[8px] hover:bg-[#277A4F] disabled:opacity-60 transition-colors duration-100"
                  >
                    <Plus size={13} />
                    {submitting[ex.sessionExerciseId] ? "Adding…" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

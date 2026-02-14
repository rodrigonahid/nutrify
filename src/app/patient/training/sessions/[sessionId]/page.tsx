"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<Session | null>(null);
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addForms, setAddForms] = useState<Record<number, AddSetForm>>({});
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});

  const loadSession = useCallback(async () => {
    const res = await fetch(`/api/patient/training/sessions/${sessionId}`);
    if (!res.ok) throw new Error("Failed to load session");
    const data = await res.json();
    setSession(data.session);
    setExercises(data.exercises);
    // Initialize add forms for each exercise
    const forms: Record<number, AddSetForm> = {};
    for (const ex of data.exercises) {
      forms[ex.sessionExerciseId] = { weightKg: "", reps: "", notes: "" };
    }
    setAddForms((prev) => {
      // Only set for new keys, preserve existing state
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

      // Clear the form inputs
      setAddForms((prev) => ({
        ...prev,
        [sessionExerciseId]: { weightKg: "", reps: "", notes: "" },
      }));

      // Refresh session data
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Training Session">
          <LogoutButton />
        </PageHeader>
        <main className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Training Session">
          <LogoutButton />
        </PageHeader>
        <main className="container mx-auto px-4 py-8">
          <p className="text-red-500">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={`Session — ${session?.date}`}>
        <LogoutButton />
      </PageHeader>

      <main className="container mx-auto px-4 py-8 max-w-[900px]">
        <div className="mb-6">
          <a
            href="/patient/training/sessions"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Sessions
          </a>
        </div>

        {error && (
          <p className="text-red-500 mb-4 text-sm">{error}</p>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold">{session?.date}</h1>
          {session?.muscleGroupName && (
            <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded mt-1 inline-block">
              {session.muscleGroupName}
            </span>
          )}
          {session?.notes && (
            <p className="mt-2 text-muted-foreground">{session.notes}</p>
          )}
        </div>

        <div className="space-y-8">
          {exercises.map((ex) => (
            <div key={ex.sessionExerciseId} className="border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b flex items-center justify-between">
                <div>
                  <a
                    href={`/patient/training/exercises/${ex.exerciseId}`}
                    className="font-semibold hover:underline"
                  >
                    {ex.exerciseName}
                  </a>
                  {ex.muscleGroupName && (
                    <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {ex.muscleGroupName}
                    </span>
                  )}
                </div>
              </div>

              {/* Sets table */}
              {ex.sets.length > 0 && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/10">
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground w-12">Set</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Weight (kg)</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Reps</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Notes</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ex.sets.map((set) => (
                      <tr key={set.id} className="border-b last:border-0">
                        <td className="px-4 py-2 text-muted-foreground">{set.setNumber}</td>
                        <td className="px-4 py-2">{set.weightKg ?? "—"}</td>
                        <td className="px-4 py-2">{set.reps ?? "—"}</td>
                        <td className="px-4 py-2 text-muted-foreground text-xs">{set.notes ?? ""}</td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() => handleDeleteSet(set.id)}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                            title="Delete set"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Add set form */}
              <div className="px-4 py-3 border-t bg-muted/5">
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                  Add Set
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Input
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
                      className="w-20 text-sm"
                      min="0"
                      step="0.5"
                    />
                    <span className="text-sm text-muted-foreground">kg</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Input
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
                      className="w-20 text-sm"
                      min="0"
                    />
                    <span className="text-sm text-muted-foreground">reps</span>
                  </div>
                  <Input
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
                    className="w-40 text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAddSet(ex.sessionExerciseId)}
                    disabled={submitting[ex.sessionExerciseId]}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {submitting[ex.sessionExerciseId] ? "Adding..." : "Add"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MuscleGroup {
  id: number;
  name: string;
}

interface Exercise {
  id: number;
  name: string;
  muscleGroupName: string | null;
}

interface Workout {
  id: number;
  name: string;
  exercises: Array<{ exerciseId: number; exerciseName: string }>;
}

function NewSessionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedWorkoutId = searchParams.get("workoutId");

  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [muscleGroupId, setMuscleGroupId] = useState("");
  const [workoutId, setWorkoutId] = useState(preselectedWorkoutId ?? "");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadAll = async () => {
      const [groupsRes, exRes, workoutsRes] = await Promise.all([
        fetch("/api/patient/training/muscle-groups"),
        fetch("/api/patient/training/exercises"),
        fetch("/api/patient/training/workouts"),
      ]);
      const [groupsData, exData, workoutsData] = await Promise.all([
        groupsRes.json(),
        exRes.json(),
        workoutsRes.json(),
      ]);
      setMuscleGroups(groupsData.muscleGroups);
      setExercises(exData.exercises);

      // For each workout, fetch exercises
      const workoutDetails: Workout[] = [];
      for (const w of workoutsData.workouts) {
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

      // If a workoutId was pre-selected, populate exercises
      if (preselectedWorkoutId) {
        const found = workoutDetails.find((w) => w.id === parseInt(preselectedWorkoutId));
        if (found) {
          setSelectedIds(new Set(found.exercises.map((e) => e.exerciseId)));
        }
      }
    };
    loadAll().catch(() => setError("Failed to load data"));
  }, [preselectedWorkoutId]);

  const handleWorkoutChange = (wId: string) => {
    setWorkoutId(wId);
    if (!wId) return;
    const found = workouts.find((w) => w.id === parseInt(wId));
    if (found) {
      setSelectedIds(new Set(found.exercises.map((e) => e.exerciseId)));
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
    if (selectedIds.size === 0) {
      setError("Please select at least one exercise");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/patient/training/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          workoutId: workoutId ? parseInt(workoutId) : undefined,
          muscleGroupId: muscleGroupId ? parseInt(muscleGroupId) : undefined,
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
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="muscleGroup">Muscle Group</Label>
        <select
          id="muscleGroup"
          value={muscleGroupId}
          onChange={(e) => setMuscleGroupId(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">-- Select muscle group --</option>
          {muscleGroups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="workout">Workout Template (optional)</Label>
        <select
          id="workout"
          value={workoutId}
          onChange={(e) => handleWorkoutChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">-- No template --</option>
          {workouts.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Exercises *</Label>
        {exercises.length === 0 ? (
          <div className="border rounded-md p-4 text-sm text-muted-foreground">
            No exercises yet.{" "}
            <a
              href="/patient/training/exercises/create"
              className="underline hover:text-foreground"
            >
              Create exercises first
            </a>
          </div>
        ) : (
          <div className="border rounded-md divide-y max-h-64 overflow-y-auto">
            {exercises.map((ex) => (
              <label
                key={ex.id}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(ex.id)}
                  onChange={() => toggleExercise(ex.id)}
                  className="w-4 h-4"
                />
                <span className="flex-1 text-sm">{ex.name}</span>
                {ex.muscleGroupName && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {ex.muscleGroupName}
                  </span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional session notes"
          rows={2}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Start Session"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function NewSessionPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="New Training Session">
        <LogoutButton />
      </PageHeader>

      <main className="container mx-auto px-4 py-8 max-w-[700px]">
        <div className="mb-6">
          <a
            href="/patient/training/sessions"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Sessions
          </a>
        </div>

        <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
          <NewSessionForm />
        </Suspense>
      </main>
    </div>
  );
}

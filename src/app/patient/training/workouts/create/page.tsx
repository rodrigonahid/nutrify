"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface Exercise {
  id: number;
  name: string;
  muscleGroupName: string | null;
}

export default function CreateWorkoutPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Inline create exercise state
  const [showCreate, setShowCreate] = useState(false);
  const [newExName, setNewExName] = useState("");
  const [creatingEx, setCreatingEx] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadExercises = () =>
    fetch("/api/patient/training/exercises")
      .then((r) => r.json())
      .then((d) => setExercises(d.exercises));

  useEffect(() => {
    loadExercises().catch(() => setError("Failed to load exercises"));
  }, []);

  const handleCreateExercise = async () => {
    if (!newExName.trim()) return;
    setCreatingEx(true);
    setCreateError(null);

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
    if (selectedIds.size === 0) {
      setError("Please select at least one exercise");
      return;
    }
    setLoading(true);
    setError(null);

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
    <div className="min-h-screen bg-background">
      <PageHeader title="New Workout">
        <LogoutButton />
      </PageHeader>

      <main className="container mx-auto px-4 py-8 max-w-[700px]">
        <div className="mb-6">
          <a
            href="/patient/training/workouts"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Workouts
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="name">Workout Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Push Day A"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Exercises *</Label>
              <button
                type="button"
                onClick={() => { setShowCreate((v) => !v); setCreateError(null); }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCreate ? (
                  <><X className="w-3 h-3" /> Cancel</>
                ) : (
                  <><Plus className="w-3 h-3" /> New exercise</>
                )}
              </button>
            </div>

            {showCreate && (
              <div className="border rounded-md p-3 bg-muted/20 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Create new exercise
                </p>
                {createError && (
                  <p className="text-red-500 text-xs">{createError}</p>
                )}
                <div className="flex gap-2">
                  <Input
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateExercise(); } }}
                    placeholder="Exercise name"
                    className="text-sm flex-1"
                  />
                </div>
                <Button type="button" size="sm" onClick={handleCreateExercise} disabled={creatingEx}>
                  {creatingEx ? "Creating..." : "Create & add"}
                </Button>
              </div>
            )}

            {exercises.length === 0 && !showCreate ? (
              <div className="border rounded-md p-4 text-sm text-muted-foreground">
                No exercises yet. Click <strong>New exercise</strong> above to create one.
              </div>
            ) : exercises.length > 0 ? (
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
            ) : null}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Workout"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

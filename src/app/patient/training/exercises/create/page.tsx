"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MuscleGroup {
  id: number;
  name: string;
}

export default function CreateExercisePage() {
  const router = useRouter();
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [muscleGroupId, setMuscleGroupId] = useState<string>("");

  useEffect(() => {
    fetch("/api/patient/training/muscle-groups")
      .then((r) => r.json())
      .then((d) => setMuscleGroups(d.muscleGroups))
      .catch(() => setError("Failed to load muscle groups"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/patient/training/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
          muscleGroupId: muscleGroupId ? parseInt(muscleGroupId) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create exercise");
      }

      router.push("/patient/training/exercises");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create exercise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="New Exercise">
        <LogoutButton />
      </PageHeader>

      <main className="container mx-auto px-4 py-8 max-w-[600px]">
        <div className="mb-6">
          <a
            href="/patient/training/exercises"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Exercises
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Exercise Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Bench Press"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description or notes"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Exercise"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

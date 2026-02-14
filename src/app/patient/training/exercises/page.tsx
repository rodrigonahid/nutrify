"use client";

import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/logout-button";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Exercise {
  id: number;
  name: string;
  description: string | null;
  muscleGroupId: number | null;
  muscleGroupName: string | null;
  createdAt: string;
}

interface MuscleGroup {
  id: number;
  name: string;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [exercisesRes, groupsRes] = await Promise.all([
          fetch("/api/patient/training/exercises"),
          fetch("/api/patient/training/muscle-groups"),
        ]);

        if (!exercisesRes.ok || !groupsRes.ok) {
          throw new Error("Failed to load data");
        }

        const [exercisesData, groupsData] = await Promise.all([
          exercisesRes.json(),
          groupsRes.json(),
        ]);

        setExercises(exercisesData.exercises);
        setMuscleGroups(groupsData.muscleGroups);
      } catch {
        setError("Failed to load exercises");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filtered =
    selectedGroup === "all"
      ? exercises
      : exercises.filter(
          (e) => e.muscleGroupName === selectedGroup
        );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Exercise Library">
          <LogoutButton />
        </PageHeader>
        <main className="container mx-auto px-4 py-8 max-w-[1200px]">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Exercise Library">
        <div className="flex items-center gap-4">
          <a href="/patient/training/exercises/create">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New Exercise
            </Button>
          </a>
          <LogoutButton />
        </div>
      </PageHeader>

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <div className="mb-4">
          <a href="/patient/training" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Training
          </a>
        </div>

        {error && (
          <p className="text-red-500 mb-4">{error}</p>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGroup("all")}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              selectedGroup === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-primary"
            }`}
          >
            All
          </button>
          {muscleGroups.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGroup(g.name)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                selectedGroup === g.name
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No exercises found.</p>
            <a href="/patient/training/exercises/create">
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                Create your first exercise
              </Button>
            </a>
          </div>
        ) : (
          <div className="border rounded-lg divide-y">
            {filtered.map((exercise) => (
              <a
                key={exercise.id}
                href={`/patient/training/exercises/${exercise.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <span className="font-medium">{exercise.name}</span>
                  {exercise.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                      {exercise.description}
                    </p>
                  )}
                </div>
                {exercise.muscleGroupName && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded ml-4 whitespace-nowrap">
                    {exercise.muscleGroupName}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

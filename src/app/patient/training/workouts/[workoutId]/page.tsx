"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface WorkoutExercise {
  id: number;
  orderIndex: number;
  exerciseId: number;
  exerciseName: string;
  exerciseDescription: string | null;
  muscleGroupName: string | null;
}

interface Workout {
  id: number;
  name: string;
  description: string | null;
  assignedByProfessionalId: number | null;
  createdAt: string;
}

export default function WorkoutDetailPage() {
  const params = useParams();
  const workoutId = params.workoutId as string;
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/patient/training/workouts/${workoutId}`)
      .then((r) => r.json())
      .then((d) => {
        setWorkout(d.workout);
        setExercises(d.exercises);
      })
      .catch(() => setError("Failed to load workout"))
      .finally(() => setLoading(false));
  }, [workoutId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Workout">
          <LogoutButton />
        </PageHeader>
        <main className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Workout">
          <LogoutButton />
        </PageHeader>
        <main className="container mx-auto px-4 py-8">
          <p className="text-red-500">{error || "Workout not found"}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={workout.name}>
        <LogoutButton />
      </PageHeader>

      <main className="container mx-auto px-4 py-8 max-w-[900px]">
        <div className="mb-6">
          <a
            href="/patient/training/workouts"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Workouts
          </a>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{workout.name}</h1>
            {workout.assignedByProfessionalId && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1 inline-block">
                Assigned by professional
              </span>
            )}
            {workout.description && (
              <p className="mt-2 text-muted-foreground">{workout.description}</p>
            )}
          </div>
          <a href={`/patient/training/sessions/new?workoutId=${workout.id}`}>
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Start Session
            </Button>
          </a>
        </div>

        <h2 className="text-lg font-semibold mb-3">Exercises</h2>

        {exercises.length === 0 ? (
          <p className="text-muted-foreground">No exercises in this workout.</p>
        ) : (
          <div className="border rounded-lg divide-y">
            {exercises.map((ex, idx) => (
              <div key={ex.id} className="flex items-center gap-4 px-4 py-3">
                <span className="text-muted-foreground text-sm w-6">{idx + 1}</span>
                <div className="flex-1">
                  <a
                    href={`/patient/training/exercises/${ex.exerciseId}`}
                    className="font-medium hover:underline"
                  >
                    {ex.exerciseName}
                  </a>
                  {ex.exerciseDescription && (
                    <p className="text-sm text-muted-foreground">{ex.exerciseDescription}</p>
                  )}
                </div>
                {ex.muscleGroupName && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {ex.muscleGroupName}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

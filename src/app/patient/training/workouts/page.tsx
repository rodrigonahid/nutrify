"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Workout {
  id: number;
  name: string;
  description: string | null;
  assignedByProfessionalId: number | null;
  exerciseCount: number;
  createdAt: string;
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/patient/training/workouts")
      .then((r) => r.json())
      .then((d) => setWorkouts(d.workouts))
      .catch(() => setError("Failed to load workouts"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Workouts">
          <LogoutButton />
        </PageHeader>
        <main className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Workouts">
        <div className="flex items-center gap-4">
          <a href="/patient/training/workouts/create">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New Workout
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

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {workouts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No workouts yet.</p>
            <a href="/patient/training/workouts/create">
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                Create your first workout
              </Button>
            </a>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workouts.map((workout) => (
              <a
                key={workout.id}
                href={`/patient/training/workouts/${workout.id}`}
                className="p-4 border rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{workout.name}</h3>
                  {workout.assignedByProfessionalId && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-2 whitespace-nowrap">
                      Assigned
                    </span>
                  )}
                </div>
                {workout.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {workout.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {workout.exerciseCount} exercise{workout.exerciseCount !== 1 ? "s" : ""}
                </p>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

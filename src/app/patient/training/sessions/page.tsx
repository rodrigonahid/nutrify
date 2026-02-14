"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Session {
  id: number;
  date: string;
  notes: string | null;
  muscleGroupName: string | null;
  exerciseCount: number;
  createdAt: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/patient/training/sessions")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions))
      .catch(() => setError("Failed to load sessions"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Training Sessions">
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
      <PageHeader title="Training Sessions">
        <div className="flex items-center gap-4">
          <a href="/patient/training/sessions/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New Session
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

        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No training sessions yet.</p>
            <a href="/patient/training/sessions/new">
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                Log your first session
              </Button>
            </a>
          </div>
        ) : (
          <div className="border rounded-lg divide-y">
            {sessions.map((session) => (
              <a
                key={session.id}
                href={`/patient/training/sessions/${session.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <span className="font-medium">{session.date}</span>
                  {session.muscleGroupName && (
                    <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {session.muscleGroupName}
                    </span>
                  )}
                  {session.notes && (
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                      {session.notes}
                    </p>
                  )}
                </div>
                <span className="text-sm text-muted-foreground ml-4">
                  {session.exerciseCount} exercise{session.exerciseCount !== 1 ? "s" : ""}
                </span>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

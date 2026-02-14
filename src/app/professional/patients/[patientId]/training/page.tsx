"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { LogoutButton } from "@/components/logout-button";

interface Session {
  id: number;
  date: string;
  muscleGroupName: string | null;
  exerciseCount: number;
  notes: string | null;
}

export default function PatientTrainingPage() {
  const params = useParams();
  const patientId = params.patientId as string;
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/professional/patients/${patientId}/training/sessions`)
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions))
      .catch(() => setError("Failed to load sessions"))
      .finally(() => setLoading(false));
  }, [patientId]);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Patient Training">
        <LogoutButton />
      </PageHeader>

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <div className="mb-4">
          <a
            href={`/professional/patients/${patientId}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Patient
          </a>
        </div>

        <h1 className="text-2xl font-bold mb-6">Training Sessions</h1>

        {loading && <p className="text-muted-foreground">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && sessions.length === 0 && (
          <p className="text-muted-foreground">No training sessions recorded yet.</p>
        )}

        {sessions.length > 0 && (
          <div className="border rounded-lg divide-y">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between px-4 py-3"
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
                <span className="text-sm text-muted-foreground">
                  {session.exerciseCount} exercise{session.exerciseCount !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

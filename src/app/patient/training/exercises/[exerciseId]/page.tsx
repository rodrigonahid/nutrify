"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, TrendingUp, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface Exercise {
  id: number;
  name: string;
  description: string | null;
  muscleGroupName: string | null;
}

interface PR {
  id: number;
  weightKg: string;
  reps: number | null;
  date: string;
  notes: string | null;
}

interface SetEntry {
  sessionId: number;
  date: string;
  setId: number;
  setNumber: number;
  weightKg: string | null;
  reps: number | null;
  notes: string | null;
}

interface SessionGroup {
  date: string;
  sessionId: number;
  sets: SetEntry[];
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDelta(current: PR, previous: PR | undefined) {
  if (!previous) return null;
  const diff = parseFloat(current.weightKg) - parseFloat(previous.weightKg);
  return diff;
}

export default function ExerciseDetailPage() {
  const params = useParams();
  const exerciseId = params.exerciseId as string;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [prs, setPrs] = useState<PR[]>([]);
  const [history, setHistory] = useState<SetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PR form state
  const [showPrForm, setShowPrForm] = useState(false);
  const [prWeight, setPrWeight] = useState("");
  const [prReps, setPrReps] = useState("");
  const [prDate, setPrDate] = useState(new Date().toISOString().split("T")[0]);
  const [prNotes, setPrNotes] = useState("");
  const [submittingPr, setSubmittingPr] = useState(false);
  const [prError, setPrError] = useState<string | null>(null);

  // History accordion
  const [showHistory, setShowHistory] = useState(false);

  const loadData = useCallback(async () => {
    const [exerciseRes, prsRes] = await Promise.all([
      fetch(`/api/patient/training/exercises/${exerciseId}`),
      fetch(`/api/patient/training/exercises/${exerciseId}/prs`),
    ]);
    if (!exerciseRes.ok) throw new Error("Failed to load exercise");
    const [exerciseData, prsData] = await Promise.all([
      exerciseRes.json(),
      prsRes.json(),
    ]);
    setExercise(exerciseData.exercise);
    setHistory(exerciseData.history ?? []);
    setPrs(prsData.prs ?? []);
  }, [exerciseId]);

  useEffect(() => {
    loadData()
      .catch(() => setError("Failed to load exercise"))
      .finally(() => setLoading(false));
  }, [loadData]);

  const handleAddPr = async () => {
    if (!prWeight) { setPrError("Weight is required"); return; }
    setSubmittingPr(true);
    setPrError(null);
    try {
      const res = await fetch(`/api/patient/training/exercises/${exerciseId}/prs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weightKg: parseFloat(prWeight),
          reps: prReps ? parseInt(prReps) : undefined,
          date: prDate,
          notes: prNotes || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save PR");
      }
      await loadData();
      setPrWeight("");
      setPrReps("");
      setPrNotes("");
      setPrDate(new Date().toISOString().split("T")[0]);
      setShowPrForm(false);
    } catch (err) {
      setPrError(err instanceof Error ? err.message : "Failed to save PR");
    } finally {
      setSubmittingPr(false);
    }
  };

  const handleDeletePr = async (prId: number) => {
    try {
      await fetch(`/api/patient/training/exercises/${exerciseId}/prs/${prId}`, {
        method: "DELETE",
      });
      await loadData();
    } catch {
      setError("Failed to delete PR");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Exercise"><LogoutButton /></PageHeader>
        <main className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  if (error && !exercise) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Exercise"><LogoutButton /></PageHeader>
        <main className="container mx-auto px-4 py-8">
          <p className="text-red-500">{error}</p>
        </main>
      </div>
    );
  }

  // Group session history
  const sessionMap = new Map<string, SessionGroup>();
  for (const entry of history) {
    const key = `${entry.date}-${entry.sessionId}`;
    if (!sessionMap.has(key)) {
      sessionMap.set(key, { date: entry.date, sessionId: entry.sessionId, sets: [] });
    }
    sessionMap.get(key)!.sets.push(entry);
  }
  const sessions = Array.from(sessionMap.values()).reverse();

  const bestPr = prs?.length > 0
    ? prs.reduce((best, pr) =>
        parseFloat(pr.weightKg) > parseFloat(best.weightKg) ? pr : best
      )
    : null;

  const sortedPrs = [...prs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={exercise!.name}>
        <LogoutButton />
      </PageHeader>

      <main className="container mx-auto px-4 py-8 max-w-[680px]">
        <div className="mb-6">
          <a href="/patient/training/exercises" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Exercise Library
          </a>
        </div>

        {/* Exercise header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{exercise!.name}</h1>
          {exercise!.muscleGroupName && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded mt-1 inline-block">
              {exercise!.muscleGroupName}
            </span>
          )}
          {exercise!.description && (
            <p className="mt-2 text-sm text-muted-foreground">{exercise!.description}</p>
          )}
        </div>

        {/* PR Hero Card */}
        <div className="relative rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-background p-6 mb-3 overflow-hidden">
          <div className="absolute top-4 right-4 opacity-10">
            <Trophy className="w-24 h-24" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Personal Record
              </span>
            </div>
            {bestPr ? (
              <>
                <div className="flex items-end gap-3 mb-1">
                  <span className="text-5xl font-black tracking-tight">
                    {parseFloat(bestPr.weightKg) % 1 === 0
                      ? parseInt(bestPr.weightKg)
                      : parseFloat(bestPr.weightKg)}
                  </span>
                  <span className="text-2xl font-semibold text-muted-foreground mb-1">kg</span>
                  {bestPr.reps && (
                    <span className="text-lg text-muted-foreground mb-1">× {bestPr.reps} reps</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{formatDate(bestPr.date)}</p>
                {prs.length > 1 && (() => {
                  const prev = [...prs]
                    .sort((a, b) => parseFloat(b.weightKg) - parseFloat(a.weightKg))[1];
                  const gain = parseFloat(bestPr.weightKg) - parseFloat(prev.weightKg);
                  return gain > 0 ? (
                    <div className="flex items-center gap-1 mt-3">
                      <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">
                        +{gain % 1 === 0 ? gain : gain.toFixed(1)} kg from previous best
                      </span>
                    </div>
                  ) : null;
                })()}
              </>
            ) : (
              <p className="text-muted-foreground text-sm">No PR logged yet. Be the first!</p>
            )}
          </div>
        </div>

        {/* Log PR button / form */}
        {!showPrForm ? (
          <button
            onClick={() => setShowPrForm(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 py-3 text-sm font-medium text-primary hover:border-primary hover:bg-primary/5 transition-all mb-8"
          >
            <Plus className="w-4 h-4" />
            Log new PR
          </button>
        ) : (
          <div className="rounded-xl border bg-muted/20 p-4 mb-8 space-y-3">
            <p className="text-sm font-semibold">Log new PR</p>
            {prError && <p className="text-red-500 text-xs">{prError}</p>}

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Weight (kg) *</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={prWeight}
                  onChange={(e) => setPrWeight(e.target.value)}
                  min="0"
                  step="0.5"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Reps</label>
                <Input
                  type="number"
                  placeholder="—"
                  value={prReps}
                  onChange={(e) => setPrReps(e.target.value)}
                  min="1"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                <Input
                  type="date"
                  value={prDate}
                  onChange={(e) => setPrDate(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
              <Input
                type="text"
                placeholder="e.g. paused reps, belt used..."
                value={prNotes}
                onChange={(e) => setPrNotes(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddPr} disabled={submittingPr}>
                {submittingPr ? "Saving..." : "Save PR"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setShowPrForm(false); setPrError(null); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* PR Timeline */}
        {sortedPrs.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              PR History
            </h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-1">
                {sortedPrs.map((pr) => {
                  const chronIdx = prs.findIndex((p) => p.id === pr.id);
                  const prevChron = chronIdx > 0 ? prs[chronIdx - 1] : undefined;
                  const delta = getDelta(pr, prevChron);
                  const isAllTimeBest = pr.id === bestPr?.id;

                  return (
                    <div key={pr.id} className="relative flex gap-4 pl-10 pb-4 group">
                      {/* Dot */}
                      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-background transition-colors ${isAllTimeBest ? "border-yellow-400" : "border-border group-hover:border-primary"}`}>
                        {isAllTimeBest
                          ? <Trophy className="w-3 h-3 text-yellow-500" />
                          : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors" />
                        }
                      </div>

                      {/* Content */}
                      <div className="flex-1 rounded-xl border bg-card p-3 hover:border-primary/30 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-bold">
                                {parseFloat(pr.weightKg) % 1 === 0
                                  ? parseInt(pr.weightKg)
                                  : parseFloat(pr.weightKg)}
                                <span className="text-sm font-normal text-muted-foreground ml-1">kg</span>
                              </span>
                              {pr.reps && (
                                <span className="text-sm text-muted-foreground">× {pr.reps} reps</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(pr.date)}</p>
                            {pr.notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">{pr.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {delta !== null && delta > 0 && (
                              <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                +{delta % 1 === 0 ? delta : delta.toFixed(1)}
                              </span>
                            )}
                            <button
                              onClick={() => handleDeletePr(pr.id)}
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Session History accordion */}
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="w-full flex items-center justify-between py-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors border-t"
        >
          <span>Session History</span>
          {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showHistory && (
          <div className="mt-4">
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sets logged yet.</p>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={`${session.date}-${session.sessionId}`} className="border rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-muted/30 flex items-center justify-between">
                      <a
                        href={`/patient/training/sessions/${session.sessionId}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {formatDate(session.date)}
                      </a>
                      <span className="text-xs text-muted-foreground">{session.sets.length} sets</span>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Set</th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">kg</th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Reps</th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {session.sets.map((set) => (
                          <tr key={set.setId} className="border-b last:border-0">
                            <td className="px-4 py-2 text-muted-foreground">{set.setNumber}</td>
                            <td className="px-4 py-2 font-medium">{set.weightKg ?? "—"}</td>
                            <td className="px-4 py-2">{set.reps ?? "—"}</td>
                            <td className="px-4 py-2 text-muted-foreground text-xs">{set.notes ?? ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

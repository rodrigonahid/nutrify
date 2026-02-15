"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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

function fmtWeight(w: string) {
  const n = parseFloat(w);
  return n % 1 === 0 ? String(parseInt(w)) : String(n);
}

const inputCls = "h-9 px-3 bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-[8px] text-[13px] text-[#111827] placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] focus:outline-none focus:bg-white focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.16)] transition-all duration-150";

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] p-6 mb-3 animate-pulse">
      <div className="h-3 w-24 bg-[#F3F4F6] rounded mb-4" />
      <div className="h-12 w-32 bg-[#F3F4F6] rounded mb-2" />
      <div className="h-3 w-20 bg-[#F3F4F6] rounded" />
    </div>
  );
}

export default function ExerciseDetailPage() {
  const params = useParams();
  const exerciseId = params.exerciseId as string;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [prs, setPrs] = useState<PR[]>([]);
  const [history, setHistory] = useState<SetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // PR form state
  const [showPrForm, setShowPrForm] = useState(false);
  const [prWeight, setPrWeight] = useState("");
  const [prReps, setPrReps] = useState("");
  const [prDate, setPrDate] = useState(new Date().toISOString().split("T")[0]);
  const [prNotes, setPrNotes] = useState("");
  const [submittingPr, setSubmittingPr] = useState(false);
  const [prError, setPrError] = useState("");

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
    setPrError("");
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
      setPrWeight(""); setPrReps(""); setPrNotes("");
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
      await fetch(`/api/patient/training/exercises/${exerciseId}/prs/${prId}`, { method: "DELETE" });
      await loadData();
    } catch {
      setError("Failed to delete PR");
    }
  };

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

  const bestPr = prs.length > 0
    ? prs.reduce((best, pr) => parseFloat(pr.weightKg) > parseFloat(best.weightKg) ? pr : best)
    : null;

  const sortedPrs = [...prs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-4 md:p-8 max-w-[680px]">
      <Link
        href="/patient/training/exercises"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Back to Exercise Library
      </Link>

      {/* Exercise header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-0.5">
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight">
            {loading ? (
              <span className="inline-block w-40 h-6 bg-[#F3F4F6] rounded animate-pulse" />
            ) : (
              exercise?.name ?? "Exercise"
            )}
          </h1>
          {!loading && exercise?.muscleGroupName && (
            <span className="text-[11px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2.5 py-0.5 rounded-full">
              {exercise.muscleGroupName}
            </span>
          )}
        </div>
        {!loading && exercise?.description && (
          <p className="text-sm font-medium text-[#6B7280] mt-1">{exercise.description}</p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {/* PR Hero Card */}
      {loading ? <SkeletonCard /> : (
        <div className="relative rounded-2xl border border-[#E5E7EB] bg-white p-6 mb-3 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="absolute top-4 right-4 opacity-[0.06]">
            <Trophy size={80} className="text-[#2E8B5A]" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={14} className="text-[#F59E0B]" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
                Personal Record
              </span>
            </div>
            {bestPr ? (
              <>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-[48px] font-black tracking-tight text-[#111827] leading-none">
                    {fmtWeight(bestPr.weightKg)}
                  </span>
                  <span className="text-[20px] font-semibold text-[#9CA3AF] mb-1">kg</span>
                  {bestPr.reps && (
                    <span className="text-[16px] text-[#6B7280] mb-1">× {bestPr.reps} reps</span>
                  )}
                </div>
                <p className="text-[13px] font-medium text-[#9CA3AF]">{formatDate(bestPr.date)}</p>
                {prs.length > 1 && (() => {
                  const prev = [...prs].sort((a, b) => parseFloat(b.weightKg) - parseFloat(a.weightKg))[1];
                  const gain = parseFloat(bestPr.weightKg) - parseFloat(prev.weightKg);
                  return gain > 0 ? (
                    <div className="flex items-center gap-1 mt-3">
                      <TrendingUp size={13} className="text-[#2E8B5A]" />
                      <span className="text-[12px] text-[#2E8B5A] font-semibold">
                        +{gain % 1 === 0 ? gain : gain.toFixed(1)} kg from previous best
                      </span>
                    </div>
                  ) : null;
                })()}
              </>
            ) : (
              <p className="text-[14px] font-medium text-[#9CA3AF]">No PR logged yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Log PR button / form */}
      {!loading && (!showPrForm ? (
        <button
          onClick={() => setShowPrForm(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#D1D5DB] py-3 text-[13px] font-semibold text-[#6B7280] hover:border-[#2E8B5A] hover:text-[#2E8B5A] hover:bg-[rgba(46,139,90,0.04)] transition-all duration-150 mb-8"
        >
          <Plus size={14} />
          Log new PR
        </button>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 mb-8 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="text-[13px] font-semibold text-[#111827]">Log new PR</p>
          {prError && <p className="text-[12px] font-semibold text-[#DC2626]">{prError}</p>}

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1 block">Weight (kg) *</label>
              <input type="number" placeholder="0" value={prWeight} onChange={(e) => setPrWeight(e.target.value)} min="0" step="0.5" className={inputCls + " w-full"} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1 block">Reps</label>
              <input type="number" placeholder="—" value={prReps} onChange={(e) => setPrReps(e.target.value)} min="1" className={inputCls + " w-full"} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1 block">Date</label>
              <input type="date" value={prDate} onChange={(e) => setPrDate(e.target.value)} className={inputCls + " w-full"} />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1 block">Notes</label>
            <input type="text" placeholder="e.g. paused reps, belt used…" value={prNotes} onChange={(e) => setPrNotes(e.target.value)} className={inputCls + " w-full"} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddPr}
              disabled={submittingPr}
              className="inline-flex items-center justify-center h-9 px-4 text-[13px] font-semibold text-white bg-[#2E8B5A] rounded-[8px] hover:bg-[#277A4F] disabled:opacity-60 transition-colors"
            >
              {submittingPr ? "Saving…" : "Save PR"}
            </button>
            <button
              onClick={() => { setShowPrForm(false); setPrError(""); }}
              className="inline-flex items-center justify-center h-9 px-4 text-[13px] font-semibold text-[#374151] bg-white border border-[#E5E7EB] rounded-[8px] hover:bg-[#F9FAFB] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ))}

      {/* PR Timeline */}
      {!loading && sortedPrs.length > 0 && (
        <div className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-4">
            PR History
          </p>
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-[#E5E7EB]" />
            <div className="space-y-1">
              {sortedPrs.map((pr) => {
                const chronIdx = prs.findIndex((p) => p.id === pr.id);
                const prevChron = chronIdx > 0 ? prs[chronIdx - 1] : undefined;
                const delta = prevChron ? parseFloat(pr.weightKg) - parseFloat(prevChron.weightKg) : null;
                const isAllTimeBest = pr.id === bestPr?.id;

                return (
                  <div key={pr.id} className="relative flex gap-4 pl-10 pb-4 group">
                    {/* Dot */}
                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white transition-colors ${isAllTimeBest ? "border-[#F59E0B]" : "border-[#E5E7EB] group-hover:border-[#2E8B5A]"}`}>
                      {isAllTimeBest
                        ? <Trophy size={11} className="text-[#F59E0B]" />
                        : <div className="w-1.5 h-1.5 rounded-full bg-[#D1D5DB] group-hover:bg-[#2E8B5A] transition-colors" />
                      }
                    </div>
                    {/* Card */}
                    <div className="flex-1 bg-white border border-[#E5E7EB] rounded-xl p-3 hover:border-[#D1D5DB] transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-[18px] font-bold text-[#111827]">
                              {fmtWeight(pr.weightKg)}
                              <span className="text-[13px] font-normal text-[#9CA3AF] ml-1">kg</span>
                            </span>
                            {pr.reps && (
                              <span className="text-[13px] text-[#6B7280]">× {pr.reps} reps</span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#9CA3AF] mt-0.5">{formatDate(pr.date)}</p>
                          {pr.notes && (
                            <p className="text-[11px] text-[#9CA3AF] mt-1 italic">{pr.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {delta !== null && delta > 0 && (
                            <span className="text-[11px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] px-1.5 py-0.5 rounded">
                              +{delta % 1 === 0 ? delta : delta.toFixed(1)}
                            </span>
                          )}
                          <button
                            onClick={() => handleDeletePr(pr.id)}
                            className="opacity-0 group-hover:opacity-100 text-[#D1D5DB] hover:text-[#DC2626] transition-all"
                          >
                            <Trash2 size={13} />
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
      {!loading && (
        <>
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="w-full flex items-center justify-between py-3 text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] hover:text-[#374151] transition-colors border-t border-[#F3F4F6]"
          >
            <span>Session History</span>
            {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showHistory && (
            <div className="mt-4">
              {sessions.length === 0 ? (
                <p className="text-[13px] text-[#9CA3AF]">No sets logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={`${session.date}-${session.sessionId}`}
                      className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden"
                    >
                      <div className="px-4 py-2.5 border-b border-[#F3F4F6] flex items-center justify-between">
                        <Link
                          href={`/patient/training/sessions/${session.sessionId}`}
                          className="text-[13px] font-semibold text-[#111827] hover:text-[#2E8B5A] transition-colors"
                        >
                          {formatDate(session.date)}
                        </Link>
                        <span className="text-[11px] text-[#9CA3AF]">{session.sets.length} sets</span>
                      </div>
                      <table className="w-full text-[13px]">
                        <thead>
                          <tr className="border-b border-[#F3F4F6]">
                            <th className="text-left px-4 py-2 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Set</th>
                            <th className="text-left px-4 py-2 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">kg</th>
                            <th className="text-left px-4 py-2 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Reps</th>
                            <th className="text-left px-4 py-2 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {session.sets.map((set) => (
                            <tr key={set.setId} className="border-b border-[#F3F4F6] last:border-0">
                              <td className="px-4 py-2 text-[#9CA3AF]">{set.setNumber}</td>
                              <td className="px-4 py-2 font-medium text-[#111827]">{set.weightKg ?? "—"}</td>
                              <td className="px-4 py-2 text-[#374151]">{set.reps ?? "—"}</td>
                              <td className="px-4 py-2 text-[#9CA3AF] text-[12px]">{set.notes ?? ""}</td>
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
        </>
      )}
    </div>
  );
}

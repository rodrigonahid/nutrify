"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Trophy, TrendingUp, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

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

const inputCls =
  "h-10 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:bg-white focus:border-[#2E8B5A] focus:ring-2 focus:ring-[rgba(46,139,90,0.15)] transition-all duration-150";

interface ExerciseDetailModalProps {
  exerciseId: number;
  onClose: () => void;
}

export function ExerciseDetailModal({ exerciseId, onClose }: ExerciseDetailModalProps) {
  const queryClient = useQueryClient();
  const [visible, setVisible] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPrForm, setShowPrForm] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const prWeightRef = useRef<HTMLInputElement>(null);

  // PR form state
  const [prWeight, setPrWeight] = useState("");
  const [prReps, setPrReps] = useState("");
  const [prDate, setPrDate] = useState(new Date().toISOString().split("T")[0]);
  const [prNotes, setPrNotes] = useState("");
  const [submittingPr, setSubmittingPr] = useState(false);
  const [prError, setPrError] = useState("");

  const { data: exerciseData, isLoading: exerciseLoading } = useQuery({
    queryKey: ["exercise", exerciseId],
    queryFn: () =>
      fetch(`/api/patient/training/exercises/${exerciseId}`).then((r) => r.json()),
  });

  const { data: prsData, isLoading: prsLoading } = useQuery({
    queryKey: ["exercise-prs", exerciseId],
    queryFn: () =>
      fetch(`/api/patient/training/exercises/${exerciseId}/prs`).then((r) => r.json()),
  });

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) handleClose();
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openPrForm() {
    setPrWeight("");
    setPrReps("");
    setPrDate(new Date().toISOString().split("T")[0]);
    setPrNotes("");
    setPrError("");
    setShowPrForm(true);
    setTimeout(() => prWeightRef.current?.focus(), 50);
  }

  async function handleAddPr() {
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
      await queryClient.invalidateQueries({ queryKey: ["exercise-prs", exerciseId] });
      setShowPrForm(false);
    } catch (err) {
      setPrError(err instanceof Error ? err.message : "Failed to save PR");
    } finally {
      setSubmittingPr(false);
    }
  }

  async function handleDeletePr(prId: number) {
    try {
      await fetch(`/api/patient/training/exercises/${exerciseId}/prs/${prId}`, {
        method: "DELETE",
      });
      await queryClient.invalidateQueries({ queryKey: ["exercise-prs", exerciseId] });
    } catch {
      // silently fail
    }
  }

  const loading = exerciseLoading || prsLoading;
  const exercise = exerciseData?.exercise ?? null;
  const prs: PR[] = prsData?.prs ?? [];
  const history: SetEntry[] = exerciseData?.history ?? [];

  const bestPr = prs.length > 0
    ? prs.reduce((best, pr) => parseFloat(pr.weightKg) > parseFloat(best.weightKg) ? pr : best)
    : null;
  const sortedPrs = [...prs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center"
        style={{
          background: "rgba(0,0,0,0.4)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        {/* Panel */}
        <div
          ref={panelRef}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-white flex flex-col rounded-t-4xl md:w-125 md:mx-4 md:rounded-4xl"
          style={{
            maxHeight: "80vh",
            boxShadow: "0 -4px 32px rgba(0,0,0,0.14), 0 -1px 0 rgba(0,0,0,0.05)",
            transform: visible ? "translateY(0)" : "translateY(100%)",
            transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        >
          {/* Mobile: top border accent + drag handle */}
          <div
            className="shrink-0 pt-3 pb-2 flex flex-col items-center rounded-t-4xl md:hidden"
            style={{ borderTop: "3px solid #2E8B5A" }}
          >
            <div className="w-9 h-1 rounded-full bg-[#E5E7EB]" />
          </div>

          {/* Desktop: drag handle + close button */}
          <div className="hidden md:flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
            <div className="w-7" />
            <div className="w-9 h-1 rounded-full bg-[#E5E7EB]" />
            <button
              onClick={handleClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 pb-6 min-h-0">
            {/* Header row */}
            <div className="flex items-start justify-between mb-5 pt-1">
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="h-6 w-36 bg-[#F3F4F6] rounded animate-pulse mb-1.5" />
                ) : (
                  <h2 className="text-[18px] font-extrabold text-[#111827] tracking-tight leading-snug">
                    {exercise?.name ?? "Exercise"}
                  </h2>
                )}
                {!loading && exercise?.description && (
                  <p className="text-[12px] text-[#9CA3AF] mt-1">{exercise.description}</p>
                )}
              </div>
              {/* Mobile close */}
              <button
                onClick={handleClose}
                className="md:hidden ml-3 shrink-0 text-[13px] font-semibold text-[#9CA3AF] hover:text-[#374151] transition-colors"
              >
                Close
              </button>
            </div>

            {/* PR Hero Card */}
            {loading ? (
              <div className="rounded-2xl border border-[#E5E7EB] p-5 mb-3 animate-pulse">
                <div className="h-3 w-24 bg-[#F3F4F6] rounded mb-4" />
                <div className="h-10 w-28 bg-[#F3F4F6] rounded mb-2" />
                <div className="h-3 w-16 bg-[#F3F4F6] rounded" />
              </div>
            ) : (
              <div className="relative rounded-2xl border border-[#E5E7EB] bg-white p-5 mb-3 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="absolute top-3 right-3 opacity-[0.06]">
                  <Trophy size={60} className="text-[#2E8B5A]" />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy size={13} className="text-[#F59E0B]" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
                      Personal Record
                    </span>
                  </div>
                  {bestPr ? (
                    <>
                      <div className="flex items-end gap-1.5 mb-0.5">
                        <span className="text-[40px] font-black tracking-tight text-[#111827] leading-none">
                          {fmtWeight(bestPr.weightKg)}
                        </span>
                        <span className="text-[17px] font-semibold text-[#9CA3AF] mb-0.5">kg</span>
                        {bestPr.reps && (
                          <span className="text-[14px] text-[#6B7280] mb-0.5">× {bestPr.reps} reps</span>
                        )}
                      </div>
                      <p className="text-[12px] font-medium text-[#9CA3AF]">{formatDate(bestPr.date)}</p>
                      {prs.length > 1 && (() => {
                        const prev = [...prs].sort((a, b) => parseFloat(b.weightKg) - parseFloat(a.weightKg))[1];
                        const gain = parseFloat(bestPr.weightKg) - parseFloat(prev.weightKg);
                        return gain > 0 ? (
                          <div className="flex items-center gap-1 mt-2">
                            <TrendingUp size={12} className="text-[#2E8B5A]" />
                            <span className="text-[11px] text-[#2E8B5A] font-semibold">
                              +{gain % 1 === 0 ? gain : gain.toFixed(1)} kg from previous best
                            </span>
                          </div>
                        ) : null;
                      })()}
                    </>
                  ) : (
                    <p className="text-[13px] font-medium text-[#9CA3AF]">No PR logged yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* Log new PR */}
            {!loading && !showPrForm && (
              <button
                onClick={openPrForm}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#D1D5DB] py-3 text-[13px] font-semibold text-[#6B7280] hover:border-[#2E8B5A] hover:text-[#2E8B5A] hover:bg-[rgba(46,139,90,0.04)] transition-all duration-150 mb-5"
              >
                <Plus size={14} />
                Log new PR
              </button>
            )}

            {/* Inline PR form */}
            {showPrForm && (
              <div className="mb-5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] font-bold text-[#111827]">Log new PR</p>
                  <button
                    onClick={() => setShowPrForm(false)}
                    className="text-[12px] font-semibold text-[#9CA3AF] hover:text-[#374151] transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                {prError && (
                  <div className="mb-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-3 py-2 text-[12px] font-semibold text-[#DC2626]">
                    {prError}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 mb-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1.5">
                      Weight (kg) <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      ref={prWeightRef}
                      type="number"
                      placeholder="0"
                      value={prWeight}
                      onChange={(e) => setPrWeight(e.target.value)}
                      min="0"
                      step="0.5"
                      className={inputCls + " w-full"}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1.5">
                      Reps
                    </label>
                    <input
                      type="number"
                      placeholder="—"
                      value={prReps}
                      onChange={(e) => setPrReps(e.target.value)}
                      min="1"
                      className={inputCls + " w-full"}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={prDate}
                      onChange={(e) => setPrDate(e.target.value)}
                      className={inputCls + " w-full"}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1.5">
                    Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. paused reps, belt used…"
                    value={prNotes}
                    onChange={(e) => setPrNotes(e.target.value)}
                    className={inputCls + " w-full"}
                  />
                </div>

                <button
                  onClick={handleAddPr}
                  disabled={submittingPr || !prWeight}
                  className="w-full h-10 rounded-[10px] bg-[#2E8B5A] text-white text-[13px] font-bold hover:bg-[#267a50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)]"
                >
                  {submittingPr ? "Saving…" : "Save PR"}
                </button>
              </div>
            )}

            {/* PR Timeline */}
            {!loading && sortedPrs.length > 0 && (
              <div className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3">
                  PR History
                </p>
                <div className="relative">
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-[#E5E7EB]" />
                  <div className="space-y-1">
                    {sortedPrs.map((pr) => {
                      const chronIdx = prs.findIndex((p) => p.id === pr.id);
                      const prevChron = chronIdx > 0 ? prs[chronIdx - 1] : undefined;
                      const delta = prevChron
                        ? parseFloat(pr.weightKg) - parseFloat(prevChron.weightKg)
                        : null;
                      const isAllTimeBest = pr.id === bestPr?.id;

                      return (
                        <div key={pr.id} className="relative flex gap-3 pl-9 pb-3 group">
                          <div
                            className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white transition-colors ${
                              isAllTimeBest ? "border-[#F59E0B]" : "border-[#E5E7EB]"
                            }`}
                          >
                            {isAllTimeBest
                              ? <Trophy size={10} className="text-[#F59E0B]" />
                              : <div className="w-1.5 h-1.5 rounded-full bg-[#D1D5DB]" />
                            }
                          </div>
                          <div className="flex-1 bg-white border border-[#E5E7EB] rounded-xl p-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-[15px] font-bold text-[#111827]">
                                    {fmtWeight(pr.weightKg)}
                                    <span className="text-[12px] font-normal text-[#9CA3AF] ml-1">kg</span>
                                  </span>
                                  {pr.reps && (
                                    <span className="text-[12px] text-[#6B7280]">× {pr.reps} reps</span>
                                  )}
                                </div>
                                <p className="text-[10px] text-[#9CA3AF] mt-0.5">{formatDate(pr.date)}</p>
                                {pr.notes && (
                                  <p className="text-[10px] text-[#9CA3AF] mt-0.5 italic">{pr.notes}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {delta !== null && delta > 0 && (
                                  <span className="text-[10px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] px-1.5 py-0.5 rounded">
                                    +{delta % 1 === 0 ? delta : delta.toFixed(1)}
                                  </span>
                                )}
                                <button
                                  onClick={() => handleDeletePr(pr.id)}
                                  className="opacity-0 group-hover:opacity-100 text-[#D1D5DB] hover:text-[#DC2626] transition-all"
                                >
                                  <Trash2 size={12} />
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
                  className="w-full flex items-center justify-between py-3 text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF] hover:text-[#374151] transition-colors border-t border-[#F3F4F6]"
                >
                  <span>Session History</span>
                  {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                {showHistory && (
                  <div className="mt-2 mb-2">
                    {sessions.length === 0 ? (
                      <p className="text-[13px] text-[#9CA3AF]">No sets logged yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {sessions.map((session) => (
                          <div
                            key={`${session.date}-${session.sessionId}`}
                            className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden"
                          >
                            <div className="px-4 py-2 border-b border-[#F3F4F6] flex items-center justify-between">
                              <Link
                                href={`/patient/training/sessions/${session.sessionId}`}
                                onClick={handleClose}
                                className="text-[12px] font-semibold text-[#111827] hover:text-[#2E8B5A] transition-colors"
                              >
                                {formatDate(session.date)}
                              </Link>
                              <span className="text-[10px] text-[#9CA3AF]">{session.sets.length} sets</span>
                            </div>
                            <table className="w-full text-[12px]">
                              <thead>
                                <tr className="border-b border-[#F3F4F6]">
                                  <th className="text-left px-4 py-1.5 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Set</th>
                                  <th className="text-left px-4 py-1.5 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">kg</th>
                                  <th className="text-left px-4 py-1.5 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Reps</th>
                                  <th className="text-left px-4 py-1.5 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Notes</th>
                                </tr>
                              </thead>
                              <tbody>
                                {session.sets.map((set) => (
                                  <tr key={set.setId} className="border-b border-[#F3F4F6] last:border-0">
                                    <td className="px-4 py-1.5 text-[#9CA3AF]">{set.setNumber}</td>
                                    <td className="px-4 py-1.5 font-medium text-[#111827]">{set.weightKg ?? "—"}</td>
                                    <td className="px-4 py-1.5 text-[#374151]">{set.reps ?? "—"}</td>
                                    <td className="px-4 py-1.5 text-[#9CA3AF] text-[11px]">{set.notes ?? ""}</td>
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
        </div>
      </div>
    </>
  );
}

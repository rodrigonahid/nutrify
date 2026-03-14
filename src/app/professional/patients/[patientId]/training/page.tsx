"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Dumbbell, ClipboardList, Plus, X } from "lucide-react";

interface Session {
  id: number;
  date: string;
  exerciseCount: number;
  notes: string | null;
}

interface Workout {
  id: number;
  name: string;
  description: string | null;
  assignedByProfessionalId: number | null;
  exerciseCount: number;
  createdAt: string;
}

interface Exercise {
  id: number;
  name: string;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatSessionDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toLocaleDateString("pt-BR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-32 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-20 bg-[#F3F4F6] rounded" />
      </div>
      <div className="h-3 w-16 bg-[#F3F4F6] rounded" />
    </div>
  );
}

const inputCls = "w-full h-11 px-3.5 bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-[10px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] hover:bg-[#F3F4F6] focus:outline-none focus:bg-white focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.16)] transition-all duration-150";
const labelCls = "block text-[14px] font-semibold text-[#374151] mb-1.5";

export default function PatientTrainingPage() {
  const params = useParams();
  const patientId = params.patientId as string;

  const [tab, setTab] = useState<"sessions" | "workouts">("sessions");

  // Sessions
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState("");

  // Workouts
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(true);
  const [workoutsError, setWorkoutsError] = useState("");

  // Create workout modal
  const [modalOpen, setModalOpen] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    fetch(`/api/professional/patients/${patientId}/training/sessions`)
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []))
      .catch(() => setSessionsError("Falha ao carregar sessões"))
      .finally(() => setSessionsLoading(false));

    fetch(`/api/professional/patients/${patientId}/training/workouts`)
      .then((r) => r.json())
      .then((d) => setWorkouts(d.workouts ?? []))
      .catch(() => setWorkoutsError("Falha ao carregar treinos"))
      .finally(() => setWorkoutsLoading(false));
  }, [patientId]);

  function openModal() {
    setWorkoutName("");
    setWorkoutDescription("");
    setSelectedIds(new Set());
    setModalError("");
    setModalOpen(true);

    if (allExercises.length === 0) {
      setExercisesLoading(true);
      fetch("/api/patient/training/exercises")
        .then((r) => r.json())
        .then((d) => setAllExercises(d.exercises ?? []))
        .finally(() => setExercisesLoading(false));
    }
  }

  function closeModal() {
    setModalOpen(false);
  }

  function toggleExercise(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCreateWorkout() {
    if (!workoutName.trim()) { setModalError("Nome é obrigatório"); return; }
    if (selectedIds.size === 0) { setModalError("Selecione pelo menos um exercício"); return; }
    setCreating(true);
    setModalError("");
    try {
      const res = await fetch(`/api/professional/patients/${patientId}/training/workouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workoutName.trim(),
          description: workoutDescription.trim() || undefined,
          exerciseIds: Array.from(selectedIds),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao criar treino");
      setWorkouts((prev) => [...prev, { ...data.workout, exerciseCount: selectedIds.size }]);
      closeModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Falha ao criar treino");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-[900px]">
      <Link
        href={`/professional/patients/${patientId}`}
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Voltar ao paciente
      </Link>

      <div className="flex items-start justify-between mb-5">
        <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight">Treino</h1>
        {tab === "workouts" && (
          <button
            onClick={openModal}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] hover:bg-[#277A4F] hover:-translate-y-px transition-all duration-150"
          >
            <Plus size={14} />
            Novo treino
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F3F4F6] rounded-[12px] p-1 mb-5">
        {(["sessions", "workouts"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-2 h-9 rounded-[10px] text-[13px] font-semibold transition-all duration-150 ${
              tab === t
                ? "bg-white text-[#111827] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-[#6B7280] hover:text-[#374151]"
            }`}
          >
            {t === "sessions" ? (
              <><ClipboardList size={14} />Sessões</>
            ) : (
              <><Dumbbell size={14} />Treinos</>
            )}
          </button>
        ))}
      </div>

      {/* Sessions tab */}
      {tab === "sessions" && (
        <>
          {!sessionsLoading && (
            <p className="text-sm font-medium text-[#6B7280] mb-4">
              {sessions.length === 0
                ? "Nenhuma sessão ainda"
                : `${sessions.length} ${sessions.length !== 1 ? "sessões" : "sessão"}`}
            </p>
          )}
          {sessionsError && (
            <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
              {sessionsError}
            </div>
          )}
          {sessionsLoading ? (
            <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden divide-y divide-[#F3F4F6]">
              <SkeletonRow /><SkeletonRow /><SkeletonRow />
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center py-14 px-6 text-center">
              <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center mb-4">
                <ClipboardList size={22} className="text-[#9CA3AF]" />
              </div>
              <p className="text-[15px] font-semibold text-[#374151] mb-1">Nenhuma sessão ainda</p>
              <p className="text-[13px] text-[#9CA3AF]">
                As sessões aparecerão aqui quando o paciente começar a registrar treinos.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
              <div className="divide-y divide-[#F3F4F6]">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-start gap-3 px-4 py-3.5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#111827]">
                        {formatSessionDate(session.date)}
                      </p>
                      {session.notes && (
                        <p className="text-[12px] text-[#6B7280] line-clamp-1">{session.notes}</p>
                      )}
                    </div>
                    <p className="shrink-0 text-[13px] text-[#9CA3AF]">
                      {session.exerciseCount} exercício{session.exerciseCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Workouts tab */}
      {tab === "workouts" && (
        <>
          {!workoutsLoading && (
            <p className="text-sm font-medium text-[#6B7280] mb-4">
              {workouts.length === 0
                ? "Nenhum treino ainda"
                : `${workouts.length} treino${workouts.length !== 1 ? "s" : ""}`}
            </p>
          )}
          {workoutsError && (
            <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
              {workoutsError}
            </div>
          )}
          {workoutsLoading ? (
            <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden divide-y divide-[#F3F4F6]">
              <SkeletonRow /><SkeletonRow /><SkeletonRow />
            </div>
          ) : workouts.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center py-14 px-6 text-center">
              <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center mb-4">
                <Dumbbell size={22} className="text-[#9CA3AF]" />
              </div>
              <p className="text-[15px] font-semibold text-[#374151] mb-1">Nenhum treino ainda</p>
              <p className="text-[13px] text-[#9CA3AF] mb-4">
                Crie um treino para este paciente.
              </p>
              <button
                onClick={openModal}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] hover:bg-[#277A4F] transition-all duration-150"
              >
                <Plus size={14} />
                Criar primeiro treino
              </button>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
              <div className="divide-y divide-[#F3F4F6]">
                {workouts.map((workout) => (
                  <div key={workout.id} className="flex items-start gap-3 px-4 py-3.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[14px] font-semibold text-[#111827] truncate">{workout.name}</p>
                        {workout.assignedByProfessionalId && (
                          <span className="shrink-0 text-[11px] font-semibold text-[#2563EB] bg-[rgba(37,99,235,0.08)] px-2 py-0.5 rounded-full">
                            Atribuído
                          </span>
                        )}
                      </div>
                      {workout.description && (
                        <p className="text-[12px] text-[#9CA3AF] truncate">{workout.description}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[13px] text-[#9CA3AF]">
                        {workout.exerciseCount} exercício{workout.exerciseCount !== 1 ? "s" : ""}
                      </p>
                      <p className="text-[11px] text-[#D1D5DB]">{formatDate(workout.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Workout Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[85vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
              <h2 className="text-[16px] font-extrabold text-[#111827]">Novo treino para paciente</h2>
              <button
                onClick={closeModal}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors duration-100"
              >
                <X size={15} />
              </button>
            </div>

            {modalError && (
              <div className="mx-5 mb-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-3 py-2 text-[12.5px] font-semibold text-[#DC2626] shrink-0">
                {modalError}
              </div>
            )}

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-4 min-h-0">
              <div>
                <label className={labelCls}>Nome *</label>
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="ex.: Treino A — Peito e Tríceps"
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div>
                <label className={labelCls}>Descrição <span className="font-normal text-[#9CA3AF]">(opcional)</span></label>
                <input
                  type="text"
                  value={workoutDescription}
                  onChange={(e) => setWorkoutDescription(e.target.value)}
                  placeholder="Observações sobre o treino"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Exercícios *</label>
                {exercisesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-11 bg-[#F3F4F6] rounded-[10px] animate-pulse" />
                    ))}
                  </div>
                ) : allExercises.length === 0 ? (
                  <p className="text-[13px] text-[#9CA3AF] py-4">Nenhum exercício cadastrado ainda.</p>
                ) : (
                  <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden divide-y divide-[#F3F4F6] max-h-52 overflow-y-auto">
                    {allExercises.map((ex) => (
                      <label
                        key={ex.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F9FAFB] transition-colors duration-100"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(ex.id)}
                          onChange={() => toggleExercise(ex.id)}
                          className="w-4 h-4 accent-[#2E8B5A]"
                        />
                        <span className="flex-1 text-[13px] font-medium text-[#374151]">{ex.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pt-3 pb-5 border-t border-[#F3F4F6] shrink-0">
              <button
                onClick={handleCreateWorkout}
                disabled={creating}
                className="w-full h-10 rounded-[10px] bg-[#2E8B5A] text-white text-[13px] font-bold hover:bg-[#267a50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                {creating ? "Criando…" : "Criar treino"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

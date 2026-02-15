"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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

function SkeletonPanel() {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden animate-pulse">
      <div className="px-4 py-3 border-b border-[#F3F4F6]"><div className="h-4 w-32 bg-[#F3F4F6] rounded" /></div>
      <div className="p-4 space-y-2">
        {[1,2,3].map(i => <div key={i} className="h-3 bg-[#F3F4F6] rounded" />)}
      </div>
    </div>
  );
}

export default function WorkoutDetailPage() {
  const params = useParams();
  const workoutId = params.workoutId as string;
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/patient/training/workouts/${workoutId}`)
      .then((r) => r.json())
      .then((d) => { setWorkout(d.workout); setExercises(d.exercises ?? []); })
      .catch(() => setError("Failed to load workout"))
      .finally(() => setLoading(false));
  }, [workoutId]);

  return (
    <div className="p-4 md:p-8 max-w-[900px]">
      <Link
        href="/patient/training/workouts"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Back to Workouts
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight">
              {loading ? (
                <span className="inline-block w-40 h-6 bg-[#F3F4F6] rounded animate-pulse" />
              ) : (
                workout?.name ?? "Workout"
              )}
            </h1>
            {!loading && workout?.assignedByProfessionalId && (
              <span className="text-[11px] font-semibold text-[#2563EB] bg-[rgba(37,99,235,0.08)] px-2.5 py-0.5 rounded-full">
                Assigned
              </span>
            )}
          </div>
          {!loading && workout?.description && (
            <p className="text-sm font-medium text-[#6B7280]">{workout.description}</p>
          )}
        </div>
        {!loading && workout && (
          <Link
            href={`/patient/training/sessions/new?workoutId=${workout.id}`}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] hover:bg-[#277A4F] hover:-translate-y-px transition-all duration-150"
          >
            <Play size={13} />
            Start Session
          </Link>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonPanel />
      ) : exercises.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center">
          <p className="text-[14px] text-[#6B7280]">No exercises in this workout.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F3F4F6]">
            <p className="text-[14px] font-semibold text-[#111827]">
              {exercises.length} Exercise{exercises.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {[...exercises]
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((ex, idx) => (
                <div key={ex.id} className="flex items-center gap-4 px-4 py-3.5">
                  <span className="text-[12px] font-semibold text-[#9CA3AF] w-5 shrink-0">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/patient/training/exercises/${ex.exerciseId}`}
                      className="text-[14px] font-semibold text-[#111827] hover:text-[#2E8B5A] transition-colors"
                    >
                      {ex.exerciseName}
                    </Link>
                    {ex.exerciseDescription && (
                      <p className="text-[12px] text-[#9CA3AF] mt-0.5 truncate">{ex.exerciseDescription}</p>
                    )}
                  </div>
                  {ex.muscleGroupName && (
                    <span className="text-[11px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full shrink-0">
                      {ex.muscleGroupName}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

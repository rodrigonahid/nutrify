"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dumbbell, Plus } from "lucide-react";

interface Workout {
  id: number;
  name: string;
  description: string | null;
  assignedByProfessionalId: number | null;
  exerciseCount: number;
  createdAt: string;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-40 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-24 bg-[#F3F4F6] rounded" />
      </div>
      <div className="h-5 w-16 bg-[#F3F4F6] rounded-full" />
    </div>
  );
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/patient/training/workouts")
      .then((r) => r.json())
      .then((d) => setWorkouts(d.workouts ?? []))
      .catch(() => setError("Failed to load workouts"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-[900px]">
      <Link
        href="/patient/training"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Back to Training
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
            Workouts
          </h1>
          {!loading && (
            <p className="text-sm font-medium text-[#6B7280]">
              {workouts.length === 0
                ? "No workouts yet"
                : `${workouts.length} workout${workouts.length !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>
        <Link
          href="/patient/training/workouts/create"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] hover:bg-[#277A4F] hover:-translate-y-px transition-all duration-150"
        >
          <Plus size={14} />
          New Workout
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden divide-y divide-[#F3F4F6]">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : workouts.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center py-14 px-6 text-center">
          <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center mb-4">
            <Dumbbell size={22} className="text-[#9CA3AF]" />
          </div>
          <p className="text-[15px] font-semibold text-[#374151] mb-1">No workouts yet</p>
          <p className="text-[13px] text-[#9CA3AF] mb-4">Create templates to speed up session logging.</p>
          <Link
            href="/patient/training/workouts/create"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] hover:bg-[#277A4F] transition-all duration-150"
          >
            <Plus size={14} />
            Create your first workout
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="divide-y divide-[#F3F4F6]">
            {workouts.map((workout) => (
              <Link
                key={workout.id}
                href={`/patient/training/workouts/${workout.id}`}
                className="flex items-start gap-3 px-4 py-3.5 hover:bg-[#F9FAFB] transition-colors duration-100"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-semibold text-[#111827] truncate">{workout.name}</p>
                    {workout.assignedByProfessionalId && (
                      <span className="shrink-0 text-[11px] font-semibold text-[#2563EB] bg-[rgba(37,99,235,0.08)] px-2 py-0.5 rounded-full">
                        Assigned
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#9CA3AF]">
                    {workout.exerciseCount} exercise{workout.exerciseCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <span className="shrink-0 text-[12px] font-semibold text-[#2E8B5A] mt-0.5">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

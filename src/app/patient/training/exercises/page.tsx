"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";

interface Exercise {
  id: number;
  name: string;
  description: string | null;
  muscleGroupId: number | null;
  muscleGroupName: string | null;
  createdAt: string;
}

interface MuscleGroup {
  id: number;
  name: string;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-36 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-52 bg-[#F3F4F6] rounded" />
      </div>
      <div className="h-5 w-16 bg-[#F3F4F6] rounded-full" />
    </div>
  );
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const [exercisesRes, groupsRes] = await Promise.all([
        fetch("/api/patient/training/exercises"),
        fetch("/api/patient/training/muscle-groups"),
      ]);
      if (!exercisesRes.ok || !groupsRes.ok) throw new Error("Failed to load data");
      const [exercisesData, groupsData] = await Promise.all([
        exercisesRes.json(),
        groupsRes.json(),
      ]);
      setExercises(exercisesData.exercises ?? []);
      setMuscleGroups(groupsData.muscleGroups ?? []);
    };
    loadData()
      .catch(() => setError("Failed to load exercises"))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    selectedGroup === "all"
      ? exercises
      : exercises.filter((e) => e.muscleGroupName === selectedGroup);

  const pillCls = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors duration-100 ${
      active
        ? "bg-[#111827] text-white"
        : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#374151]"
    }`;

  return (
    <div className="p-4 md:p-8 max-w-[900px]">
      <Link
        href="/patient/training"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Back to Training
      </Link>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
            Exercise Library
          </h1>
          {!loading && (
            <p className="text-sm font-medium text-[#6B7280]">
              {exercises.length === 0
                ? "No exercises yet"
                : `${filtered.length} exercise${filtered.length !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>
        <Link
          href="/patient/training/exercises/create"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] hover:bg-[#277A4F] hover:-translate-y-px transition-all duration-150"
        >
          <Plus size={14} />
          New Exercise
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {/* Filter pills */}
      {!loading && muscleGroups.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedGroup("all")}
            className={pillCls(selectedGroup === "all")}
          >
            All
          </button>
          {muscleGroups.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGroup(g.name)}
              className={pillCls(selectedGroup === g.name)}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden divide-y divide-[#F3F4F6]">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center py-14 px-6 text-center">
          <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center mb-4">
            <BookOpen size={22} className="text-[#9CA3AF]" />
          </div>
          <p className="text-[15px] font-semibold text-[#374151] mb-1">No exercises found</p>
          <p className="text-[13px] text-[#9CA3AF] mb-4">
            {selectedGroup !== "all" ? "Try a different filter." : "Create your first exercise."}
          </p>
          {selectedGroup === "all" && (
            <Link
              href="/patient/training/exercises/create"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] hover:bg-[#277A4F] transition-all duration-150"
            >
              <Plus size={14} />
              Create your first exercise
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="divide-y divide-[#F3F4F6]">
            {filtered.map((exercise) => (
              <Link
                key={exercise.id}
                href={`/patient/training/exercises/${exercise.id}`}
                className="flex items-start gap-3 px-4 py-3.5 hover:bg-[#F9FAFB] transition-colors duration-100"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#111827]">{exercise.name}</p>
                  {exercise.description && (
                    <p className="text-[12px] text-[#9CA3AF] truncate mt-0.5">
                      {exercise.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {exercise.muscleGroupName && (
                    <span className="text-[11px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
                      {exercise.muscleGroupName}
                    </span>
                  )}
                  <span className="text-[12px] font-semibold text-[#2E8B5A]">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

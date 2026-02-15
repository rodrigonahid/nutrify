"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface MuscleGroup {
  id: number;
  name: string;
}

const inputCls = "w-full h-11 px-3.5 bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-[10px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] hover:bg-[#F3F4F6] focus:outline-none focus:bg-white focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.16)] transition-all duration-150";
const labelCls = "block text-[14px] font-semibold text-[#374151] mb-1.5";

export default function CreateExercisePage() {
  const router = useRouter();
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [muscleGroupId, setMuscleGroupId] = useState("");

  useEffect(() => {
    fetch("/api/patient/training/muscle-groups")
      .then((r) => r.json())
      .then((d) => setMuscleGroups(d.muscleGroups ?? []))
      .catch(() => setError("Failed to load muscle groups"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/patient/training/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
          muscleGroupId: muscleGroupId ? parseInt(muscleGroupId) : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create exercise");
      }
      router.push("/patient/training/exercises");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create exercise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[600px]">
      <Link
        href="/patient/training/exercises"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Back to Exercise Library
      </Link>

      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight">New Exercise</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626]">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className={labelCls}>Exercise Name *</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Bench Press"
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="description" className={labelCls}>Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description or notes"
            rows={3}
            className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-[10px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] focus:outline-none focus:bg-white focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.16)] transition-all duration-150 resize-none"
          />
        </div>

        <div>
          <label htmlFor="muscleGroup" className={labelCls}>Muscle Group</label>
          <select
            id="muscleGroup"
            value={muscleGroupId}
            onChange={(e) => setMuscleGroupId(e.target.value)}
            className={inputCls}
          >
            <option value="">— Select muscle group —</option>
            {muscleGroups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center h-11 px-5 text-[14px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] hover:bg-[#277A4F] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
          >
            {loading ? "Creating…" : "Create Exercise"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center h-11 px-5 text-[14px] font-semibold text-[#374151] bg-white border-[1.5px] border-[#E5E7EB] rounded-[10px] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-all duration-150"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, TrendingUp, UtensilsCrossed, CalendarDays, Dumbbell, Plus } from "lucide-react";
import { Patient, Progress, MealPlanListItem, PatientPlan } from "@/types";

function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPlanDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPrice(price: string, currency: string) {
  const num = parseFloat(price);
  if (currency === "BRL") return `R$ ${num.toFixed(2).replace(".", ",")}`;
  return `${currency} ${num.toFixed(2)}`;
}

const PLAN_STATUS_STYLES: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "text-[#2E8B5A] bg-[rgba(46,139,90,0.08)]" },
  paused: { label: "Paused", className: "text-[#854D0E] bg-[#FEF9C3]" },
  cancelled: { label: "Cancelled", className: "text-[#DC2626] bg-[#FEF2F2]" },
};

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.patientId as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [recentProgress, setRecentProgress] = useState<Progress[]>([]);
  const [activeMealPlan, setActiveMealPlan] = useState<MealPlanListItem | null>(null);
  const [plan, setPlan] = useState<PatientPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [patientRes, progressRes, mealPlanRes, planRes] = await Promise.all([
          fetch(`/api/professional/patients/${patientId}`),
          fetch(`/api/professional/patients/${patientId}/progress`),
          fetch(`/api/professional/patients/${patientId}/meal-plan`),
          fetch(`/api/professional/patients/${patientId}/plan`),
        ]);

        if (!patientRes.ok) throw new Error("Failed to load patient");

        const [patientData, progressData, mealPlanData, planData] = await Promise.all([
          patientRes.json(),
          progressRes.ok ? progressRes.json() : { progress: [] },
          mealPlanRes.ok ? mealPlanRes.json() : { mealPlans: [] },
          planRes.ok ? planRes.json() : { plan: null },
        ]);

        setPatient(patientData.patient);
        setRecentProgress((progressData.progress ?? []).slice(0, 3));
        const active = (mealPlanData.mealPlans ?? []).find(
          (mp: MealPlanListItem) => mp.isActive
        ) ?? null;
        setActiveMealPlan(active);
        setPlan(planData.plan ?? null);
      } catch {
        setError("Failed to load patient data");
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [patientId]);

  const displayName = patient?.name ?? patient?.email ?? "Patient";
  const initial = displayName[0]?.toUpperCase() ?? "?";
  const age = calculateAge(patient?.dateOfBirth ?? null);

  const QUICK_ACTIONS = [
    {
      href: `/professional/patients/${patientId}/progress`,
      icon: TrendingUp,
      label: "Progress",
      desc: "View measurement history",
    },
    {
      href: `/professional/patients/${patientId}/meal-plan`,
      icon: UtensilsCrossed,
      label: "Meal Plans",
      desc: "Manage nutrition plans",
    },
    {
      href: `/professional/patients/${patientId}/appointments`,
      icon: CalendarDays,
      label: "Appointments",
      desc: "Schedule and history",
    },
    {
      href: `/professional/patients/${patientId}/training`,
      icon: Dumbbell,
      label: "Training",
      desc: "Workouts and exercises",
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      {/* Back link */}
      <Link
        href="/professional/patients"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← My Patients
      </Link>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {/* Patient header */}
      {loading ? (
        <div className="flex items-center gap-4 mb-8 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-[#F3F4F6] shrink-0" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-[#F3F4F6] rounded" />
            <div className="h-3.5 w-32 bg-[#F3F4F6] rounded" />
          </div>
        </div>
      ) : patient && (
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-[rgba(46,139,90,0.10)] flex items-center justify-center shrink-0">
            <span className="text-[18px] font-bold text-[#2E8B5A] uppercase">{initial}</span>
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight leading-tight">
              {displayName}
            </h1>
            {patient.name && (
              <p className="text-sm text-[#9CA3AF] mb-1">{patient.email}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-1">
              {age !== null && (
                <span className="text-[12px] font-medium text-[#6B7280] bg-[#F3F4F6] rounded-full px-2.5 py-0.5">
                  {age} years old
                </span>
              )}
              {patient.height && (
                <span className="text-[12px] font-medium text-[#6B7280] bg-[#F3F4F6] rounded-full px-2.5 py-0.5">
                  {patient.height} cm
                </span>
              )}
              {patient.weight && (
                <span className="text-[12px] font-medium text-[#6B7280] bg-[#F3F4F6] rounded-full px-2.5 py-0.5">
                  {patient.weight} kg
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {QUICK_ACTIONS.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-start gap-3 transition-all duration-150 hover:border-[#D1D5DB] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-px"
          >
            <div className="w-9 h-9 rounded-[10px] bg-[rgba(46,139,90,0.08)] flex items-center justify-center shrink-0 transition-colors duration-150 group-hover:bg-[rgba(46,139,90,0.12)]">
              <Icon size={16} className="text-[#2E8B5A]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#111827] mb-0.5">{label}</p>
              <p className="text-[12px] text-[#9CA3AF]">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Active Meal Plan */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3F4F6]">
          <p className="text-[14px] font-semibold text-[#111827]">Active Meal Plan</p>
          <Link
            href={
              activeMealPlan
                ? `/professional/patients/${patientId}/meal-plan/${activeMealPlan.id}`
                : `/professional/patients/${patientId}/meal-plan/create`
            }
            className="inline-flex items-center gap-1 h-7 px-3 text-[12px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] rounded-[6px] hover:bg-[rgba(46,139,90,0.14)] transition-colors duration-100"
          >
            {activeMealPlan ? "Edit" : (
              <>
                <Plus size={11} strokeWidth={2.5} />
                Create
              </>
            )}
          </Link>
        </div>

        {loading ? (
          <div className="px-4 py-4 animate-pulse">
            <div className="h-4 w-48 bg-[#F3F4F6] rounded" />
          </div>
        ) : activeMealPlan ? (
          <Link
            href={`/professional/patients/${patientId}/meal-plan/${activeMealPlan.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[#F9FAFB] transition-colors duration-100 group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#111827] truncate">
                {activeMealPlan.name}
              </p>
              <p className="text-[12px] text-[#9CA3AF]">
                {activeMealPlan.mealCount} meal{activeMealPlan.mealCount !== 1 ? "s" : ""}
              </p>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] px-2.5 py-0.5 rounded-full">
              Active
            </span>
            <ChevronRight
              size={15}
              strokeWidth={2}
              className="text-[#D1D5DB] group-hover:text-[#9CA3AF] transition-colors shrink-0"
            />
          </Link>
        ) : (
          <div className="px-4 py-5 text-center">
            <p className="text-[13px] text-[#9CA3AF]">No active meal plan yet.</p>
          </div>
        )}
      </div>

      {/* Payment Plan */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3F4F6]">
          <p className="text-[14px] font-semibold text-[#111827]">Payment Plan</p>
          <Link
            href={`/professional/patients/${patientId}/plan`}
            className="inline-flex items-center gap-1 h-7 px-3 text-[12px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] rounded-[6px] hover:bg-[rgba(46,139,90,0.14)] transition-colors duration-100"
          >
            {plan ? "Manage plan" : (
              <>
                <Plus size={11} strokeWidth={2.5} />
                Set plan
              </>
            )}
          </Link>
        </div>
        {loading ? (
          <div className="px-4 py-4 animate-pulse">
            <div className="h-4 w-48 bg-[#F3F4F6] rounded" />
          </div>
        ) : plan ? (
          <Link
            href={`/professional/patients/${patientId}/plan`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[#F9FAFB] transition-colors duration-100 group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#111827]">
                {formatPrice(plan.price, plan.currency)} / {plan.billingCycle}
              </p>
              {plan.nextPaymentDate && (
                <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                  Next payment: {formatPlanDate(plan.nextPaymentDate)}
                </p>
              )}
            </div>
            {(() => {
              const s = PLAN_STATUS_STYLES[plan.status] ?? PLAN_STATUS_STYLES.active;
              return (
                <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${s.className}`}>
                  {s.label}
                </span>
              );
            })()}
            <ChevronRight size={15} strokeWidth={2} className="text-[#D1D5DB] group-hover:text-[#9CA3AF] transition-colors shrink-0" />
          </Link>
        ) : (
          <div className="px-4 py-5 text-center">
            <p className="text-[13px] text-[#9CA3AF]">No plan set.</p>
          </div>
        )}
      </div>

      {/* Recent Progress */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3F4F6]">
          <p className="text-[14px] font-semibold text-[#111827]">Recent Progress</p>
          <Link
            href={`/professional/patients/${patientId}/progress/create`}
            className="inline-flex items-center gap-1 h-7 px-3 text-[12px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] rounded-[6px] hover:bg-[rgba(46,139,90,0.14)] transition-colors duration-100"
          >
            <Plus size={11} strokeWidth={2.5} />
            Add
          </Link>
        </div>

        {loading ? (
          <div className="divide-y divide-[#F3F4F6] animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-28 bg-[#F3F4F6] rounded" />
                  <div className="h-3 w-44 bg-[#F3F4F6] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : recentProgress.length === 0 ? (
          <div className="px-4 py-5 text-center">
            <p className="text-[13px] text-[#9CA3AF]">No progress entries yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {recentProgress.map((entry) => (
              <Link
                key={entry.id}
                href={`/professional/patients/${patientId}/progress/${entry.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#F9FAFB] transition-colors duration-100 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#111827]">
                    {formatDate(entry.createdAt)}
                  </p>
                  <div className="flex flex-wrap gap-x-3 mt-0.5">
                    {entry.totalWeight && (
                      <span className="text-[12px] text-[#9CA3AF]">{entry.totalWeight} kg</span>
                    )}
                    {entry.bmi && (
                      <span className="text-[12px] text-[#9CA3AF]">BMI {entry.bmi}</span>
                    )}
                    {entry.bodyFatPercentage && (
                      <span className="text-[12px] text-[#9CA3AF]">{entry.bodyFatPercentage}% body fat</span>
                    )}
                  </div>
                </div>
                <ChevronRight
                  size={15}
                  strokeWidth={2}
                  className="text-[#D1D5DB] group-hover:text-[#9CA3AF] transition-colors shrink-0"
                />
              </Link>
            ))}
            <Link
              href={`/professional/patients/${patientId}/progress`}
              className="flex items-center justify-center px-4 py-2.5 text-[12.5px] font-medium text-[#6B7280] hover:text-[#2E8B5A] hover:bg-[#F9FAFB] transition-colors duration-100"
            >
              View all progress →
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}

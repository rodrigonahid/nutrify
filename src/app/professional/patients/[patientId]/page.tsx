"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, TrendingUp, UtensilsCrossed, CalendarDays, Dumbbell, Plus } from "lucide-react";
import { Patient, Progress, MealPlanListItem, PatientPlan } from "@/types";
import { getPaymentSchedule, PaymentEntry } from "@/lib/payment-schedule";
import { CreateAppointmentModal } from "@/components/appointments/create-appointment-modal";

interface Appointment {
  id: number;
  patientId: number;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  status: string;
  notes: string | null;
}

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
  return new Date(dateString).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPlanDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR", {
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
  active: { label: "Ativo", className: "text-[#2E8B5A] bg-[rgba(46,139,90,0.08)]" },
  paused: { label: "Pausado", className: "text-[#854D0E] bg-[#FEF9C3]" },
  cancelled: { label: "Cancelado", className: "text-[#DC2626] bg-[#FEF2F2]" },
};

function PaymentScheduleList({
  plan,
  onToggle,
}: {
  plan: PatientPlan;
  onToggle?: (newLastPaymentDate: string | null) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);
  const entries: PaymentEntry[] = getPaymentSchedule(plan);

  const paidCount = entries.filter((e) => e.status === "paid").length;
  const collapsedCount = Math.max(0, paidCount - 6);
  const visibleEntries = entries.slice(collapsedCount);

  async function handleEntryClick(entry: PaymentEntry) {
    if (!onToggle || updating) return;
    const idx = entries.findIndex((e) => e.date === entry.date);
    const newLastPaymentDate =
      entry.status !== "paid" ? entry.date : idx > 0 ? entries[idx - 1].date : null;
    setUpdating(true);
    try {
      await onToggle(newLastPaymentDate);
    } finally {
      setUpdating(false);
    }
  }

  if (entries.length === 0) {
    return (
      <p className="text-[13px] text-[#9CA3AF] py-1">Nenhum pagamento agendado.</p>
    );
  }

  return (
    <div className={`space-y-1 transition-opacity ${updating ? "opacity-50 pointer-events-none" : ""}`}>
      {collapsedCount > 0 && (
        <p className="text-[12px] text-[#9CA3AF] py-1">
          + {collapsedCount} pagamento{collapsedCount !== 1 ? "s" : ""} anterior{collapsedCount !== 1 ? "es" : ""}
        </p>
      )}
      {visibleEntries.map((entry) => {
        const iconText = entry.status === "paid" ? "✓" : entry.status === "overdue" ? "!" : "→";
        const iconBg =
          entry.status === "paid"
            ? "bg-[rgba(46,139,90,0.08)]"
            : entry.status === "overdue"
            ? "bg-[#FEF2F2]"
            : "bg-[#F3F4F6]";
        const iconColor =
          entry.status === "paid"
            ? "text-[#2E8B5A]"
            : entry.status === "overdue"
            ? "text-[#DC2626]"
            : "text-[#6B7280]";
        const textColor =
          entry.status === "paid"
            ? "text-[#2E8B5A]"
            : entry.status === "overdue"
            ? "text-[#DC2626]"
            : "text-[#6B7280]";

        const iconEl = onToggle ? (
          <button
            type="button"
            onClick={() => handleEntryClick(entry)}
            className={`w-5 h-5 rounded-full ${iconBg} flex items-center justify-center shrink-0 cursor-pointer hover:opacity-70 transition-opacity`}
          >
            <span className={`text-[9px] font-black ${iconColor}`}>{iconText}</span>
          </button>
        ) : (
          <div className={`w-5 h-5 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
            <span className={`text-[9px] font-black ${iconColor}`}>{iconText}</span>
          </div>
        );

        return (
          <div key={entry.date} className="flex items-center gap-2.5 py-1.5">
            {iconEl}
            <span className={`text-[13px] font-medium ${textColor}`}>{formatPlanDate(entry.date)}</span>
            {entry.status === "overdue" && (
              <span className="ml-auto text-[11px] font-semibold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded-full">Atrasado</span>
            )}
            {entry.status === "upcoming" && (
              <span className="ml-auto text-[11px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">Próximo</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.patientId as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [recentProgress, setRecentProgress] = useState<Progress[]>([]);
  const [activeMealPlan, setActiveMealPlan] = useState<MealPlanListItem | null>(null);
  const [plan, setPlan] = useState<PatientPlan | null>(null);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  async function handlePaymentToggle(newLastPaymentDate: string | null) {
    if (!plan) return;
    const res = await fetch(`/api/professional/patients/${patientId}/plan`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: parseFloat(plan.price),
        currency: plan.currency,
        billingCycle: plan.billingCycle,
        status: plan.status,
        startDate: plan.startDate,
        nextPaymentDate: plan.nextPaymentDate ?? null,
        lastPaymentDate: newLastPaymentDate,
        notes: plan.notes ?? null,
      }),
    });
    if (res.ok) {
      setPlan({ ...plan, lastPaymentDate: newLastPaymentDate });
    }
  }

  useEffect(() => {
    async function fetchAll() {
      try {
        const [patientRes, progressRes, mealPlanRes, planRes, appointmentsRes] = await Promise.all([
          fetch(`/api/professional/patients/${patientId}`),
          fetch(`/api/professional/patients/${patientId}/progress`),
          fetch(`/api/professional/patients/${patientId}/meal-plan`),
          fetch(`/api/professional/patients/${patientId}/plan`),
          fetch(`/api/professional/appointments?patientId=${patientId}`),
        ]);

        if (!patientRes.ok) throw new Error("Failed to load patient");

        const [patientData, progressData, mealPlanData, planData, appointmentsData] = await Promise.all([
          patientRes.json(),
          progressRes.ok ? progressRes.json() : { progress: [] },
          mealPlanRes.ok ? mealPlanRes.json() : { mealPlans: [] },
          planRes.ok ? planRes.json() : { plan: null },
          appointmentsRes.ok ? appointmentsRes.json() : { appointments: [] },
        ]);

        setPatient(patientData.patient);
        setRecentProgress((progressData.progress ?? []).slice(0, 3));
        const active = (mealPlanData.mealPlans ?? []).find(
          (mp: MealPlanListItem) => mp.isActive
        ) ?? null;
        setActiveMealPlan(active);
        setPlan(planData.plan ?? null);

        // Find the next upcoming appointment: date >= today, not cancelled, earliest first
        const todayStr = new Date().toLocaleDateString("sv-SE"); // "YYYY-MM-DD" in local time
        const upcoming: Appointment[] = (appointmentsData.appointments ?? [])
          .filter((a: Appointment) =>
            a.status !== "cancelled" && a.appointmentDate >= todayStr
          )
          .sort((a: Appointment, b: Appointment) =>
            a.appointmentDate !== b.appointmentDate
              ? a.appointmentDate.localeCompare(b.appointmentDate)
              : a.appointmentTime.localeCompare(b.appointmentTime)
          );
        setNextAppointment(upcoming[0] ?? null);
      } catch {
        setError("Falha ao carregar dados do paciente");
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [patientId]);

  const displayName = patient?.name ?? patient?.email ?? "Patient";
  const initial = displayName[0]?.toUpperCase() ?? "?";
  const age = calculateAge(patient?.dateOfBirth ?? null);

  async function refreshNextAppointment() {
    try {
      const res = await fetch(`/api/professional/appointments?patientId=${patientId}`);
      if (!res.ok) return;
      const data = await res.json();
      const todayStr = new Date().toLocaleDateString("sv-SE");
      const upcoming: Appointment[] = (data.appointments ?? [])
        .filter((a: Appointment) =>
          a.status !== "cancelled" && a.appointmentDate >= todayStr
        )
        .sort((a: Appointment, b: Appointment) =>
          a.appointmentDate !== b.appointmentDate
            ? a.appointmentDate.localeCompare(b.appointmentDate)
            : a.appointmentTime.localeCompare(b.appointmentTime)
        );
      setNextAppointment(upcoming[0] ?? null);
    } catch {
      // silently fail — widget just won't update
    }
  }

  const QUICK_ACTIONS = [
    {
      href: `/professional/patients/${patientId}/progress`,
      icon: TrendingUp,
      label: "Progresso",
      desc: "Ver histórico de medidas",
    },
    {
      href: `/professional/patients/${patientId}/meal-plan`,
      icon: UtensilsCrossed,
      label: "Planos alimentares",
      desc: "Gerenciar planos nutricionais",
    },
    {
      href: `/professional/patients/${patientId}/appointments`,
      icon: CalendarDays,
      label: "Consultas",
      desc: "Agenda e histórico",
    },
    {
      href: `/professional/patients/${patientId}/training`,
      icon: Dumbbell,
      label: "Treino",
      desc: "Treinos e exercícios",
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      {/* Back link */}
      <Link
        href="/professional/patients"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Meus pacientes
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
                  {age} anos
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

      {/* Next Appointment widget */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3F4F6]">
          <p className="text-[14px] font-semibold text-[#111827]">Próxima consulta</p>
          <div className="flex items-center gap-2">
            <Link
              href={`/professional/patients/${patientId}/appointments`}
              className="inline-flex items-center gap-1 h-7 px-3 text-[12px] font-semibold text-[#6B7280] bg-[#F3F4F6] rounded-[6px] hover:bg-[#E5E7EB] transition-colors duration-100"
            >
              Ver todas
            </Link>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1 h-7 px-3 text-[12px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] rounded-[6px] hover:bg-[rgba(46,139,90,0.14)] transition-colors duration-100"
            >
              <Plus size={11} strokeWidth={2.5} />
              Agendar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="px-4 py-4 animate-pulse flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#F3F4F6] shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-36 bg-[#F3F4F6] rounded" />
              <div className="h-3 w-24 bg-[#F3F4F6] rounded" />
            </div>
          </div>
        ) : nextAppointment ? (
          <Link
            href={`/professional/patients/${patientId}/appointments`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[#F9FAFB] transition-colors duration-100 group"
          >
            <div className="w-9 h-9 rounded-[10px] bg-[rgba(46,139,90,0.08)] flex items-center justify-center shrink-0">
              <CalendarDays size={16} className="text-[#2E8B5A]" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#111827]">
                {(() => {
                  const d = new Date(nextAppointment.appointmentDate + "T00:00:00");
                  const today = new Date(); today.setHours(0,0,0,0);
                  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
                  d.setHours(0,0,0,0);
                  if (d.getTime() === today.getTime()) return "Hoje";
                  if (d.getTime() === tomorrow.getTime()) return "Amanhã";
                  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
                })()}
              </p>
              <p className="text-[12px] text-[#9CA3AF]">
                {(() => {
                  const [h, m] = nextAppointment.appointmentTime.split(":").map(Number);
                  const isPM = h >= 12;
                  const h12 = h % 12 || 12;
                  return `${h12}:${String(m).padStart(2,"0")} ${isPM ? "PM" : "AM"}`;
                })()} · {nextAppointment.durationMinutes} min
              </p>
            </div>
            {(() => {
              const STATUS_LABELS: Record<string,string> = { confirmed:"Confirmada", pending:"Pendente", requested:"Solicitada", completed:"Concluída" };
              const STATUS_STYLES: Record<string,string> = {
                confirmed: "text-[#2E8B5A] bg-[rgba(46,139,90,0.08)]",
                pending: "text-[#B45309] bg-[rgba(180,83,9,0.08)]",
                requested: "text-[#1D4ED8] bg-[rgba(29,78,216,0.08)]",
                completed: "text-[#6B7280] bg-[#F3F4F6]",
              };
              return (
                <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[nextAppointment.status] ?? "text-[#6B7280] bg-[#F3F4F6]"}`}>
                  {STATUS_LABELS[nextAppointment.status] ?? nextAppointment.status}
                </span>
              );
            })()}
            <ChevronRight size={15} strokeWidth={2} className="text-[#D1D5DB] group-hover:text-[#9CA3AF] transition-colors shrink-0" />
          </Link>
        ) : (
          <div className="px-4 py-5 text-center">
            <p className="text-[13px] text-[#9CA3AF]">Nenhuma consulta agendada.</p>
          </div>
        )}
      </div>

      {/* Active Meal Plan */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3F4F6]">
          <p className="text-[14px] font-semibold text-[#111827]">Plano alimentar ativo</p>
          <Link
            href={
              activeMealPlan
                ? `/professional/patients/${patientId}/meal-plan/${activeMealPlan.id}`
                : `/professional/patients/${patientId}/meal-plan/create`
            }
            className="inline-flex items-center gap-1 h-7 px-3 text-[12px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] rounded-[6px] hover:bg-[rgba(46,139,90,0.14)] transition-colors duration-100"
          >
            {activeMealPlan ? "Editar" : (
              <>
                <Plus size={11} strokeWidth={2.5} />
                Criar
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
                {activeMealPlan.mealCount} {activeMealPlan.mealCount !== 1 ? "refeições" : "refeição"}
              </p>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] px-2.5 py-0.5 rounded-full">
              Ativo
            </span>
            <ChevronRight
              size={15}
              strokeWidth={2}
              className="text-[#D1D5DB] group-hover:text-[#9CA3AF] transition-colors shrink-0"
            />
          </Link>
        ) : (
          <div className="px-4 py-5 text-center">
            <p className="text-[13px] text-[#9CA3AF]">Nenhum plano alimentar ativo.</p>
          </div>
        )}
      </div>

      {/* Payment Plan */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3F4F6]">
          <p className="text-[14px] font-semibold text-[#111827]">Plano de pagamento</p>
          <Link
            href={`/professional/patients/${patientId}/plan`}
            className="inline-flex items-center gap-1 h-7 px-3 text-[12px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] rounded-[6px] hover:bg-[rgba(46,139,90,0.14)] transition-colors duration-100"
          >
            {plan ? "Gerenciar plano" : (
              <>
                <Plus size={11} strokeWidth={2.5} />
                Definir plano
              </>
            )}
          </Link>
        </div>
        {loading ? (
          <div className="px-4 py-4 animate-pulse">
            <div className="h-4 w-48 bg-[#F3F4F6] rounded" />
          </div>
        ) : plan ? (
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[14px] font-semibold text-[#111827]">
                {formatPrice(plan.price, plan.currency)} / {plan.billingCycle}
              </p>
              {(() => {
                const s = PLAN_STATUS_STYLES[plan.status] ?? PLAN_STATUS_STYLES.active;
                return (
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${s.className}`}>
                    {s.label}
                  </span>
                );
              })()}
            </div>
            <span className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-wide block mb-2">Histórico de pagamentos</span>
            <PaymentScheduleList plan={plan} onToggle={handlePaymentToggle} />
          </div>
        ) : (
          <div className="px-4 py-5 text-center">
            <p className="text-[13px] text-[#9CA3AF]">Nenhum plano definido.</p>
          </div>
        )}
      </div>

      {/* Recent Progress */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3F4F6]">
          <p className="text-[14px] font-semibold text-[#111827]">Progresso recente</p>
          <Link
            href={`/professional/patients/${patientId}/progress/create`}
            className="inline-flex items-center gap-1 h-7 px-3 text-[12px] font-semibold text-[#2E8B5A] bg-[rgba(46,139,90,0.08)] rounded-[6px] hover:bg-[rgba(46,139,90,0.14)] transition-colors duration-100"
          >
            <Plus size={11} strokeWidth={2.5} />
            Adicionar
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
            <p className="text-[13px] text-[#9CA3AF]">Nenhum registro de progresso ainda.</p>
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
                      <span className="text-[12px] text-[#9CA3AF]">IMC {entry.bmi}</span>
                    )}
                    {entry.bodyFatPercentage && (
                      <span className="text-[12px] text-[#9CA3AF]">{entry.bodyFatPercentage}% gordura</span>
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
              Ver todo o progresso →
            </Link>
          </div>
        )}
      </div>

      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refreshNextAppointment}
        defaultPatientId={parseInt(patientId, 10)}
      />
    </div>
  );
}

import { getSession } from "@/lib/session";
import { db } from "@/db";
import { appointments, patients, professionals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Users, Calendar, KeyRound, Clock } from "lucide-react";
import Link from "next/link";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  confirmed:  { bg: "bg-[#DCFCE7]", text: "text-[#166534]", dot: "bg-[#16A34A]" },
  pending:    { bg: "bg-[#FEF9C3]", text: "text-[#854D0E]", dot: "bg-[#CA8A04]" },
  requested:  { bg: "bg-[#DBEAFE]", text: "text-[#1E40AF]", dot: "bg-[#3B82F6]" },
  cancelled:  { bg: "bg-[#FEE2E2]", text: "text-[#991B1B]", dot: "bg-[#EF4444]" },
  completed:  { bg: "bg-[#F3F4F6]", text: "text-[#374151]", dot: "bg-[#9CA3AF]" },
};

const QUICK_ACTIONS = [
  {
    href: "/professional/patients",
    icon: Users,
    label: "Meus pacientes",
    desc: "Visualize e gerencie seus pacientes",
  },
  {
    href: "/professional/appointments",
    icon: Calendar,
    label: "Agenda",
    desc: "Veja todas as suas consultas",
  },
  {
    href: "/professional/invite-codes",
    icon: KeyRound,
    label: "Códigos de convite",
    desc: "Gere códigos para novos pacientes",
  },
  {
    href: "/professional/schedules",
    icon: Clock,
    label: "Horários",
    desc: "Gerencie sua disponibilidade",
  },
];

function formatTime(timeString: string) {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const isPM = hour >= 12;
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${isPM ? "PM" : "AM"}`;
}

export default async function ProfessionalDashboard() {
  const { user } = await getSession();
  // Auth is handled by layout — user is guaranteed to be a professional here

  const [professional] = await db
    .select()
    .from(professionals)
    .where(eq(professionals.userId, user!.id))
    .limit(1);

  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = professional
    ? await db
        .select({
          id: appointments.id,
          patientId: appointments.patientId,
          appointmentDate: appointments.appointmentDate,
          appointmentTime: appointments.appointmentTime,
          durationMinutes: appointments.durationMinutes,
          status: appointments.status,
          patientName: patients.name,
        })
        .from(appointments)
        .innerJoin(patients, eq(appointments.patientId, patients.id))
        .where(eq(appointments.appointmentDate, today))
        .orderBy(appointments.appointmentTime)
    : [];

  // Determine current, previous, next
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  let currentAppointment = null;
  let previousAppointment = null;
  let nextAppointment = null;

  for (let i = 0; i < todayAppointments.length; i++) {
    const apt = todayAppointments[i];
    const [hours, minutes] = apt.appointmentTime.split(":").map(Number);
    const aptEndTime = `${String(hours + Math.floor((minutes + apt.durationMinutes) / 60)).padStart(2, "0")}:${String((minutes + apt.durationMinutes) % 60).padStart(2, "0")}`;

    if (currentTime >= apt.appointmentTime && currentTime < aptEndTime) {
      currentAppointment = apt;
      previousAppointment = todayAppointments[i - 1] ?? null;
      nextAppointment = todayAppointments[i + 1] ?? null;
      break;
    } else if (currentTime < apt.appointmentTime && !nextAppointment) {
      nextAppointment = apt;
      previousAppointment = todayAppointments[i - 1] ?? null;
      break;
    }
  }

  if (!currentAppointment && !nextAppointment && todayAppointments.length > 0) {
    previousAppointment = todayAppointments[todayAppointments.length - 1];
  }

  const displayAppointments = [previousAppointment, currentAppointment, nextAppointment].filter(Boolean);

  const dateLabel = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-1">
          Hoje
        </h1>
        <p className="text-sm font-medium text-[#6B7280]">{dateLabel}</p>
      </div>

      {/* Today's appointments */}
      {todayAppointments.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-[15px] font-semibold text-[#111827]">
              Consultas de hoje
            </h2>
            <span className="text-[13px] font-medium text-[#9CA3AF]">
              {todayAppointments.length} total
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
            {displayAppointments.map((apt) => {
              if (!apt) return null;
              const isCurrent = apt === currentAppointment;
              const isPrevious = apt === previousAppointment;
              const isNext = apt === nextAppointment;
              const statusStyle = STATUS_STYLES[apt.status] ?? STATUS_STYLES.completed;

              return (
                <Link
                  key={apt.id}
                  href={`/professional/patients/${apt.patientId}`}
                  className={[
                    "flex-shrink-0 w-56 snap-start bg-white rounded-xl border p-4 transition-all duration-150",
                    isCurrent
                      ? "border-[#2E8B5A] shadow-[0_0_0_3px_rgba(46,139,90,0.10)]"
                      : "border-[#E5E7EB] hover:border-[#D1D5DB] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-px",
                  ].join(" ")}
                >
                  {/* Label row */}
                  <div className="flex items-center gap-1.5 mb-2">
                    {isPrevious && (
                      <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Anterior</span>
                    )}
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#2E8B5A] uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B5A] animate-pulse" />
                        Agora
                      </span>
                    )}
                    {isNext && (
                      <span className="text-[11px] font-semibold text-[#3B82F6] uppercase tracking-wide">Próxima</span>
                    )}
                  </div>

                  {/* Time + duration */}
                  <div className="mb-3">
                    <div className="text-[18px] font-bold text-[#111827] tracking-tight">
                      {formatTime(apt.appointmentTime)}
                    </div>
                    <div className="text-[12px] text-[#9CA3AF] font-medium">
                      {apt.durationMinutes} min
                    </div>
                  </div>

                  {/* Patient + status */}
                  <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-3">
                    <span className="text-[13px] font-semibold text-[#374151] truncate pr-2">
                      {apt.patientName}
                    </span>
                    <span className={`shrink-0 flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                      <span className={`w-1 h-1 rounded-full ${statusStyle.dot}`} />
                      {apt.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {todayAppointments.length === 0 && (
        <section className="mb-8">
          <div className="bg-white border border-[#E5E7EB] rounded-xl px-5 py-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-[10px] bg-[#F3F4F6] flex items-center justify-center shrink-0">
              <Calendar size={18} className="text-[#9CA3AF]" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#374151]">Sem consultas hoje</p>
              <p className="text-[13px] text-[#9CA3AF]">
                Sua agenda está livre hoje.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Quick access */}
      <section>
        <h2 className="text-[15px] font-semibold text-[#111827] mb-4">Acesso rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_ACTIONS.map(({ href, icon: Icon, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="group bg-white border border-[#E5E7EB] rounded-xl p-5 flex items-start gap-4 transition-all duration-150 hover:border-[#D1D5DB] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-px"
            >
              <div className="w-10 h-10 rounded-[10px] bg-[rgba(46,139,90,0.08)] flex items-center justify-center shrink-0 transition-colors duration-150 group-hover:bg-[rgba(46,139,90,0.12)]">
                <Icon size={18} className="text-[#2E8B5A]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#111827] mb-0.5">{label}</p>
                <p className="text-[13px] text-[#9CA3AF]">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}

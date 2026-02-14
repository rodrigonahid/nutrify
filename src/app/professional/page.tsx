import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";
import { db } from "@/db";
import { appointments, patients, professionals, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Clock } from "lucide-react";

export default async function ProfessionalDashboard() {
  const { user } = await getSession();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "professional") {
    redirect("/login");
  }

  // Get professional ID
  const [professional] = await db
    .select()
    .from(professionals)
    .where(eq(professionals.userId, user.id))
    .limit(1);

  // Get today's appointments
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

  // Determine current, previous, and next appointments
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  let currentAppointment = null;
  let previousAppointment = null;
  let nextAppointment = null;

  for (let i = 0; i < todayAppointments.length; i++) {
    const apt = todayAppointments[i];
    const aptStartTime = apt.appointmentTime;
    const [hours, minutes] = aptStartTime.split(":").map(Number);
    const aptEndTime = `${String(
      hours + Math.floor((minutes + apt.durationMinutes) / 60)
    ).padStart(2, "0")}:${String((minutes + apt.durationMinutes) % 60).padStart(
      2,
      "0"
    )}`;

    if (currentTime >= aptStartTime && currentTime < aptEndTime) {
      currentAppointment = apt;
      previousAppointment = todayAppointments[i - 1] || null;
      nextAppointment = todayAppointments[i + 1] || null;
      break;
    } else if (currentTime < aptStartTime && !nextAppointment) {
      nextAppointment = apt;
      previousAppointment = todayAppointments[i - 1] || null;
      break;
    }
  }

  // If no current/next found, all appointments are in the past
  if (!currentAppointment && !nextAppointment && todayAppointments.length > 0) {
    previousAppointment = todayAppointments[todayAppointments.length - 1];
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const isPM = hour >= 12;
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${isPM ? "PM" : "AM"}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "requested":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const displayAppointments = [
    previousAppointment,
    currentAppointment,
    nextAppointment,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Professional Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <a
            href="/professional/patients"
            className="p-6 border rounded-lg hover:border-primary transition-colors"
          >
            <h2 className="text-lg font-semibold mb-2">My Patients</h2>
            <p className="text-muted-foreground text-sm">
              View and manage your patients
            </p>
          </a>

          <a
            href="/professional/invite-codes"
            className="p-6 border rounded-lg hover:border-primary transition-colors"
          >
            <h2 className="text-lg font-semibold mb-2">Invite Codes</h2>
            <p className="text-muted-foreground text-sm">
              Generate codes for new patients
            </p>
          </a>

          <a
            href="/professional/appointments"
            className="p-6 border rounded-lg hover:border-primary transition-colors"
          >
            <h2 className="text-lg font-semibold mb-2">Agenda</h2>
            <p className="text-muted-foreground text-sm">
              View all your appointments
            </p>
          </a>
        </div>

        {/* Today's Appointments */}
        {todayAppointments.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Today's Appointments</h2>
              <span className="text-sm text-muted-foreground">
                {todayAppointments.length} total
              </span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {displayAppointments.map((apt: any, idx) => {
                const isCurrent = apt === currentAppointment;
                const isPrevious = apt === previousAppointment;
                const isNext = apt === nextAppointment;

                return (
                  <a
                    key={apt.id}
                    href={`/professional/patients/${apt.patientId}`}
                    className={`flex-shrink-0 w-64 snap-start border rounded-lg p-4 transition-all ${
                      isCurrent
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {isPrevious && (
                            <span className="text-xs text-muted-foreground font-medium">
                              Previous
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-xs text-primary font-medium">
                              Current
                            </span>
                          )}
                          {isNext && (
                            <span className="text-xs text-blue-600 font-medium">
                              Next
                            </span>
                          )}
                        </div>
                        <div className="text-lg font-semibold">
                          {formatTime(apt.appointmentTime)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {apt.durationMinutes} min
                        </div>
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(
                          apt.status
                        )}`}
                      >
                        {apt.status}
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="font-medium text-sm">{apt.patientName}</div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

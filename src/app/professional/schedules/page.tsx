"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { CreateAppointmentModal } from "@/components/appointments/create-appointment-modal";
import { AppointmentWithPatient } from "@/types";

export default function SchedulesPage() {
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      // Fetch all appointments (including cancelled) to show complete history
      const response = await fetch(`/api/professional/appointments`);
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      const data = await response.json();
      setAppointments(data.appointments);
    } catch (err) {
      setError("Failed to load appointments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCancelModal(appointmentId: number) {
    setAppointmentToCancel(appointmentId);
    setCancellationReason("");
    setIsCancelModalOpen(true);
  }

  async function handleCancelAppointment() {
    if (!appointmentToCancel) return;

    if (!cancellationReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }

    try {
      const response = await fetch(`/api/professional/appointments/${appointmentToCancel}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cancellationReason: cancellationReason.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel appointment");
      }

      setIsCancelModalOpen(false);
      setAppointmentToCancel(null);
      setCancellationReason("");
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to cancel appointment");
    }
  }

  function getStatusBadgeColor(status: string): string {
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
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return "Today";
    } else if (date.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  function groupAppointmentsByDate(appointments: AppointmentWithPatient[]) {
    const groups: { [key: string]: AppointmentWithPatient[] } = {};

    appointments.forEach((appointment) => {
      const date = appointment.appointmentDate;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(appointment);
    });

    // Sort appointments within each group by time
    Object.keys(groups).forEach((date) => {
      groups[date].sort((a, b) =>
        a.appointmentTime.localeCompare(b.appointmentTime)
      );
    });

    return groups;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const groupedAppointments = groupAppointmentsByDate(appointments);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Schedules" />

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <Link
          href="/professional"
          className="inline-block mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Dashboard
        </Link>

        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Appointments</h2>
            <p className="text-muted-foreground">
              View and manage your upcoming appointments
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            + Add Schedule
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
            {error}
          </div>
        )}

        {appointments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                No appointments scheduled. Create your first appointment to get started.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-primary hover:underline"
              >
                + Add Schedule
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedAppointments).map(([date, dateAppointments]) => (
              <div key={date}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {formatDate(date)}
                </h3>
                <div className="grid gap-4">
                  {dateAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {appointment.appointmentTime} ({appointment.durationMinutes} min)
                            </CardTitle>
                            <CardDescription className="mt-1">
                              Patient: {appointment.patientEmail}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded border ${getStatusBadgeColor(
                                appointment.status
                              )}`}
                            >
                              {appointment.status}
                            </span>
                            {appointment.status !== "cancelled" && (
                              <button
                                onClick={() => openCancelModal(appointment.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Cancel appointment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      {(appointment.notes || appointment.cancellationReason) && (
                        <CardContent>
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground mb-2">
                              <strong>Notes:</strong> {appointment.notes}
                            </p>
                          )}
                          {appointment.cancellationReason && (
                            <p className="text-sm text-red-600">
                              <strong>Cancellation Reason:</strong> {appointment.cancellationReason}
                            </p>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAppointments}
      />

      {/* Cancel Appointment Modal */}
      {isCancelModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setIsCancelModalOpen(false)}
        >
          <div
            className="w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Card>
              <CardHeader>
                <CardTitle>Cancel Appointment</CardTitle>
                <CardDescription>
                  Please provide a reason for cancelling this appointment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Enter cancellation reason..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {cancellationReason.length}/500 characters
                </p>
              </CardContent>
              <div className="px-6 pb-6">
                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Keep Appointment
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAppointment}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancel Appointment
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";

interface Appointment {
  id: number;
  patientId: number;
  patientEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  status: string;
  notes: string | null;
  cancellationReason: string | null;
}

export default function PatientAppointmentsPage() {
  const params = useParams();
  const patientId = params.patientId as string;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientEmail, setPatientEmail] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, [patientId]);

  async function fetchAppointments() {
    try {
      const response = await fetch(
        `/api/professional/appointments?patientId=${patientId}`
      );
      const data = await response.json();
      const apts = data.appointments || [];
      setAppointments(apts);
      if (apts.length > 0) {
        setPatientEmail(apts[0].patientEmail);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

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

  const today = new Date().toISOString().split("T")[0];

  // Separate into upcoming and past
  const upcomingAppointments = appointments.filter(
    (apt) => apt.appointmentDate >= today
  );
  const pastAppointments = appointments.filter(
    (apt) => apt.appointmentDate < today
  );

  // Group by date
  const groupByDate = (apts: Appointment[]) => {
    return apts.reduce((acc, apt) => {
      if (!acc[apt.appointmentDate]) {
        acc[apt.appointmentDate] = [];
      }
      acc[apt.appointmentDate].push(apt);
      return acc;
    }, {} as Record<string, Appointment[]>);
  };

  const upcomingGrouped = groupByDate(upcomingAppointments);
  const pastGrouped = groupByDate(pastAppointments);

  const upcomingDates = Object.keys(upcomingGrouped).sort();
  const pastDates = Object.keys(pastGrouped).sort().reverse();

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={`Appointments - ${patientEmail}`} />

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <Link
          href={`/professional/patients/${patientId}`}
          className="inline-block mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Patient Details
        </Link>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No appointments found for this patient
            </p>
          </Card>
        ) : (
          <div className="space-y-12">
            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  Upcoming Appointments ({upcomingAppointments.length})
                </h2>

                <div className="space-y-8">
                  {upcomingDates.map((date) => (
                    <div key={date}>
                      <h3 className="text-lg font-semibold mb-4">
                        {formatDate(date)}
                      </h3>

                      <div className="grid gap-4">
                        {upcomingGrouped[date]
                          .sort((a, b) =>
                            a.appointmentTime.localeCompare(b.appointmentTime)
                          )
                          .map((apt) => (
                            <Card key={apt.id} className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-lg font-semibold">
                                      {formatTime(apt.appointmentTime)}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {apt.durationMinutes} min
                                    </span>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(
                                        apt.status
                                      )}`}
                                    >
                                      {apt.status}
                                    </span>
                                  </div>

                                  {apt.notes && (
                                    <div className="text-sm text-muted-foreground mt-2">
                                      {apt.notes}
                                    </div>
                                  )}

                                  {apt.cancellationReason && (
                                    <div className="text-sm text-red-600 mt-2">
                                      Cancelled: {apt.cancellationReason}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-muted-foreground">
                  Past Appointments ({pastAppointments.length})
                </h2>

                <div className="space-y-8">
                  {pastDates.map((date) => (
                    <div key={date}>
                      <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
                        {formatDate(date)}
                      </h3>

                      <div className="grid gap-4">
                        {pastGrouped[date]
                          .sort((a, b) =>
                            a.appointmentTime.localeCompare(b.appointmentTime)
                          )
                          .map((apt) => (
                            <Card
                              key={apt.id}
                              className="p-4 opacity-75 hover:opacity-100 transition-opacity"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-lg font-semibold">
                                      {formatTime(apt.appointmentTime)}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {apt.durationMinutes} min
                                    </span>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(
                                        apt.status
                                      )}`}
                                    >
                                      {apt.status}
                                    </span>
                                  </div>

                                  {apt.notes && (
                                    <div className="text-sm text-muted-foreground mt-2">
                                      {apt.notes}
                                    </div>
                                  )}

                                  {apt.cancellationReason && (
                                    <div className="text-sm text-red-600 mt-2">
                                      Cancelled: {apt.cancellationReason}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

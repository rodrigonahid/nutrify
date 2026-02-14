"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar as BigCalendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon, List } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

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

interface CalendarEvent extends Event {
  id: number;
  patientId: number;
  patientEmail: string;
  status: string;
  notes: string | null;
}

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [view, setView] = useState<"list" | "calendar">("list");

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      const response = await fetch("/api/professional/appointments");
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
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

  const getEventColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#22c55e"; // green
      case "pending":
        return "#eab308"; // yellow
      case "requested":
        return "#3b82f6"; // blue
      case "cancelled":
        return "#ef4444"; // red
      case "completed":
        return "#9ca3af"; // gray
      default:
        return "#9ca3af";
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === "upcoming") {
      return apt.appointmentDate >= today;
    } else if (filter === "past") {
      return apt.appointmentDate < today;
    }
    return true;
  });

  // Convert appointments to calendar events
  const calendarEvents: CalendarEvent[] = filteredAppointments.map((apt) => {
    const [hours, minutes] = apt.appointmentTime.split(":").map(Number);
    const startDate = new Date(apt.appointmentDate + "T00:00:00");
    startDate.setHours(hours, minutes);

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + apt.durationMinutes);

    return {
      id: apt.id,
      title: apt.patientEmail,
      start: startDate,
      end: endDate,
      patientId: apt.patientId,
      patientEmail: apt.patientEmail,
      status: apt.status,
      notes: apt.notes,
    };
  });

  // Group by date for list view
  const groupedAppointments = filteredAppointments.reduce((acc, apt) => {
    if (!acc[apt.appointmentDate]) {
      acc[apt.appointmentDate] = [];
    }
    acc[apt.appointmentDate].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  // Sort dates
  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => {
    if (filter === "past") {
      return b.localeCompare(a); // Newest first for past
    }
    return a.localeCompare(b); // Oldest first for upcoming/all
  });

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Agenda" />

      <main className="container mx-auto px-4 py-8 max-w-[1400px]">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/professional"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Dashboard
          </Link>

          <div className="flex gap-3">
            {/* Filter buttons */}
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "upcoming" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("upcoming")}
              >
                Upcoming
              </Button>
              <Button
                variant={filter === "past" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("past")}
              >
                Past
              </Button>
            </div>

            {/* View toggle */}
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("list")}
                className="gap-2"
              >
                <List className="h-4 w-4" />
                List
              </Button>
              <Button
                variant={view === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("calendar")}
                className="gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                Calendar
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading appointments...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No appointments found</p>
          </Card>
        ) : view === "calendar" ? (
          /* Calendar View */
          <Card className="p-6">
            <div style={{ height: "700px" }}>
              <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                onSelectEvent={(event) => {
                  window.location.href = `/professional/patients/${event.patientId}`;
                }}
                eventPropGetter={(event) => ({
                  style: {
                    backgroundColor: getEventColor(event.status),
                    borderColor: getEventColor(event.status),
                    color: "white",
                  },
                })}
                views={["month", "week", "day", "agenda"]}
                defaultView="month"
              />
            </div>
          </Card>
        ) : (
          /* List View */
          <div className="space-y-8">
            {sortedDates.map((date) => (
              <div key={date}>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>{formatDate(date)}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    ({groupedAppointments[date].length} appointment
                    {groupedAppointments[date].length !== 1 ? "s" : ""})
                  </span>
                </h2>

                <div className="grid gap-4">
                  {groupedAppointments[date]
                    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
                    .map((apt) => (
                      <Link
                        key={apt.id}
                        href={`/professional/patients/${apt.patientId}`}
                        className="block"
                      >
                        <Card className="p-4 hover:border-primary transition-colors cursor-pointer">
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

                              <div className="font-medium mb-1">
                                {apt.patientEmail}
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
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 12px 4px;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
        }
        .rbc-today {
          background-color: #f0fdf4;
        }
        .rbc-event {
          padding: 4px;
          border-radius: 4px;
          font-size: 0.875rem;
        }
        .rbc-event:focus {
          outline: 2px solid #22c55e;
        }
        .rbc-toolbar button {
          color: inherit;
          font-weight: 500;
          border: 1px solid #e5e7eb;
          background: white;
          padding: 6px 12px;
          border-radius: 6px;
        }
        .rbc-toolbar button:hover {
          background: #f9fafb;
        }
        .rbc-toolbar button.rbc-active {
          background: hsl(var(--primary));
          color: white;
          border-color: hsl(var(--primary));
        }
      `}</style>
    </div>
  );
}

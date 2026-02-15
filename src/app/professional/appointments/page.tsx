"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar as BigCalendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
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

function statusStyle(status: string) {
  switch (status) {
    case "confirmed":
      return "text-[#2E8B5A] bg-[rgba(46,139,90,0.08)]";
    case "pending":
      return "text-[#B45309] bg-[rgba(180,83,9,0.08)]";
    case "requested":
      return "text-[#1D4ED8] bg-[rgba(29,78,216,0.08)]";
    case "cancelled":
      return "text-[#DC2626] bg-[rgba(220,38,38,0.08)]";
    case "completed":
    default:
      return "text-[#6B7280] bg-[#F3F4F6]";
  }
}

function eventColor(status: string) {
  switch (status) {
    case "confirmed": return "#2E8B5A";
    case "pending":   return "#B45309";
    case "requested": return "#1D4ED8";
    case "cancelled": return "#DC2626";
    default:          return "#9CA3AF";
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === tomorrow.getTime()) return "Tomorrow";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeString: string) {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const isPM = hour >= 12;
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${isPM ? "PM" : "AM"}`;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-40 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-28 bg-[#F3F4F6] rounded" />
      </div>
      <div className="h-5 w-16 bg-[#F3F4F6] rounded-full" />
    </div>
  );
}

type Filter = "all" | "upcoming" | "past";
type View = "list" | "calendar";

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<View>("list");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/professional/appointments");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setAppointments(data.appointments ?? []);
      } catch {
        setError("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const filtered = appointments.filter((a) => {
    if (filter === "upcoming") return a.appointmentDate >= today;
    if (filter === "past") return a.appointmentDate < today;
    return true;
  });

  const calendarEvents: CalendarEvent[] = filtered.map((apt) => {
    const [hours, minutes] = apt.appointmentTime.split(":").map(Number);
    const start = new Date(apt.appointmentDate + "T00:00:00");
    start.setHours(hours, minutes);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + apt.durationMinutes);
    return {
      id: apt.id,
      title: apt.patientEmail,
      start,
      end,
      patientId: apt.patientId,
      patientEmail: apt.patientEmail,
      status: apt.status,
      notes: apt.notes,
    };
  });

  const grouped = filtered.reduce((acc, a) => {
    (acc[a.appointmentDate] ??= []).push(a);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const sortedDates = Object.keys(grouped).sort((a, b) =>
    filter === "past" ? b.localeCompare(a) : a.localeCompare(b)
  );

  const filterBtn = (f: Filter, label: string) => (
    <button
      onClick={() => setFilter(f)}
      className={`h-7 px-3 text-[12px] font-semibold rounded-[6px] transition-colors duration-100 ${
        filter === f
          ? "bg-[#111827] text-white"
          : "text-[#6B7280] hover:text-[#374151] hover:bg-[#F3F4F6]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      {/* Back link */}
      <Link
        href="/professional"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Back to Dashboard
      </Link>

      {/* Page heading + controls */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
            Agenda
          </h1>
          {!loading && (
            <p className="text-sm font-medium text-[#6B7280]">
              {appointments.length === 0
                ? "No appointments"
                : `${appointments.length} appointment${appointments.length !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Filter pills */}
          <div className="flex gap-1">
            {filterBtn("all", "All")}
            {filterBtn("upcoming", "Upcoming")}
            {filterBtn("past", "Past")}
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-[#F3F4F6] rounded-[8px] p-0.5 gap-0.5">
            <button
              onClick={() => setView("list")}
              className={`h-7 w-7 flex items-center justify-center rounded-[6px] transition-colors duration-100 ${
                view === "list"
                  ? "bg-white text-[#111827] shadow-sm"
                  : "text-[#9CA3AF] hover:text-[#374151]"
              }`}
              aria-label="List view"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`h-7 w-7 flex items-center justify-center rounded-[6px] transition-colors duration-100 ${
                view === "calendar"
                  ? "bg-white text-[#111827] shadow-sm"
                  : "text-[#9CA3AF] hover:text-[#374151]"
              }`}
              aria-label="Calendar view"
            >
              <CalendarIcon size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[2, 3].map((rows, i) => (
            <div key={i}>
              <div className="h-3.5 w-40 bg-[#F3F4F6] rounded animate-pulse mb-2" />
              <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden divide-y divide-[#F3F4F6]">
                {Array.from({ length: rows }).map((_, j) => <SkeletonRow key={j} />)}
              </div>
            </div>
          ))}
        </div>
      ) : view === "calendar" ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden p-4">
          <div style={{ height: 680 }}>
            <BigCalendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              onSelectEvent={(event) => {
                window.location.href = `/professional/patients/${(event as CalendarEvent).patientId}`;
              }}
              eventPropGetter={(event) => {
                const color = eventColor((event as CalendarEvent).status);
                return { style: { backgroundColor: color, borderColor: color, color: "white" } };
              }}
              views={["month", "week", "day", "agenda"]}
              defaultView="month"
            />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center py-14 px-6 text-center">
          <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center mb-4">
            <CalendarIcon size={22} className="text-[#9CA3AF]" />
          </div>
          <p className="text-[15px] font-semibold text-[#374151] mb-1">
            No appointments found
          </p>
          <p className="text-[13px] text-[#9CA3AF]">
            {filter === "upcoming" ? "No upcoming appointments." : filter === "past" ? "No past appointments." : "No appointments scheduled yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <div key={date}>
              <p className="text-[13px] font-semibold text-[#374151] mb-2">
                {formatDate(date)}
                <span className="text-[#9CA3AF] font-normal ml-1.5">
                  · {grouped[date].length}
                </span>
              </p>
              <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                <div className="divide-y divide-[#F3F4F6]">
                  {grouped[date]
                    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
                    .map((apt) => (
                      <Link
                        key={apt.id}
                        href={`/professional/patients/${apt.patientId}`}
                        className="flex items-start gap-3 px-4 py-3.5 hover:bg-[#F9FAFB] transition-colors duration-100 block"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[14px] font-semibold text-[#111827]">
                              {formatTime(apt.appointmentTime)}
                            </p>
                            <span className="text-[12px] text-[#9CA3AF]">
                              {apt.durationMinutes} min
                            </span>
                          </div>
                          <p className="text-[12px] text-[#6B7280] truncate">
                            {apt.patientEmail}
                          </p>
                          {apt.notes && (
                            <p className="text-[12px] text-[#9CA3AF] mt-0.5 line-clamp-1">
                              {apt.notes}
                            </p>
                          )}
                          {apt.cancellationReason && (
                            <p className="text-[12px] text-[#DC2626] mt-0.5">
                              Cancelled: {apt.cancellationReason}
                            </p>
                          )}
                        </div>
                        <span
                          className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${statusStyle(apt.status)}`}
                        >
                          {apt.status}
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        .rbc-calendar { font-family: inherit; }
        .rbc-header { padding: 10px 4px; font-weight: 600; font-size: 13px; border-bottom: 1px solid #E5E7EB; }
        .rbc-today { background-color: rgba(46,139,90,0.04); }
        .rbc-event { padding: 3px 6px; border-radius: 4px; font-size: 12px; }
        .rbc-event:focus { outline: 2px solid #2E8B5A; }
        .rbc-toolbar button { color: #374151; font-weight: 500; font-size: 13px; border: 1px solid #E5E7EB; background: white; padding: 5px 12px; border-radius: 6px; }
        .rbc-toolbar button:hover { background: #F9FAFB; }
        .rbc-toolbar button.rbc-active { background: #2E8B5A; color: white; border-color: #2E8B5A; }
      `}</style>
    </div>
  );
}

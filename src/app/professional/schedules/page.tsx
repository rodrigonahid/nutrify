"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { CreateAppointmentModal } from "@/components/appointments/create-appointment-modal";
import { AppointmentWithPatient } from "@/types";

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

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-36 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-28 bg-[#F3F4F6] rounded" />
      </div>
      <div className="h-5 w-16 bg-[#F3F4F6] rounded-full" />
    </div>
  );
}

export default function SchedulesPage() {
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
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

  function openCancelModal(id: number) {
    setAppointmentToCancel(id);
    setCancellationReason("");
    setIsCancelModalOpen(true);
  }

  async function handleCancel() {
    if (!appointmentToCancel) return;
    if (!cancellationReason.trim()) {
      setError("Please provide a cancellation reason");
      return;
    }
    setCancelling(true);
    try {
      const res = await fetch(`/api/professional/appointments/${appointmentToCancel}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancellationReason: cancellationReason.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to cancel appointment");
      }
      setIsCancelModalOpen(false);
      setAppointmentToCancel(null);
      setCancellationReason("");
      await fetchAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel appointment");
    } finally {
      setCancelling(false);
    }
  }

  const grouped = appointments.reduce((acc, a) => {
    (acc[a.appointmentDate] ??= []).push(a);
    return acc;
  }, {} as Record<string, AppointmentWithPatient[]>);

  const sortedDates = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      {/* Back link */}
      <Link
        href="/professional"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Back to Dashboard
      </Link>

      {/* Page heading */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
            Appointments
          </h1>
          {!loading && (
            <p className="text-sm font-medium text-[#6B7280]">
              {appointments.length === 0
                ? "No appointments yet"
                : `${appointments.length} appointment${appointments.length !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#2E8B5A] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#277A4F] transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] shrink-0"
        >
          <Plus size={13} strokeWidth={2.5} />
          Add Schedule
        </button>
      </div>

      {/* Error */}
      {error && !isCancelModalOpen && (
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
      ) : appointments.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center py-14 px-6 text-center">
          <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center mb-4">
            <Calendar size={22} className="text-[#9CA3AF]" />
          </div>
          <p className="text-[15px] font-semibold text-[#374151] mb-1">
            No appointments scheduled
          </p>
          <p className="text-[13px] text-[#9CA3AF] mb-5">
            Create your first appointment to get started.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#2E8B5A] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#277A4F] transition-colors duration-150"
          >
            <Plus size={13} strokeWidth={2.5} />
            Add Schedule
          </button>
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
                      <div
                        key={apt.id}
                        className="flex items-start gap-3 px-4 py-3.5"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[14px] font-semibold text-[#111827]">
                              {apt.appointmentTime}
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

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${statusStyle(apt.status)}`}>
                            {apt.status}
                          </span>
                          {apt.status !== "cancelled" && (
                            <button
                              onClick={() => openCancelModal(apt.id)}
                              className="h-7 w-7 flex items-center justify-center text-[#9CA3AF] hover:text-[#DC2626] rounded-[6px] transition-colors duration-100"
                              aria-label="Cancel appointment"
                            >
                              <Trash2 size={13} strokeWidth={2} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAppointments}
      />

      {/* Cancel Modal */}
      {isCancelModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setIsCancelModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-[#F3F4F6]">
              <p className="text-[16px] font-bold text-[#111827]">Cancel Appointment</p>
              <p className="text-[13px] text-[#6B7280] mt-0.5">
                Please provide a reason for cancelling.
              </p>
            </div>

            <div className="p-6 space-y-4">
              {error && isCancelModalOpen && (
                <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-3 py-2.5 text-[13px] font-semibold text-[#DC2626]">
                  {error}
                </div>
              )}
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Enter cancellation reason…"
                className="w-full px-3 py-2.5 text-[14px] text-[#111827] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[10px] focus:outline-none focus:border-[#2E8B5A] focus:ring-[3px] focus:ring-[rgba(46,139,90,0.16)] focus:bg-white resize-none transition-all"
                rows={4}
                maxLength={500}
              />
              <p className="text-[11px] text-[#9CA3AF] -mt-2 text-right">
                {cancellationReason.length}/500
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  disabled={cancelling}
                  className="flex-1 h-11 flex items-center justify-center text-[14px] font-semibold text-[#374151] bg-white border border-[#E5E7EB] rounded-[10px] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-all duration-150 disabled:opacity-50"
                >
                  Keep Appointment
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 h-11 flex items-center justify-center gap-2 text-[14px] font-semibold text-white bg-[#DC2626] rounded-[10px] hover:bg-[#B91C1C] transition-colors duration-150 disabled:opacity-60"
                >
                  {cancelling ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Cancelling…
                    </>
                  ) : (
                    "Cancel Appointment"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

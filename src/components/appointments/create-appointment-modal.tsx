"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createAppointmentSchema } from "@/lib/validation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

interface Patient {
  id: number;
  email: string;
}

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  patientId: number;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  notes?: string;
}

export function CreateAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateAppointmentModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(createAppointmentSchema) as any,
    defaultValues: {
      durationMinutes: 60,
    },
  });

  // Fetch patients when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPatients();
    }
  }, [isOpen]);

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/professional/patients");
      if (!response.ok) throw new Error("Failed to fetch patients");
      const data = await response.json();
      setPatients(data.patients || []);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to load patients");
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/professional/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create appointment");
      }

      reset();
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Card>
          <CardHeader>
            <CardTitle>Create Appointment</CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
              <div className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="patientId"
                    className="block text-sm font-medium mb-1"
                  >
                    Patient
                  </label>
                  <select
                    id="patientId"
                    {...register("patientId", { valueAsNumber: true })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.email}
                      </option>
                    ))}
                  </select>
                  {errors.patientId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.patientId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="appointmentDate"
                    className="block text-sm font-medium mb-1"
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    id="appointmentDate"
                    min={today}
                    {...register("appointmentDate")}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.appointmentDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.appointmentDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="appointmentTime"
                    className="block text-sm font-medium mb-1"
                  >
                    Time
                  </label>
                  <input
                    type="time"
                    id="appointmentTime"
                    {...register("appointmentTime")}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.appointmentTime && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.appointmentTime.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="durationMinutes"
                    className="block text-sm font-medium mb-1"
                  >
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="durationMinutes"
                    {...register("durationMinutes", { valueAsNumber: true })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.durationMinutes && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.durationMinutes.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium mb-1"
                  >
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    {...register("notes")}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Add any additional notes..."
                  />
                  {errors.notes && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.notes.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

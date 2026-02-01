import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, patients, professionals, users } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { cancelAppointmentSchema } from "@/lib/validation";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/patient/appointments/[appointmentId]
 * Get appointment details for the patient
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const user = await requireRole(["patient"]);
    const { appointmentId } = await params;

    // Get the patient record
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    // Get the appointment with professional details
    const [appointment] = await db
      .select({
        id: appointments.id,
        professionalId: appointments.professionalId,
        patientId: appointments.patientId,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        durationMinutes: appointments.durationMinutes,
        status: appointments.status,
        notes: appointments.notes,
        cancelledBy: appointments.cancelledBy,
        cancellationReason: appointments.cancellationReason,
        cancelledAt: appointments.cancelledAt,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt,
        professionalEmail: users.email,
      })
      .from(appointments)
      .innerJoin(professionals, eq(appointments.professionalId, professionals.id))
      .innerJoin(users, eq(professionals.userId, users.id))
      .where(
        and(
          eq(appointments.id, parseInt(appointmentId)),
          eq(appointments.patientId, patient.id)
        )
      )
      .limit(1);

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/patient/appointments/[appointmentId]
 * Cancel an appointment with a reason (marks as cancelled instead of deleting)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const user = await requireRole(["patient"]);
    const { appointmentId } = await params;
    const body = await request.json();

    // Validate the cancellation reason
    const validationResult = cancelAppointmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error },
        { status: 400 }
      );
    }

    // Get the patient record
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    // Verify the appointment belongs to this patient
    const [existingAppointment] = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.id, parseInt(appointmentId)),
          eq(appointments.patientId, patient.id)
        )
      )
      .limit(1);

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Appointment not found or access denied" },
        { status: 404 }
      );
    }

    // Check if appointment is already cancelled
    if (existingAppointment.status === "cancelled") {
      return NextResponse.json(
        { error: "Appointment is already cancelled" },
        { status: 400 }
      );
    }

    // Update the appointment to cancelled status
    const [updatedAppointment] = await db
      .update(appointments)
      .set({
        status: "cancelled",
        cancelledBy: user.id,
        cancellationReason: validationResult.data.cancellationReason,
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, parseInt(appointmentId)))
      .returning();

    return NextResponse.json({ appointment: updatedAppointment });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error cancelling appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

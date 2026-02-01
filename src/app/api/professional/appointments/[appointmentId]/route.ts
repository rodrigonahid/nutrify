import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, patients, professionals, users } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { updateAppointmentSchema, cancelAppointmentSchema } from "@/lib/validation";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/professional/appointments/[appointmentId]
 * Get appointment details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { appointmentId } = await params;

    // Get the professional ID
    const [professional] = await db
      .select()
      .from(professionals)
      .where(eq(professionals.userId, user.id))
      .limit(1);

    if (!professional) {
      return NextResponse.json(
        { error: "Professional profile not found" },
        { status: 404 }
      );
    }

    // Get the appointment with patient details
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
        patientEmail: users.email,
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(users, eq(patients.userId, users.id))
      .where(
        and(
          eq(appointments.id, parseInt(appointmentId)),
          eq(appointments.professionalId, professional.id)
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
 * PATCH /api/professional/appointments/[appointmentId]
 * Update an appointment
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { appointmentId } = await params;
    const body = await request.json();

    // Validate the request body
    const validationResult = updateAppointmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error },
        { status: 400 }
      );
    }

    // Get the professional ID
    const [professional] = await db
      .select()
      .from(professionals)
      .where(eq(professionals.userId, user.id))
      .limit(1);

    if (!professional) {
      return NextResponse.json(
        { error: "Professional profile not found" },
        { status: 404 }
      );
    }

    // Verify the appointment belongs to this professional
    const [existingAppointment] = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.id, parseInt(appointmentId)),
          eq(appointments.professionalId, professional.id)
        )
      )
      .limit(1);

    if (!existingAppointment) {
      return NextResponse.json(
        { error: "Appointment not found or access denied" },
        { status: 404 }
      );
    }

    // If updating date or time, check for conflicts
    if (validationResult.data.appointmentDate || validationResult.data.appointmentTime) {
      const newDate = validationResult.data.appointmentDate || existingAppointment.appointmentDate;
      const newTime = validationResult.data.appointmentTime || existingAppointment.appointmentTime;

      // Only check for conflicts if date or time actually changed
      if (
        newDate !== existingAppointment.appointmentDate ||
        newTime !== existingAppointment.appointmentTime
      ) {
        const [conflictingAppointment] = await db
          .select()
          .from(appointments)
          .where(
            and(
              eq(appointments.professionalId, professional.id),
              eq(appointments.appointmentDate, newDate),
              eq(appointments.appointmentTime, newTime),
              eq(appointments.status, "confirmed")
            )
          )
          .limit(1);

        if (conflictingAppointment && conflictingAppointment.id !== parseInt(appointmentId)) {
          return NextResponse.json(
            { error: "An appointment already exists at this date and time" },
            { status: 409 }
          );
        }
      }
    }

    // Update the appointment
    const [updatedAppointment] = await db
      .update(appointments)
      .set({
        ...validationResult.data,
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
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/professional/appointments/[appointmentId]
 * Cancel an appointment with a reason (marks as cancelled instead of deleting)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
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

    // Get the professional ID
    const [professional] = await db
      .select()
      .from(professionals)
      .where(eq(professionals.userId, user.id))
      .limit(1);

    if (!professional) {
      return NextResponse.json(
        { error: "Professional profile not found" },
        { status: 404 }
      );
    }

    // Verify the appointment belongs to this professional
    const [existingAppointment] = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.id, parseInt(appointmentId)),
          eq(appointments.professionalId, professional.id)
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

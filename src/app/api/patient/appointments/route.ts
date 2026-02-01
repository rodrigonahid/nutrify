import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, patients, professionals, users } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { createAppointmentSchema } from "@/lib/validation";
import { eq, and, desc } from "drizzle-orm";

/**
 * GET /api/patient/appointments
 * List all appointments for the current patient
 */
export async function GET() {
  try {
    const user = await requireRole(["patient"]);

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

    // Get all appointments for this patient with professional details
    const appointmentsList = await db
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
      .where(eq(appointments.patientId, patient.id))
      .orderBy(desc(appointments.appointmentDate), desc(appointments.appointmentTime));

    return NextResponse.json({ appointments: appointmentsList });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/patient/appointments
 * Request a new appointment (status: "requested" - needs professional approval)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["patient"]);
    const body = await request.json();

    // Validate the request body
    const validationResult = createAppointmentSchema.safeParse(body);
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

    // For patients, we ignore the patientId from the body and use their own ID
    // They can only create appointments for themselves
    const professionalId = patient.professionalId;

    // Check for conflicting appointments (same professional, date, and time)
    // Only check confirmed appointments to prevent conflicts
    const [conflictingAppointment] = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.professionalId, professionalId),
          eq(appointments.appointmentDate, validationResult.data.appointmentDate),
          eq(appointments.appointmentTime, validationResult.data.appointmentTime),
          eq(appointments.status, "confirmed")
        )
      )
      .limit(1);

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 }
      );
    }

    // Create the appointment with "requested" status (patient-requested)
    const [newAppointment] = await db
      .insert(appointments)
      .values({
        professionalId: professionalId,
        patientId: patient.id,
        appointmentDate: validationResult.data.appointmentDate,
        appointmentTime: validationResult.data.appointmentTime,
        durationMinutes: validationResult.data.durationMinutes || 60,
        notes: validationResult.data.notes || null,
        status: "requested", // Patient-requested appointments need approval
      })
      .returning();

    return NextResponse.json({ appointment: newAppointment }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

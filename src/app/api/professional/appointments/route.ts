import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, patients, professionals, users } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { createAppointmentSchema } from "@/lib/validation";
import { eq, and, desc, gte } from "drizzle-orm";

/**
 * GET /api/professional/appointments
 * List all appointments for the current professional with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(["professional"]);

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

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const fromDate = searchParams.get("fromDate");
    const patientId = searchParams.get("patientId");

    // Build the query conditions
    const conditions = [eq(appointments.professionalId, professional.id)];

    if (status) {
      conditions.push(eq(appointments.status, status as any));
    }

    if (fromDate) {
      conditions.push(gte(appointments.appointmentDate, fromDate));
    }

    if (patientId) {
      conditions.push(eq(appointments.patientId, parseInt(patientId)));
    }

    // Get all appointments for this professional
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
        patientEmail: users.email,
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(users, eq(patients.userId, users.id))
      .where(and(...conditions))
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
 * POST /api/professional/appointments
 * Create a new appointment (auto-confirmed status for professional-created appointments)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["professional"]);
    const body = await request.json();

    // Validate the request body
    const validationResult = createAppointmentSchema.safeParse(body);
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

    // Verify the patient belongs to this professional
    const [patient] = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.id, validationResult.data.patientId),
          eq(patients.professionalId, professional.id)
        )
      )
      .limit(1);

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found or access denied" },
        { status: 404 }
      );
    }

    // Check for conflicting appointments (same professional, date, and time)
    const [conflictingAppointment] = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.professionalId, professional.id),
          eq(appointments.appointmentDate, validationResult.data.appointmentDate),
          eq(appointments.appointmentTime, validationResult.data.appointmentTime),
          // Only check non-cancelled appointments
          eq(appointments.status, "confirmed")
        )
      )
      .limit(1);

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: "An appointment already exists at this date and time" },
        { status: 409 }
      );
    }

    // Create the appointment with auto-confirmed status (professional-created)
    const [newAppointment] = await db
      .insert(appointments)
      .values({
        professionalId: professional.id,
        patientId: validationResult.data.patientId,
        appointmentDate: validationResult.data.appointmentDate,
        appointmentTime: validationResult.data.appointmentTime,
        durationMinutes: validationResult.data.durationMinutes || 60,
        notes: validationResult.data.notes || null,
        status: "confirmed", // Auto-confirmed for professional-created appointments
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

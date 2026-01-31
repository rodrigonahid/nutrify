import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients, professionals, users } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/professional/patients/[patientId]
 * Get a single patient's details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { patientId } = await params;

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

    // Verify the patient belongs to this professional and get their data
    const [patient] = await db
      .select({
        id: patients.id,
        userId: patients.userId,
        dateOfBirth: patients.dateOfBirth,
        height: patients.height,
        weight: patients.weight,
        medicalNotes: patients.medicalNotes,
        createdAt: patients.createdAt,
        updatedAt: patients.updatedAt,
        email: users.email,
      })
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .where(
        and(
          eq(patients.id, parseInt(patientId)),
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

    return NextResponse.json({ patient });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

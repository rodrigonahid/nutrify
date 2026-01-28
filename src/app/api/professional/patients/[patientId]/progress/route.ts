import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients, professionals, progress } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { progressSchema } from "@/lib/validation";
import { eq, and, desc } from "drizzle-orm";

/**
 * GET /api/professional/patients/[patientId]/progress
 * List all progress entries for a patient
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

    // Verify the patient belongs to this professional
    const [patient] = await db
      .select()
      .from(patients)
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

    // Get all progress entries for this patient, newest first
    const progressList = await db
      .select()
      .from(progress)
      .where(eq(progress.patientId, patient.id))
      .orderBy(desc(progress.createdAt));

    return NextResponse.json({ progress: progressList });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/professional/patients/[patientId]/progress
 * Create a new progress entry for a patient
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { patientId } = await params;
    const body = await request.json();

    // Validate the request body
    const validationResult = progressSchema.safeParse(body);
    console.log('validationResult :>> ', validationResult);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
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

    // Create the progress entry
    const [newProgress] = await db
      .insert(progress)
      .values({
        patientId: patient.id,
        ...validationResult.data,
      })
      .returning();

    return NextResponse.json({ progress: newProgress }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error creating progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

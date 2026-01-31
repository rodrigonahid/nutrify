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

    // Extract the updatePatientProfile flag
    const { updatePatientProfile, ...progressDataBody } = body;

    // Validate the request body
    const validationResult = progressSchema.safeParse(progressDataBody);
    console.log('validationResult :>> ', validationResult);
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

    // Convert numbers to strings for decimal fields (database expects strings)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const progressData: any = {
      patientId: patient.id,
    };

    // Convert all numeric values to strings for database decimal fields
    Object.entries(validationResult.data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        progressData[key] = typeof value === 'number' ? value.toString() : value;
      }
    });

    // Create the progress entry
    const [newProgress] = await db
      .insert(progress)
      .values(progressData)
      .returning();

    // Update patient profile if requested
    if (updatePatientProfile === true) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const patientUpdateData: any = {};

      // Update height if provided (convert from meters to cm)
      if (validationResult.data.height !== undefined && validationResult.data.height !== null) {
        patientUpdateData.height = (validationResult.data.height * 100).toString();
      }

      // Update weight if provided
      if (validationResult.data.totalWeight !== undefined && validationResult.data.totalWeight !== null) {
        patientUpdateData.weight = validationResult.data.totalWeight.toString();
      }

      // Only update if there's data to update
      if (Object.keys(patientUpdateData).length > 0) {
        patientUpdateData.updatedAt = new Date();

        await db
          .update(patients)
          .set(patientUpdateData)
          .where(eq(patients.id, patient.id));
      }
    }

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

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients, professionals, progress } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { progressSchema } from "@/lib/validation";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/professional/patients/[patientId]/progress/[progressId]
 * Get a single progress entry
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string; progressId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { patientId, progressId } = await params;

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

    // Get the progress entry
    const [progressEntry] = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.id, parseInt(progressId)),
          eq(progress.patientId, patient.id)
        )
      )
      .limit(1);

    if (!progressEntry) {
      return NextResponse.json(
        { error: "Progress entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ progress: progressEntry });
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
 * PATCH /api/professional/patients/[patientId]/progress/[progressId]
 * Update a progress entry (used for auto-save and publishing drafts)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string; progressId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { patientId, progressId } = await params;
    const body = await request.json();

    const { isDraft, updatePatientProfile, ...progressDataBody } = body;

    const validationResult = progressSchema.safeParse(progressDataBody);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error },
        { status: 400 }
      );
    }

    const [professional] = await db
      .select()
      .from(professionals)
      .where(eq(professionals.userId, user.id))
      .limit(1);

    if (!professional) {
      return NextResponse.json({ error: "Professional profile not found" }, { status: 404 });
    }

    const [patient] = await db
      .select()
      .from(patients)
      .where(and(eq(patients.id, parseInt(patientId)), eq(patients.professionalId, professional.id)))
      .limit(1);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found or access denied" }, { status: 404 });
    }

    // Build the update — explicitly set all measurement fields (null clears them)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { updatedAt: new Date() };

    for (const [key, value] of Object.entries(validationResult.data)) {
      if (value === undefined) {
        updateData[key] = null;
      } else {
        updateData[key] = typeof value === "number" ? value.toString() : value;
      }
    }

    if (isDraft !== undefined) {
      updateData.isDraft = isDraft;
    }

    const [updated] = await db
      .update(progress)
      .set(updateData)
      .where(and(eq(progress.id, parseInt(progressId)), eq(progress.patientId, patient.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Progress entry not found" }, { status: 404 });
    }

    // Update patient profile if requested and publishing
    if (updatePatientProfile === true && isDraft === false) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const patientUpdateData: any = {};

      if (validationResult.data.height != null) {
        patientUpdateData.height = validationResult.data.height.toString();
      }
      if (validationResult.data.totalWeight != null) {
        patientUpdateData.weight = validationResult.data.totalWeight.toString();
      }

      if (Object.keys(patientUpdateData).length > 0) {
        patientUpdateData.updatedAt = new Date();
        await db.update(patients).set(patientUpdateData).where(eq(patients.id, patient.id));
      }
    }

    return NextResponse.json({ progress: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error updating progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/professional/patients/[patientId]/progress/[progressId]
 * Delete a progress entry (used to discard drafts)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string; progressId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { patientId, progressId } = await params;

    const [professional] = await db
      .select()
      .from(professionals)
      .where(eq(professionals.userId, user.id))
      .limit(1);

    if (!professional) {
      return NextResponse.json({ error: "Professional profile not found" }, { status: 404 });
    }

    const [patient] = await db
      .select()
      .from(patients)
      .where(and(eq(patients.id, parseInt(patientId)), eq(patients.professionalId, professional.id)))
      .limit(1);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found or access denied" }, { status: 404 });
    }

    await db
      .delete(progress)
      .where(and(eq(progress.id, parseInt(progressId)), eq(progress.patientId, patient.id)));

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error deleting progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

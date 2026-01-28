import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients, professionals, progress } from "@/db/schema";
import { requireRole } from "@/lib/session";
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

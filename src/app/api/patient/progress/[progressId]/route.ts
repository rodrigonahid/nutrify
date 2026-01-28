import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients, progress } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, and, lt, desc } from "drizzle-orm";

/**
 * GET /api/patient/progress/[progressId]
 * Get a single progress entry with comparison to previous entry
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ progressId: string }> }
) {
  try {
    const user = await requireRole(["patient"]);
    const { progressId } = await params;

    // Get the patient ID
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

    // Get the previous progress entry for comparison
    const [previousEntry] = await db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.patientId, patient.id),
          lt(progress.createdAt, progressEntry.createdAt)
        )
      )
      .orderBy(desc(progress.createdAt))
      .limit(1);

    return NextResponse.json({
      progress: progressEntry,
      previous: previousEntry || null,
    });
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

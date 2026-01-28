import { NextResponse } from "next/server";
import { db } from "@/db";
import { patients, progress } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, and, desc } from "drizzle-orm";

/**
 * GET /api/patient/progress
 * List all progress entries for the logged-in patient
 */
export async function GET() {
  try {
    const user = await requireRole(["patient"]);

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

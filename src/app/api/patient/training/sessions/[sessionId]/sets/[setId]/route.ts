import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { exerciseSets, sessionExercises, trainingSessions, patients } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; setId: string }> }
) {
  try {
    const user = await requireRole(["patient"]);
    const { sessionId, setId } = await params;

    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Verify session belongs to patient
    const [session] = await db
      .select()
      .from(trainingSessions)
      .where(
        and(
          eq(trainingSessions.id, parseInt(sessionId)),
          eq(trainingSessions.patientId, patient.id)
        )
      )
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Verify the set belongs to a session exercise within this session
    const [set] = await db
      .select({ id: exerciseSets.id })
      .from(exerciseSets)
      .innerJoin(
        sessionExercises,
        eq(exerciseSets.sessionExerciseId, sessionExercises.id)
      )
      .where(
        and(
          eq(exerciseSets.id, parseInt(setId)),
          eq(sessionExercises.sessionId, parseInt(sessionId))
        )
      )
      .limit(1);

    if (!set) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }

    await db.delete(exerciseSets).where(eq(exerciseSets.id, parseInt(setId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error deleting set:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

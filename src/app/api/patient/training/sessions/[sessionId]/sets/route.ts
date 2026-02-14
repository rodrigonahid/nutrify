import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { exerciseSets, sessionExercises, trainingSessions, patients } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { addSetSchema } from "@/lib/validation";
import { eq, and, max } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await requireRole(["patient"]);
    const { sessionId } = await params;

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

    const body = await request.json();
    const result = addSetSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.issues },
        { status: 400 }
      );
    }

    // Verify sessionExercise belongs to this session
    const [sessionExercise] = await db
      .select()
      .from(sessionExercises)
      .where(
        and(
          eq(sessionExercises.id, result.data.sessionExerciseId),
          eq(sessionExercises.sessionId, parseInt(sessionId))
        )
      )
      .limit(1);

    if (!sessionExercise) {
      return NextResponse.json(
        { error: "Session exercise not found" },
        { status: 404 }
      );
    }

    // Auto-increment setNumber
    const [{ maxSet }] = await db
      .select({ maxSet: max(exerciseSets.setNumber) })
      .from(exerciseSets)
      .where(eq(exerciseSets.sessionExerciseId, result.data.sessionExerciseId));

    const nextSetNumber = (maxSet ?? 0) + 1;

    const [newSet] = await db
      .insert(exerciseSets)
      .values({
        sessionExerciseId: result.data.sessionExerciseId,
        setNumber: nextSetNumber,
        weightKg: result.data.weightKg?.toString(),
        reps: result.data.reps,
        notes: result.data.notes,
      })
      .returning();

    return NextResponse.json({ set: newSet }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error adding set:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

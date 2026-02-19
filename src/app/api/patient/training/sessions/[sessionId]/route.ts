import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trainingSessions, patients, sessionExercises, exercises, exerciseSets } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, and, asc } from "drizzle-orm";

export async function GET(
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

    const [session] = await db
      .select({
        id: trainingSessions.id,
        date: trainingSessions.date,
        notes: trainingSessions.notes,
        workoutId: trainingSessions.workoutId,
        createdAt: trainingSessions.createdAt,
        updatedAt: trainingSessions.updatedAt,
      })
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

    // Get exercises with their sets
    const sessionExerciseList = await db
      .select({
        sessionExerciseId: sessionExercises.id,
        orderIndex: sessionExercises.orderIndex,
        exerciseId: exercises.id,
        exerciseName: exercises.name,
        exerciseDescription: exercises.description,
        setId: exerciseSets.id,
        setNumber: exerciseSets.setNumber,
        weightKg: exerciseSets.weightKg,
        reps: exerciseSets.reps,
        setNotes: exerciseSets.notes,
      })
      .from(sessionExercises)
      .innerJoin(exercises, eq(sessionExercises.exerciseId, exercises.id))
      .leftJoin(exerciseSets, eq(exerciseSets.sessionExerciseId, sessionExercises.id))
      .where(eq(sessionExercises.sessionId, parseInt(sessionId)))
      .orderBy(asc(sessionExercises.orderIndex), asc(exerciseSets.setNumber));

    // Group by session exercise
    const exercisesMap = new Map<
      number,
      {
        sessionExerciseId: number;
        orderIndex: number;
        exerciseId: number;
        exerciseName: string;
        exerciseDescription: string | null;
        sets: Array<{
          id: number;
          setNumber: number;
          weightKg: string | null;
          reps: number | null;
          notes: string | null;
        }>;
      }
    >();

    for (const row of sessionExerciseList) {
      if (!exercisesMap.has(row.sessionExerciseId)) {
        exercisesMap.set(row.sessionExerciseId, {
          sessionExerciseId: row.sessionExerciseId,
          orderIndex: row.orderIndex,
          exerciseId: row.exerciseId,
          exerciseName: row.exerciseName,
          exerciseDescription: row.exerciseDescription,
          sets: [],
        });
      }
      if (row.setId !== null) {
        exercisesMap.get(row.sessionExerciseId)!.sets.push({
          id: row.setId,
          setNumber: row.setNumber!,
          weightKg: row.weightKg,
          reps: row.reps,
          notes: row.setNotes,
        });
      }
    }

    const exercisesData = Array.from(exercisesMap.values()).sort(
      (a, b) => a.orderIndex - b.orderIndex
    );

    return NextResponse.json({ session, exercises: exercisesData });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

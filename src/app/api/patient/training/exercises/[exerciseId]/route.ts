import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { exercises, patients, muscleGroups, sessionExercises, exerciseSets, trainingSessions } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, or, asc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
  try {
    const user = await requireRole(["patient"]);
    const { exerciseId } = await params;

    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const [exercise] = await db
      .select({
        id: exercises.id,
        name: exercises.name,
        description: exercises.description,
        muscleGroupId: exercises.muscleGroupId,
        muscleGroupName: muscleGroups.name,
        patientId: exercises.patientId,
        professionalId: exercises.professionalId,
        createdAt: exercises.createdAt,
      })
      .from(exercises)
      .leftJoin(muscleGroups, eq(exercises.muscleGroupId, muscleGroups.id))
      .where(
        eq(exercises.id, parseInt(exerciseId))
      )
      .limit(1);

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // Verify access
    if (
      exercise.patientId !== patient.id &&
      exercise.professionalId !== patient.professionalId
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get full set history across all sessions, ordered by date
    const history = await db
      .select({
        sessionId: trainingSessions.id,
        date: trainingSessions.date,
        sessionExerciseId: sessionExercises.id,
        setId: exerciseSets.id,
        setNumber: exerciseSets.setNumber,
        weightKg: exerciseSets.weightKg,
        reps: exerciseSets.reps,
        notes: exerciseSets.notes,
      })
      .from(sessionExercises)
      .innerJoin(
        trainingSessions,
        eq(sessionExercises.sessionId, trainingSessions.id)
      )
      .innerJoin(
        exerciseSets,
        eq(exerciseSets.sessionExerciseId, sessionExercises.id)
      )
      .where(eq(sessionExercises.exerciseId, parseInt(exerciseId)))
      .orderBy(asc(trainingSessions.date), asc(exerciseSets.setNumber));

    return NextResponse.json({ exercise, history });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching exercise:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

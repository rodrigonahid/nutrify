import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  workouts,
  patients,
  workoutExercises,
  exercises,
} from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, and, or, max as sqlMax, inArray } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  try {
    const user = await requireRole(["patient"]);
    const { workoutId } = await params;

    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const [workout] = await db
      .select()
      .from(workouts)
      .where(
        and(
          eq(workouts.id, parseInt(workoutId)),
          eq(workouts.patientId, patient.id)
        )
      )
      .limit(1);

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    const body = await request.json();
    const exerciseId = parseInt(body.exerciseId);

    if (!exerciseId || isNaN(exerciseId)) {
      return NextResponse.json({ error: "exerciseId inválido" }, { status: 400 });
    }

    const [exercise] = await db
      .select()
      .from(exercises)
      .where(
        and(
          eq(exercises.id, exerciseId),
          or(
            eq(exercises.patientId, patient.id),
            eq(exercises.professionalId, patient.professionalId)
          )
        )
      )
      .limit(1);

    if (!exercise) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 });
    }

    const [maxResult] = await db
      .select({ maxIdx: sqlMax(workoutExercises.orderIndex) })
      .from(workoutExercises)
      .where(eq(workoutExercises.workoutId, workout.id));

    const nextIndex = (maxResult?.maxIdx ?? -1) + 1;

    const [newWe] = await db
      .insert(workoutExercises)
      .values({ workoutId: workout.id, exerciseId: exercise.id, orderIndex: nextIndex })
      .returning();

    return NextResponse.json({
      workoutExercise: {
        id: newWe.id,
        orderIndex: newWe.orderIndex,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        exerciseDescription: exercise.description,
        muscleGroupName: null,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error adding exercise to workout:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  try {
    const user = await requireRole(["patient"]);
    const { workoutId } = await params;

    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const [workout] = await db
      .select()
      .from(workouts)
      .where(
        and(
          eq(workouts.id, parseInt(workoutId)),
          eq(workouts.patientId, patient.id)
        )
      )
      .limit(1);

    if (!workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    const body = await request.json();
    const updates: { id: number; orderIndex: number }[] = body.exercises;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: "exercises array required" }, { status: 400 });
    }

    // Verify all ids belong to this workout
    const ids = updates.map((u) => u.id);
    const existing = await db
      .select({ id: workoutExercises.id })
      .from(workoutExercises)
      .where(and(eq(workoutExercises.workoutId, workout.id), inArray(workoutExercises.id, ids)));

    if (existing.length !== ids.length) {
      return NextResponse.json({ error: "Invalid exercise ids" }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      for (const { id, orderIndex } of updates) {
        await tx
          .update(workoutExercises)
          .set({ orderIndex })
          .where(eq(workoutExercises.id, id));
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error reordering workout exercises:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

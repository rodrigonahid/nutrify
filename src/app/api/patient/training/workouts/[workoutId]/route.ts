import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workouts, patients, workoutExercises, exercises } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, and, asc } from "drizzle-orm";

export async function GET(
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

    const exerciseList = await db
      .select({
        id: workoutExercises.id,
        orderIndex: workoutExercises.orderIndex,
        exerciseId: exercises.id,
        exerciseName: exercises.name,
        exerciseDescription: exercises.description,
      })
      .from(workoutExercises)
      .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
      .where(eq(workoutExercises.workoutId, workout.id))
      .orderBy(asc(workoutExercises.orderIndex));

    return NextResponse.json({ workout, exercises: exerciseList });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching workout:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
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

    await db.delete(workouts).where(eq(workouts.id, workout.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error deleting workout:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

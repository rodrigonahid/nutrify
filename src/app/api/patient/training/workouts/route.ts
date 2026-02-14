import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workouts, patients, workoutExercises, exercises } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { createWorkoutSchema } from "@/lib/validation";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const user = await requireRole(["patient"]);

    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const result = await db
      .select({
        id: workouts.id,
        name: workouts.name,
        description: workouts.description,
        patientId: workouts.patientId,
        assignedByProfessionalId: workouts.assignedByProfessionalId,
        createdAt: workouts.createdAt,
        updatedAt: workouts.updatedAt,
        exerciseCount: sql<number>`cast(count(${workoutExercises.id}) as int)`,
      })
      .from(workouts)
      .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
      .where(eq(workouts.patientId, patient.id))
      .groupBy(workouts.id)
      .orderBy(workouts.createdAt);

    return NextResponse.json({ workouts: result });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching workouts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["patient"]);

    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const body = await request.json();
    const result = createWorkoutSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.issues },
        { status: 400 }
      );
    }

    const workout = await db.transaction(async (tx) => {
      const [newWorkout] = await tx
        .insert(workouts)
        .values({
          name: result.data.name,
          description: result.data.description,
          patientId: patient.id,
          assignedByProfessionalId: null,
        })
        .returning();

      const exerciseEntries = result.data.exerciseIds.map((exerciseId, index) => ({
        workoutId: newWorkout.id,
        exerciseId,
        orderIndex: index,
      }));

      await tx.insert(workoutExercises).values(exerciseEntries);

      return newWorkout;
    });

    return NextResponse.json({ workout }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error creating workout:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

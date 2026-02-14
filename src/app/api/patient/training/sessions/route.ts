import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trainingSessions, patients, muscleGroups, sessionExercises } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { createTrainingSessionSchema } from "@/lib/validation";
import { eq, sql, desc } from "drizzle-orm";

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
        id: trainingSessions.id,
        date: trainingSessions.date,
        notes: trainingSessions.notes,
        workoutId: trainingSessions.workoutId,
        muscleGroupId: trainingSessions.muscleGroupId,
        muscleGroupName: muscleGroups.name,
        exerciseCount: sql<number>`cast(count(${sessionExercises.id}) as int)`,
        createdAt: trainingSessions.createdAt,
      })
      .from(trainingSessions)
      .leftJoin(muscleGroups, eq(trainingSessions.muscleGroupId, muscleGroups.id))
      .leftJoin(sessionExercises, eq(sessionExercises.sessionId, trainingSessions.id))
      .where(eq(trainingSessions.patientId, patient.id))
      .groupBy(trainingSessions.id, muscleGroups.name)
      .orderBy(desc(trainingSessions.date));

    return NextResponse.json({ sessions: result });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching sessions:", error);
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
    const result = createTrainingSessionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.issues },
        { status: 400 }
      );
    }

    const session = await db.transaction(async (tx) => {
      const [newSession] = await tx
        .insert(trainingSessions)
        .values({
          patientId: patient.id,
          workoutId: result.data.workoutId ?? null,
          muscleGroupId: result.data.muscleGroupId ?? null,
          date: result.data.date,
          notes: result.data.notes,
        })
        .returning();

      const exerciseEntries = result.data.exerciseIds.map((exerciseId, index) => ({
        sessionId: newSession.id,
        exerciseId,
        orderIndex: index,
      }));

      await tx.insert(sessionExercises).values(exerciseEntries);

      return newSession;
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error creating session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

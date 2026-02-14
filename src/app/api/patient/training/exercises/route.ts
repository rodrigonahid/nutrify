import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { exercises, patients, muscleGroups } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { createExerciseSchema } from "@/lib/validation";
import { eq, or } from "drizzle-orm";

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
        or(
          eq(exercises.patientId, patient.id),
          eq(exercises.professionalId, patient.professionalId)
        )
      )
      .orderBy(exercises.name);

    return NextResponse.json({ exercises: result });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching exercises:", error);
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
    const result = createExerciseSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.issues },
        { status: 400 }
      );
    }

    const [exercise] = await db
      .insert(exercises)
      .values({
        name: result.data.name,
        description: result.data.description,
        muscleGroupId: result.data.muscleGroupId ?? null,
        patientId: patient.id,
        professionalId: null,
      })
      .returning();

    return NextResponse.json({ exercise }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error creating exercise:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

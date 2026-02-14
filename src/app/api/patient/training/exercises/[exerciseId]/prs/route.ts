import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { exercisePrs, exercises, patients } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { createPrSchema } from "@/lib/validation";
import { eq, and, asc, or } from "drizzle-orm";

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

    // Verify exercise access
    const [exercise] = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, parseInt(exerciseId)))
      .limit(1);

    if (
      !exercise ||
      (exercise.patientId !== patient.id &&
        exercise.professionalId !== patient.professionalId)
    ) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    const prs = await db
      .select()
      .from(exercisePrs)
      .where(
        and(
          eq(exercisePrs.exerciseId, parseInt(exerciseId)),
          eq(exercisePrs.patientId, patient.id)
        )
      )
      .orderBy(asc(exercisePrs.date));

    return NextResponse.json({ prs });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching PRs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
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

    const body = await request.json();
    const result = createPrSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.issues },
        { status: 400 }
      );
    }

    const [pr] = await db
      .insert(exercisePrs)
      .values({
        exerciseId: parseInt(exerciseId),
        patientId: patient.id,
        weightKg: result.data.weightKg.toString(),
        reps: result.data.reps,
        date: result.data.date,
        notes: result.data.notes,
      })
      .returning();

    return NextResponse.json({ pr }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error creating PR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

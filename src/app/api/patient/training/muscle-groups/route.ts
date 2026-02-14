import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { muscleGroups, patients } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { createMuscleGroupSchema } from "@/lib/validation";
import { eq, or, isNull } from "drizzle-orm";

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

    const groups = await db
      .select()
      .from(muscleGroups)
      .where(
        or(
          eq(muscleGroups.isDefault, true),
          eq(muscleGroups.patientId, patient.id)
        )
      )
      .orderBy(muscleGroups.isDefault, muscleGroups.name);

    return NextResponse.json({ muscleGroups: groups });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching muscle groups:", error);
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
    const result = createMuscleGroupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.issues },
        { status: 400 }
      );
    }

    const [group] = await db
      .insert(muscleGroups)
      .values({ name: result.data.name, isDefault: false, patientId: patient.id })
      .returning();

    return NextResponse.json({ muscleGroup: group }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error creating muscle group:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

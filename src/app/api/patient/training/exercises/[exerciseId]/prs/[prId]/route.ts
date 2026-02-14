import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { exercisePrs, patients } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ exerciseId: string; prId: string }> }
) {
  try {
    const user = await requireRole(["patient"]);
    const { prId } = await params;

    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const [pr] = await db
      .select()
      .from(exercisePrs)
      .where(
        and(
          eq(exercisePrs.id, parseInt(prId)),
          eq(exercisePrs.patientId, patient.id)
        )
      )
      .limit(1);

    if (!pr) {
      return NextResponse.json({ error: "PR not found" }, { status: 404 });
    }

    await db.delete(exercisePrs).where(eq(exercisePrs.id, parseInt(prId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error deleting PR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

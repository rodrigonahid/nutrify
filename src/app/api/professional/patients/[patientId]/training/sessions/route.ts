import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { trainingSessions, patients, professionals, sessionExercises } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, and, sql, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { patientId } = await params;

    const [professional] = await db
      .select()
      .from(professionals)
      .where(eq(professionals.userId, user.id))
      .limit(1);

    if (!professional) {
      return NextResponse.json(
        { error: "Professional not found" },
        { status: 404 }
      );
    }

    // Verify patient belongs to this professional
    const [patient] = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.id, parseInt(patientId)),
          eq(patients.professionalId, professional.id)
        )
      )
      .limit(1);

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found or access denied" },
        { status: 404 }
      );
    }

    const result = await db
      .select({
        id: trainingSessions.id,
        date: trainingSessions.date,
        notes: trainingSessions.notes,
        workoutId: trainingSessions.workoutId,
        exerciseCount: sql<number>`cast(count(${sessionExercises.id}) as int)`,
        createdAt: trainingSessions.createdAt,
      })
      .from(trainingSessions)
      .leftJoin(sessionExercises, eq(sessionExercises.sessionId, trainingSessions.id))
      .where(eq(trainingSessions.patientId, patient.id))
      .groupBy(trainingSessions.id)
      .orderBy(desc(trainingSessions.date));

    return NextResponse.json({ sessions: result });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching patient sessions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

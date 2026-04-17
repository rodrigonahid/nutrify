import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients, progress, progressImages } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ progressId: string }> }
) {
  try {
    const user = await requireRole(["patient"]);
    const { progressId } = await params;

    const [patient] = await db
      .select({ id: patients.id })
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);
    if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [entry] = await db
      .select({ id: progress.id })
      .from(progress)
      .where(and(eq(progress.id, Number(progressId)), eq(progress.patientId, patient.id)))
      .limit(1);
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const images = await db
      .select()
      .from(progressImages)
      .where(eq(progressImages.progressId, entry.id))
      .orderBy(progressImages.createdAt);

    return NextResponse.json({ images });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (error instanceof Error && error.message === "Forbidden")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients, professionals, progress, progressImages } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ patientId: string; progressId: string; imageId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { patientId, progressId, imageId } = await params;

    const [professional] = await db
      .select({ id: professionals.id })
      .from(professionals)
      .where(eq(professionals.userId, user.id))
      .limit(1);
    if (!professional) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [patient] = await db
      .select({ id: patients.id })
      .from(patients)
      .where(and(eq(patients.id, Number(patientId)), eq(patients.professionalId, professional.id)))
      .limit(1);
    if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [entry] = await db
      .select({ id: progress.id })
      .from(progress)
      .where(and(eq(progress.id, Number(progressId)), eq(progress.patientId, patient.id)))
      .limit(1);
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db
      .delete(progressImages)
      .where(and(eq(progressImages.id, Number(imageId)), eq(progressImages.progressId, entry.id)));

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (error instanceof Error && error.message === "Forbidden")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

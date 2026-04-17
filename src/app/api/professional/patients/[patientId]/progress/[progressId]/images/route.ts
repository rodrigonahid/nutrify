import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients, professionals, progress, progressImages } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, and } from "drizzle-orm";
import { uploadFile } from "@/lib/storage";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

async function resolveAccess(userId: number, patientId: number, progressId: number) {
  const [professional] = await db
    .select({ id: professionals.id })
    .from(professionals)
    .where(eq(professionals.userId, userId))
    .limit(1);
  if (!professional) return null;

  const [patient] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(and(eq(patients.id, patientId), eq(patients.professionalId, professional.id)))
    .limit(1);
  if (!patient) return null;

  const [entry] = await db
    .select({ id: progress.id })
    .from(progress)
    .where(and(eq(progress.id, progressId), eq(progress.patientId, patient.id)))
    .limit(1);
  if (!entry) return null;

  return entry;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ patientId: string; progressId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { patientId, progressId } = await params;

    const entry = await resolveAccess(user.id, Number(patientId), Number(progressId));
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string; progressId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { patientId, progressId } = await params;

    const entry = await resolveAccess(user.id, Number(patientId), Number(progressId));
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ error: "Formato inválido. Use JPG, PNG ou WebP." }, { status: 400 });
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 10 MB." }, { status: 400 });

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `progress/${entry.id}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadFile(buffer, path, file.type);

    const [image] = await db
      .insert(progressImages)
      .values({ progressId: entry.id, url })
      .returning();

    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (error instanceof Error && error.message === "Forbidden")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("Progress image upload error:", error);
    return NextResponse.json({ error: "Falha ao enviar imagem" }, { status: 500 });
  }
}

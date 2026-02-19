import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { professionals } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq } from "drizzle-orm";
import { uploadFile } from "@/lib/storage";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["professional"]);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato inválido. Use JPG, PNG, WebP ou SVG." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 2 MB." },
        { status: 400 }
      );
    }

    const [professional] = await db
      .select({ id: professionals.id })
      .from(professionals)
      .where(eq(professionals.userId, user.id))
      .limit(1);

    if (!professional) {
      return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
    }

    const ext = file.name.split(".").pop() ?? "png";
    const path = `logos/${professional.id}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const url = await uploadFile(buffer, path, file.type);

    await db
      .update(professionals)
      .set({ logoUrl: url, updatedAt: new Date() })
      .where(eq(professionals.id, professional.id));

    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Logo upload error:", error);
    return NextResponse.json({ error: "Falha ao enviar logotipo" }, { status: 500 });
  }
}

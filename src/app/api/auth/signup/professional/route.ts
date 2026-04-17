import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, professionals } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { professionalSignupSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`signup-professional:${ip}`, 5, 60 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const body = await request.json();

    const validation = professionalSignupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: validation.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { name, email, password, crn } = validation.data;

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const result = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ email, passwordHash, role: "professional" })
        .returning();

      const [professional] = await tx
        .insert(professionals)
        .values({
          userId: user.id,
          name,
          professionalLicense: crn && crn.trim() !== "" ? crn.trim() : null,
        })
        .returning();

      return { user, professional };
    });

    await createSession(result.user.id);

    return NextResponse.json(
      {
        message: "Conta criada com sucesso",
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Professional signup error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

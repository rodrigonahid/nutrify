import { NextResponse } from "next/server";
import { db } from "@/db";
import { professionals, users, patients } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, sql } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { createUserSchema } from "@/lib/validation";

/**
 * GET /api/admin/professionals
 * List all professionals with patient counts
 */
export async function GET() {
  try {
    await requireRole(["admin"]);

    const results = await db
      .select({
        id: professionals.id,
        userId: professionals.userId,
        professionalLicense: professionals.professionalLicense,
        specialization: professionals.specialization,
        bio: professionals.bio,
        createdAt: professionals.createdAt,
        user: {
          id: users.id,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
        },
        patientCount: sql<number>`count(${patients.id})::int`,
      })
      .from(professionals)
      .innerJoin(users, eq(professionals.userId, users.id))
      .leftJoin(patients, eq(patients.professionalId, professionals.id))
      .groupBy(professionals.id, users.id);

    return NextResponse.json({ professionals: results });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching professionals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/professionals
 * Create a new professional account
 */
export async function POST(request: Request) {
  try {
    await requireRole(["admin"]);

    const body = await request.json();

    // Validate user data
    const userValidation = createUserSchema.safeParse({
      email: body.email,
      password: body.password,
      role: "professional",
    });

    if (!userValidation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: userValidation.error.errors },
        { status: 400 }
      );
    }

    const { email, password } = userValidation.data;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user and professional in a transaction
    const result = await db.transaction(async (tx) => {
      // Create user
      const [user] = await tx
        .insert(users)
        .values({
          email,
          passwordHash,
          role: "professional",
        })
        .returning();

      // Create professional profile
      const [professional] = await tx
        .insert(professionals)
        .values({
          userId: user.id,
          professionalLicense: body.professionalLicense || null,
          specialization: body.specialization || null,
          bio: body.bio || null,
        })
        .returning();

      return { user, professional };
    });

    return NextResponse.json(
      {
        message: "Professional created successfully",
        professional: {
          ...result.professional,
          user: result.user,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error creating professional:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

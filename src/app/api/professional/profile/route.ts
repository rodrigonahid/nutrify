import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { professionals, users } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq } from "drizzle-orm";

/**
 * GET /api/professional/profile
 * Get the logged-in professional's own profile
 */
export async function GET() {
  try {
    const user = await requireRole(["professional"]);

    const [profile] = await db
      .select({
        id: professionals.id,
        name: professionals.name,
        phone: professionals.phone,
        professionalLicense: professionals.professionalLicense,
        specialization: professionals.specialization,
        bio: professionals.bio,
        email: users.email,
        createdAt: professionals.createdAt,
        updatedAt: professionals.updatedAt,
      })
      .from(professionals)
      .innerJoin(users, eq(professionals.userId, users.id))
      .where(eq(professionals.userId, user.id))
      .limit(1);

    if (!profile) {
      return NextResponse.json(
        { error: "Professional profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching professional profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/professional/profile
 * Update the logged-in professional's own profile
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await requireRole(["professional"]);

    const [professional] = await db
      .select({ id: professionals.id })
      .from(professionals)
      .where(eq(professionals.userId, user.id))
      .limit(1);

    if (!professional) {
      return NextResponse.json(
        { error: "Professional profile not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, phone, professionalLicense, specialization, bio } = body;

    const [updated] = await db
      .update(professionals)
      .set({
        name: name ?? null,
        phone: phone ?? null,
        professionalLicense: professionalLicense ?? null,
        specialization: specialization ?? null,
        bio: bio ?? null,
        updatedAt: new Date(),
      })
      .where(eq(professionals.id, professional.id))
      .returning();

    return NextResponse.json({ profile: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error updating professional profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

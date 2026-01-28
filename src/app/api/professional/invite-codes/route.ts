import { NextResponse } from "next/server";
import { db } from "@/db";
import { inviteCodes, professionals, patients, users } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq } from "drizzle-orm";
import { randomInt } from "crypto";

/**
 * Generate a unique 8-digit invite code
 */
function generateInviteCode(): string {
  // Generate number between 10000000 and 99999999 (8 digits)
  return randomInt(10000000, 100000000).toString();
}

/**
 * GET /api/professional/invite-codes
 * List all invite codes for the current professional
 */
export async function GET() {
  try {
    const user = await requireRole(["professional"]);

    // Get the professional ID
    const [professional] = await db
      .select()
      .from(professionals)
      .where(eq(professionals.userId, user.id))
      .limit(1);

    if (!professional) {
      return NextResponse.json(
        { error: "Professional profile not found" },
        { status: 404 }
      );
    }

    // Get all invite codes with usage info
    const codes = await db
      .select({
        id: inviteCodes.id,
        code: inviteCodes.code,
        used: inviteCodes.used,
        usedBy: inviteCodes.usedBy,
        expiresAt: inviteCodes.expiresAt,
        createdAt: inviteCodes.createdAt,
        patientEmail: users.email,
      })
      .from(inviteCodes)
      .leftJoin(patients, eq(inviteCodes.usedBy, patients.id))
      .leftJoin(users, eq(patients.userId, users.id))
      .where(eq(inviteCodes.professionalId, professional.id))
      .orderBy(inviteCodes.createdAt);

    return NextResponse.json({ inviteCodes: codes });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching invite codes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/professional/invite-codes
 * Generate a new invite code
 */
export async function POST(request: Request) {
  try {
    const user = await requireRole(["professional"]);

    // Get the professional ID
    const [professional] = await db
      .select()
      .from(professionals)
      .where(eq(professionals.userId, user.id))
      .limit(1);

    if (!professional) {
      return NextResponse.json(
        { error: "Professional profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const expiresInDays = body.expiresInDays || 30; // Default 30 days

    // Generate unique 8-digit code
    let code: string;
    let isUnique = false;

    // Ensure uniqueness
    while (!isUnique) {
      code = generateInviteCode();
      const existing = await db
        .select()
        .from(inviteCodes)
        .where(eq(inviteCodes.code, code))
        .limit(1);

      if (existing.length === 0) {
        isUnique = true;
      }
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Create invite code
    const [inviteCode] = await db
      .insert(inviteCodes)
      .values({
        code: code!,
        professionalId: professional.id,
        used: false,
        expiresAt,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Invite code generated successfully",
        inviteCode,
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
    console.error("Error generating invite code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

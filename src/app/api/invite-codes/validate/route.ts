import { NextResponse } from "next/server";
import { db } from "@/db";
import { inviteCodes, professionals, users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/invite-codes/validate?code={code}
 * Validate an invite code
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    // Validate format: must be 8 digits
    if (!/^\d{8}$/.test(code)) {
      return NextResponse.json(
        { valid: false, error: "Invalid code format. Code must be 8 digits." },
        { status: 400 }
      );
    }

    // Find the invite code with professional info
    const [inviteCode] = await db
      .select({
        id: inviteCodes.id,
        code: inviteCodes.code,
        used: inviteCodes.used,
        expiresAt: inviteCodes.expiresAt,
        professionalId: inviteCodes.professionalId,
        professionalEmail: users.email,
        specialization: professionals.specialization,
      })
      .from(inviteCodes)
      .innerJoin(professionals, eq(inviteCodes.professionalId, professionals.id))
      .innerJoin(users, eq(professionals.userId, users.id))
      .where(eq(inviteCodes.code, code))
      .limit(1);

    if (!inviteCode) {
      return NextResponse.json(
        { valid: false, error: "Invalid invite code" },
        { status: 404 }
      );
    }

    // Check if already used
    if (inviteCode.used) {
      return NextResponse.json(
        { valid: false, error: "This invite code has already been used" },
        { status: 400 }
      );
    }

    // Check if expired
    if (inviteCode.expiresAt && new Date(inviteCode.expiresAt) < new Date()) {
      return NextResponse.json(
        { valid: false, error: "This invite code has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      professional: {
        email: inviteCode.professionalEmail,
        specialization: inviteCode.specialization,
      },
    });
  } catch (error) {
    console.error("Error validating invite code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

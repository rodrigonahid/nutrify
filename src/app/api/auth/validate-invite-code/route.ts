import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inviteCodes } from "@/db/schema";
import { validateInviteCodeSchema } from "@/lib/validation";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/auth/validate-invite-code
 * Validate an invite code and return the patient name
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validationResult = validateInviteCodeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { inviteCode } = validationResult.data;

    // Check if the invite code exists and is not used
    const [code] = await db
      .select()
      .from(inviteCodes)
      .where(and(eq(inviteCodes.code, inviteCode), eq(inviteCodes.used, false)))
      .limit(1);

    if (!code) {
      return NextResponse.json(
        { error: "Invalid or already used invite code" },
        { status: 404 }
      );
    }

    // Check if expired
    if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This invite code has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      patientName: code.patientName,
    });
  } catch (error) {
    console.error("Error validating invite code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, patients, inviteCodes, professionals } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { emailSchema, passwordSchema } from "@/lib/validation";

const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  inviteCode: z.string().regex(/^\d{8}$/, "Invite code must be 8 digits"),
  dateOfBirth: z.string().optional(),
});

/**
 * POST /api/auth/signup
 * Patient signup with invite code
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error },
        { status: 400 }
      );
    }

    const { email, password, inviteCode: code, dateOfBirth } = validation.data;

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

    // Validate invite code
    const [inviteCodeData] = await db
      .select()
      .from(inviteCodes)
      .innerJoin(professionals, eq(inviteCodes.professionalId, professionals.id))
      .where(eq(inviteCodes.code, code))
      .limit(1);

    if (!inviteCodeData) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 400 }
      );
    }

    // Check if already used
    if (inviteCodeData.invite_codes.used) {
      return NextResponse.json(
        { error: "This invite code has already been used" },
        { status: 400 }
      );
    }

    // Check if expired
    if (
      inviteCodeData.invite_codes.expiresAt &&
      new Date(inviteCodeData.invite_codes.expiresAt) < new Date()
    ) {
      return NextResponse.json(
        { error: "This invite code has expired" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user and patient in a transaction
    const result = await db.transaction(async (tx) => {
      // Create user
      const [user] = await tx
        .insert(users)
        .values({
          email,
          passwordHash,
          role: "patient",
        })
        .returning();

      // Create patient profile
      const [patient] = await tx
        .insert(patients)
        .values({
          userId: user.id,
          professionalId: inviteCodeData.professionals.id,
          dateOfBirth: dateOfBirth || null,
        })
        .returning();

      // Mark invite code as used
      await tx
        .update(inviteCodes)
        .set({
          used: true,
          usedBy: patient.id,
        })
        .where(eq(inviteCodes.id, inviteCodeData.invite_codes.id));

      return { user, patient };
    });

    // Create session
    await createSession(result.user.id);

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during signup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

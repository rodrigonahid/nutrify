import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, patients, inviteCodes, professionals } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { eq } from "drizzle-orm";
import { signupSchema } from "@/lib/validation";

/**
 * POST /api/auth/signup
 * Patient signup with invite code
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📝 Signup request body:", JSON.stringify(body, null, 2));

    // Validate input
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      console.error("❌ Validation failed:", JSON.stringify(validation.error.issues, null, 2));
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const { email, password, inviteCode: code, name, dateOfBirth } = validation.data;
    console.log("✅ Validation passed");
    console.log("📧 Email:", email);
    console.log("👤 Name:", name);
    console.log("📅 Date of Birth:", dateOfBirth || "Not provided");
    console.log("🎫 Invite Code:", code);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      console.error("❌ User already exists with email:", email);
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
      console.error("❌ Invalid invite code:", code);
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 400 }
      );
    }

    console.log("✅ Invite code valid");

    // Check if already used
    if (inviteCodeData.invite_codes.used) {
      console.error("❌ Invite code already used:", code);
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
      console.error("❌ Invite code expired:", code);
      return NextResponse.json(
        { error: "This invite code has expired" },
        { status: 400 }
      );
    }

    // Hash password
    console.log("🔐 Hashing password...");
    const passwordHash = await hashPassword(password);

    // Create user and patient in a transaction
    console.log("💾 Creating user and patient in database...");
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

      console.log("✅ User created with ID:", user.id);

      // Create patient profile
      const dobValue = dateOfBirth && dateOfBirth.trim() !== "" ? dateOfBirth : null;
      console.log("📅 Inserting date of birth:", dobValue);

      const [patient] = await tx
        .insert(patients)
        .values({
          userId: user.id,
          professionalId: inviteCodeData.professionals.id,
          name: name,
          dateOfBirth: dobValue,
        })
        .returning();

      console.log("✅ Patient profile created with ID:", patient.id);

      // Mark invite code as used
      await tx
        .update(inviteCodes)
        .set({
          used: true,
          usedBy: patient.id,
        })
        .where(eq(inviteCodes.id, inviteCodeData.invite_codes.id));

      console.log("✅ Invite code marked as used");

      return { user, patient };
    });

    // Create session
    console.log("🍪 Creating session...");
    await createSession(result.user.id);

    console.log("✅ Signup completed successfully for:", email);
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

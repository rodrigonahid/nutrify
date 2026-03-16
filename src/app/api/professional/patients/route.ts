import { NextResponse } from "next/server";
import { db } from "@/db";
import { patients, professionals, users, inviteCodes } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/professional/patients
 * List all patients for the current professional
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

    // Get all patients for this professional
    const patientsList = await db
      .select({
        id: patients.id,
        userId: patients.userId,
        dateOfBirth: patients.dateOfBirth,
        height: patients.height,
        weight: patients.weight,
        medicalNotes: patients.medicalNotes,
        createdAt: patients.createdAt,
        email: users.email,
        userCreatedAt: users.createdAt,
        name: patients.name,
      })
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .where(eq(patients.professionalId, professional.id))
      .orderBy(patients.createdAt);

    // Get pending invites (unused, not expired) for this professional
    const now = new Date();
    const pendingInvites = await db
      .select({
        id: inviteCodes.id,
        code: inviteCodes.code,
        patientName: inviteCodes.patientName,
        expiresAt: inviteCodes.expiresAt,
        createdAt: inviteCodes.createdAt,
      })
      .from(inviteCodes)
      .where(
        and(
          eq(inviteCodes.professionalId, professional.id),
          eq(inviteCodes.used, false)
        )
      )
      .orderBy(inviteCodes.createdAt);

    // Filter out expired invites in JS (simpler than SQL null-safe comparison)
    const activePendingInvites = pendingInvites.filter(
      (inv) => !inv.expiresAt || new Date(inv.expiresAt) > now
    );

    return NextResponse.json({ patients: patientsList, pendingInvites: activePendingInvites });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

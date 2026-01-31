import { NextResponse } from "next/server";
import { db } from "@/db";
import { patients, professionals, users } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq } from "drizzle-orm";

/**
 * GET /api/patient/nutritionist
 * Get the nutritionist assigned to the logged-in patient
 */
export async function GET() {
  try {
    const user = await requireRole(["patient"]);

    // Get the patient record
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    // Get the nutritionist/professional info
    const [nutritionist] = await db
      .select({
        id: professionals.id,
        professionalLicense: professionals.professionalLicense,
        specialization: professionals.specialization,
        bio: professionals.bio,
        email: users.email,
        createdAt: professionals.createdAt,
      })
      .from(professionals)
      .innerJoin(users, eq(professionals.userId, users.id))
      .where(eq(professionals.id, patient.professionalId))
      .limit(1);

    if (!nutritionist) {
      return NextResponse.json(
        { error: "Nutritionist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ nutritionist });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching nutritionist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

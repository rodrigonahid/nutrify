import { NextResponse } from "next/server";
import { db } from "@/db";
import { patients, patientPlans } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq } from "drizzle-orm";

/**
 * GET /api/patient/nutritionist/plan
 * Get the billing plan for the logged-in patient
 */
export async function GET() {
  try {
    const user = await requireRole(["patient"]);

    const [patient] = await db
      .select({ id: patients.id })
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    const [plan] = await db
      .select()
      .from(patientPlans)
      .where(eq(patientPlans.patientId, patient.id))
      .limit(1);

    return NextResponse.json({ plan: plan ?? null });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching patient plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

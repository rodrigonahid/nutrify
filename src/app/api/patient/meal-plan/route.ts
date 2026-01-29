import { NextResponse } from "next/server";
import { db } from "@/db";
import { patients, mealPlans, meals, users, professionals } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, sql } from "drizzle-orm";

/**
 * GET /api/patient/meal-plan
 * List all meal plans for the logged-in patient
 */
export async function GET() {
  try {
    const user = await requireRole(["patient"]);

    // Get the patient ID
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

    // Get all meal plans for this patient with meal count and professional info
    const mealPlansList = await db
      .select({
        id: mealPlans.id,
        name: mealPlans.name,
        isActive: mealPlans.isActive,
        createdAt: mealPlans.createdAt,
        mealCount: sql<number>`count(distinct ${meals.id})`,
        professionalEmail: users.email,
      })
      .from(mealPlans)
      .leftJoin(meals, eq(meals.mealPlanId, mealPlans.id))
      .leftJoin(
        professionals,
        eq(professionals.id, mealPlans.professionalId)
      )
      .leftJoin(users, eq(users.id, professionals.userId))
      .where(eq(mealPlans.patientId, patient.id))
      .groupBy(mealPlans.id, users.email)
      .orderBy(sql`${mealPlans.createdAt} desc`);

    return NextResponse.json({ mealPlans: mealPlansList });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching meal plans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

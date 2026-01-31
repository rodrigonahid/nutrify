import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  patients,
  professionals,
  mealPlans,
  meals,
  mealOptions,
  mealIngredients,
} from "@/db/schema";
import { requireRole } from "@/lib/session";
import { mealPlanSchema } from "@/lib/validation";
import { eq, and, sql } from "drizzle-orm";

/**
 * GET /api/professional/patients/[patientId]/meal-plan
 * List all meal plans for a patient
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { patientId } = await params;

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

    // Verify the patient belongs to this professional
    const [patient] = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.id, parseInt(patientId)),
          eq(patients.professionalId, professional.id)
        )
      )
      .limit(1);

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found or access denied" },
        { status: 404 }
      );
    }

    // Get all meal plans for this patient with meal count
    const mealPlansList = await db
      .select({
        id: mealPlans.id,
        name: mealPlans.name,
        isActive: mealPlans.isActive,
        createdAt: mealPlans.createdAt,
        mealCount: sql<number>`count(distinct ${meals.id})`,
      })
      .from(mealPlans)
      .leftJoin(meals, eq(meals.mealPlanId, mealPlans.id))
      .where(eq(mealPlans.patientId, patient.id))
      .groupBy(mealPlans.id)
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

/**
 * POST /api/professional/patients/[patientId]/meal-plan
 * Create a new meal plan with nested meals, options, and ingredients
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { patientId } = await params;
    const body = await request.json();

    // Validate the request body
    const validationResult = mealPlanSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

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

    // Verify the patient belongs to this professional
    const [patient] = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.id, parseInt(patientId)),
          eq(patients.professionalId, professional.id)
        )
      )
      .limit(1);

    if (!patient) {
      return NextResponse.json(
        { error: "Patient not found or access denied" },
        { status: 404 }
      );
    }

    const data = validationResult.data;

    // If isActive is true, deactivate all other meal plans
    if (data.isActive) {
      await db
        .update(mealPlans)
        .set({ isActive: false })
        .where(
          and(eq(mealPlans.patientId, patient.id), eq(mealPlans.isActive, true))
        );
    }

    // Create meal plan with all nested data in a transaction
    const result = await db.transaction(async (tx) => {
      // Create meal plan
      const [newMealPlan] = await tx
        .insert(mealPlans)
        .values({
          patientId: patient.id,
          professionalId: professional.id,
          name: data.name,
          isActive: data.isActive,
        })
        .returning();

      // Create meals with options and ingredients
      for (const mealData of data.meals) {
        const [newMeal] = await tx
          .insert(meals)
          .values({
            mealPlanId: newMealPlan.id,
            timeOfDay: mealData.timeOfDay,
            orderIndex: mealData.orderIndex,
          })
          .returning();

        // Create meal options
        for (const optionData of mealData.options) {
          const [newOption] = await tx
            .insert(mealOptions)
            .values({
              mealId: newMeal.id,
              name: optionData.name,
              notes: optionData.notes || null,
            })
            .returning();

          // Create ingredients
          const ingredientValues = optionData.ingredients.map((ing) => ({
            mealOptionId: newOption.id,
            ingredientName: ing.ingredientName,
            quantity: ing.quantity.toString(),
            unit: ing.unit ?? "g",
            orderIndex: ing.orderIndex,
          }));

          await tx.insert(mealIngredients).values(ingredientValues);
        }
      }

      return newMealPlan;
    });

    return NextResponse.json({ mealPlan: result }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error creating meal plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

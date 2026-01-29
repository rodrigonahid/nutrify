import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  patients,
  mealPlans,
  meals,
  mealOptions,
  mealIngredients,
} from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/patient/meal-plan/[mealPlanId]
 * Get full meal plan details (read-only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mealPlanId: string }> }
) {
  try {
    const user = await requireRole(["patient"]);
    const { mealPlanId } = await params;

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

    // Get the meal plan (verify it belongs to this patient)
    const [mealPlan] = await db
      .select()
      .from(mealPlans)
      .where(
        and(
          eq(mealPlans.id, parseInt(mealPlanId)),
          eq(mealPlans.patientId, patient.id)
        )
      )
      .limit(1);

    if (!mealPlan) {
      return NextResponse.json(
        { error: "Meal plan not found" },
        { status: 404 }
      );
    }

    // Get all meals for this plan
    const mealsList = await db
      .select()
      .from(meals)
      .where(eq(meals.mealPlanId, mealPlan.id))
      .orderBy(meals.orderIndex);

    // Get options and ingredients for each meal
    const mealsWithDetails = await Promise.all(
      mealsList.map(async (meal) => {
        const optionsList = await db
          .select()
          .from(mealOptions)
          .where(eq(mealOptions.mealId, meal.id));

        const optionsWithIngredients = await Promise.all(
          optionsList.map(async (option) => {
            const ingredientsList = await db
              .select()
              .from(mealIngredients)
              .where(eq(mealIngredients.mealOptionId, option.id))
              .orderBy(mealIngredients.orderIndex);

            return {
              ...option,
              ingredients: ingredientsList,
            };
          })
        );

        return {
          ...meal,
          options: optionsWithIngredients,
        };
      })
    );

    return NextResponse.json({
      mealPlan: {
        ...mealPlan,
        meals: mealsWithDetails,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching meal plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

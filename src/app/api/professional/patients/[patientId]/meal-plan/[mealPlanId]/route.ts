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
import { eq, and, desc } from "drizzle-orm";

/**
 * GET /api/professional/patients/[patientId]/meal-plan/[mealPlanId]
 * Get full meal plan with all nested data
 */
export async function GET(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ patientId: string; mealPlanId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { patientId, mealPlanId } = await params;

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

    // Get the meal plan
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

/**
 * PUT /api/professional/patients/[patientId]/meal-plan/[mealPlanId]
 * Update meal plan (recreates all nested data)
 */
export async function PUT(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ patientId: string; mealPlanId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { patientId, mealPlanId } = await params;
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

    // Verify the meal plan exists and belongs to this patient
    const [existingPlan] = await db
      .select()
      .from(mealPlans)
      .where(
        and(
          eq(mealPlans.id, parseInt(mealPlanId)),
          eq(mealPlans.patientId, patient.id)
        )
      )
      .limit(1);

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Meal plan not found" },
        { status: 404 }
      );
    }

    const data = validationResult.data;

    // If isActive is true and plan wasn't active before, deactivate all other meal plans
    if (data.isActive && !existingPlan.isActive) {
      await db
        .update(mealPlans)
        .set({ isActive: false })
        .where(
          and(
            eq(mealPlans.patientId, patient.id),
            eq(mealPlans.isActive, true)
          )
        );
    }

    // Update meal plan and recreate all nested data in a transaction
    const result = await db.transaction(async (tx) => {
      // Update meal plan
      const [updatedMealPlan] = await tx
        .update(mealPlans)
        .set({
          name: data.name,
          isActive: data.isActive,
          updatedAt: new Date(),
        })
        .where(eq(mealPlans.id, parseInt(mealPlanId)))
        .returning();

      // Delete existing meals (cascade will delete options and ingredients)
      await tx.delete(meals).where(eq(meals.mealPlanId, updatedMealPlan.id));

      // Create new meals with options and ingredients
      for (const mealData of data.meals) {
        const [newMeal] = await tx
          .insert(meals)
          .values({
            mealPlanId: updatedMealPlan.id,
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

      return updatedMealPlan;
    });

    return NextResponse.json({ mealPlan: result });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error updating meal plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/professional/patients/[patientId]/meal-plan/[mealPlanId]
 * Delete a meal plan
 */
export async function DELETE(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ patientId: string; mealPlanId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { patientId, mealPlanId } = await params;

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

    // Delete the meal plan (cascade will delete meals, options, and ingredients)
    const result = await db
      .delete(mealPlans)
      .where(
        and(
          eq(mealPlans.id, parseInt(mealPlanId)),
          eq(mealPlans.patientId, patient.id)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Meal plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error deleting meal plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/professional/patients/[patientId]/meal-plan/[mealPlanId]
 * Toggle active status of a meal plan
 */
export async function PATCH(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ patientId: string; mealPlanId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { patientId, mealPlanId } = await params;
    const body = await request.json();

    if (typeof body.isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
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

    // If activating, deactivate all other meal plans first
    if (body.isActive) {
      await db
        .update(mealPlans)
        .set({ isActive: false })
        .where(
          and(
            eq(mealPlans.patientId, patient.id),
            eq(mealPlans.isActive, true)
          )
        );
    }

    // Update the target meal plan
    const [updatedPlan] = await db
      .update(mealPlans)
      .set({ isActive: body.isActive, updatedAt: new Date() })
      .where(
        and(
          eq(mealPlans.id, parseInt(mealPlanId)),
          eq(mealPlans.patientId, patient.id)
        )
      )
      .returning();

    if (!updatedPlan) {
      return NextResponse.json(
        { error: "Meal plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ mealPlan: updatedPlan });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error updating meal plan status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

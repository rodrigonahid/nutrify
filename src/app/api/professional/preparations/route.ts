import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { professionals, preparations, preparationIngredients } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { preparationSchema } from "@/lib/validation";
import { eq, sql } from "drizzle-orm";

/**
 * GET /api/professional/preparations
 * List all preparations owned by the current professional
 */
export async function GET() {
  try {
    const user = await requireRole(["professional"]);

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

    const list = await db
      .select({
        id: preparations.id,
        name: preparations.name,
        category: preparations.category,
        createdAt: preparations.createdAt,
        ingredientCount: sql<number>`count(${preparationIngredients.id})`,
      })
      .from(preparations)
      .leftJoin(
        preparationIngredients,
        eq(preparationIngredients.preparationId, preparations.id)
      )
      .where(eq(preparations.professionalId, professional.id))
      .groupBy(preparations.id)
      .orderBy(sql`${preparations.createdAt} desc`);

    return NextResponse.json({ preparations: list });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching preparations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/professional/preparations
 * Create a new preparation with ingredients
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["professional"]);
    const body = await request.json();

    const validationResult = preparationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

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

    const data = validationResult.data;

    const result = await db.transaction(async (tx) => {
      const [newPreparation] = await tx
        .insert(preparations)
        .values({
          professionalId: professional.id,
          name: data.name,
          category: data.category,
          description: data.description || null,
          preparationMethod: data.preparationMethod || null,
        })
        .returning();

      if (data.ingredients.length > 0) {
        await tx.insert(preparationIngredients).values(
          data.ingredients.map((ing, idx) => ({
            preparationId: newPreparation.id,
            name: ing.name,
            unit: ing.unit,
            orderIndex: ing.orderIndex ?? idx,
          }))
        );
      }

      return newPreparation;
    });

    return NextResponse.json({ preparation: result }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error creating preparation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

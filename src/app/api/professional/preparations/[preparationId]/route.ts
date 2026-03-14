import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { professionals, preparations, preparationIngredients } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { preparationSchema } from "@/lib/validation";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/professional/preparations/[preparationId]
 * Get a single preparation with all ingredients
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ preparationId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { preparationId } = await params;

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

    const [preparation] = await db
      .select()
      .from(preparations)
      .where(
        and(
          eq(preparations.id, parseInt(preparationId)),
          eq(preparations.professionalId, professional.id)
        )
      )
      .limit(1);

    if (!preparation) {
      return NextResponse.json(
        { error: "Preparation not found" },
        { status: 404 }
      );
    }

    const ingredients = await db
      .select()
      .from(preparationIngredients)
      .where(eq(preparationIngredients.preparationId, preparation.id))
      .orderBy(preparationIngredients.orderIndex);

    return NextResponse.json({ preparation: { ...preparation, ingredients } });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error fetching preparation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/professional/preparations/[preparationId]
 * Update preparation (recreates ingredients)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ preparationId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { preparationId } = await params;
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

    const [existing] = await db
      .select()
      .from(preparations)
      .where(
        and(
          eq(preparations.id, parseInt(preparationId)),
          eq(preparations.professionalId, professional.id)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Preparation not found" },
        { status: 404 }
      );
    }

    const data = validationResult.data;

    const result = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(preparations)
        .set({
          name: data.name,
          category: data.category,
          description: data.description || null,
          preparationMethod: data.preparationMethod || null,
          updatedAt: new Date(),
        })
        .where(eq(preparations.id, parseInt(preparationId)))
        .returning();

      await tx
        .delete(preparationIngredients)
        .where(eq(preparationIngredients.preparationId, updated.id));

      if (data.ingredients.length > 0) {
        await tx.insert(preparationIngredients).values(
          data.ingredients.map((ing, idx) => ({
            preparationId: updated.id,
            name: ing.name,
            unit: ing.unit,
            orderIndex: ing.orderIndex ?? idx,
          }))
        );
      }

      return updated;
    });

    return NextResponse.json({ preparation: result });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error updating preparation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/professional/preparations/[preparationId]
 * Delete a preparation (cascade deletes ingredients)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ preparationId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { preparationId } = await params;

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

    const result = await db
      .delete(preparations)
      .where(
        and(
          eq(preparations.id, parseInt(preparationId)),
          eq(preparations.professionalId, professional.id)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Preparation not found" },
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
    console.error("Error deleting preparation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

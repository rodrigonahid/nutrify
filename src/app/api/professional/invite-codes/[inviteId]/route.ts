import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inviteCodes, professionals } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, and } from "drizzle-orm";

/**
 * DELETE /api/professional/invite-codes/[inviteId]
 * Cancel (delete) a pending invite code owned by the current professional
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { inviteId } = await params;

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
      .delete(inviteCodes)
      .where(
        and(
          eq(inviteCodes.id, parseInt(inviteId)),
          eq(inviteCodes.professionalId, professional.id),
          eq(inviteCodes.used, false)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Invite code not found or already used" },
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
    console.error("Error deleting invite code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

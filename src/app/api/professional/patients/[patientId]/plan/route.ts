import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients, patientPlans, professionals } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { eq, and } from "drizzle-orm";

async function getProfessional(userId: number) {
  const [prof] = await db
    .select({ id: professionals.id })
    .from(professionals)
    .where(eq(professionals.userId, userId))
    .limit(1);
  return prof ?? null;
}

async function verifyPatientOwnership(
  patientId: number,
  professionalId: number
) {
  const [patient] = await db
    .select({ id: patients.id })
    .from(patients)
    .where(
      and(
        eq(patients.id, patientId),
        eq(patients.professionalId, professionalId)
      )
    )
    .limit(1);
  return patient ?? null;
}

/**
 * GET /api/professional/patients/[patientId]/plan
 * Fetch a patient's billing plan
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { patientId: patientIdStr } = await params;
    const patientId = parseInt(patientIdStr, 10);

    const professional = await getProfessional(user.id);
    if (!professional) {
      return NextResponse.json(
        { error: "Professional profile not found" },
        { status: 404 }
      );
    }

    const patient = await verifyPatientOwnership(patientId, professional.id);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const [plan] = await db
      .select()
      .from(patientPlans)
      .where(eq(patientPlans.patientId, patientId))
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

/**
 * PUT /api/professional/patients/[patientId]/plan
 * Upsert a patient's billing plan
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const user = await requireRole(["professional"]);
    const { patientId: patientIdStr } = await params;
    const patientId = parseInt(patientIdStr, 10);

    const professional = await getProfessional(user.id);
    if (!professional) {
      return NextResponse.json(
        { error: "Professional profile not found" },
        { status: 404 }
      );
    }

    const patient = await verifyPatientOwnership(patientId, professional.id);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      price,
      currency = "BRL",
      billingCycle = "monthly",
      status = "active",
      startDate,
      nextPaymentDate,
      lastPaymentDate,
      notes,
    } = body;

    if (!price || !startDate) {
      return NextResponse.json(
        { error: "price and startDate are required" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Check if plan already exists
    const [existing] = await db
      .select({ id: patientPlans.id })
      .from(patientPlans)
      .where(eq(patientPlans.patientId, patientId))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(patientPlans)
        .set({
          price: String(price),
          currency,
          billingCycle,
          status,
          startDate,
          nextPaymentDate: nextPaymentDate ?? null,
          lastPaymentDate: lastPaymentDate ?? null,
          notes: notes ?? null,
          updatedAt: now,
        })
        .where(eq(patientPlans.id, existing.id))
        .returning();
      return NextResponse.json({ plan: updated });
    } else {
      const [created] = await db
        .insert(patientPlans)
        .values({
          patientId,
          professionalId: professional.id,
          price: String(price),
          currency,
          billingCycle,
          status,
          startDate,
          nextPaymentDate: nextPaymentDate ?? null,
          lastPaymentDate: lastPaymentDate ?? null,
          notes: notes ?? null,
        })
        .returning();
      return NextResponse.json({ plan: created }, { status: 201 });
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Error upserting patient plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

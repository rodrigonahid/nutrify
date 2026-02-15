import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { db } from "@/db";
import { professionals, users, patients } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export default async function ProfessionalsListPage() {
  const { user } = await getSession();
  if (!user || user.role !== "admin") redirect("/login");

  const professionalsList = await db
    .select({
      id: professionals.id,
      userId: professionals.userId,
      professionalLicense: professionals.professionalLicense,
      specialization: professionals.specialization,
      bio: professionals.bio,
      createdAt: professionals.createdAt,
      email: users.email,
      userCreatedAt: users.createdAt,
      patientCount: sql<number>`count(${patients.id})::int`,
    })
    .from(professionals)
    .innerJoin(users, eq(professionals.userId, users.id))
    .leftJoin(patients, eq(patients.professionalId, professionals.id))
    .groupBy(professionals.id, users.id, users.email, users.createdAt);

  return (
    <div className="p-4 md:p-8 max-w-[900px]">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Back to Dashboard
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
            Professionals
          </h1>
          <p className="text-sm font-medium text-[#6B7280]">
            {professionalsList.length === 0
              ? "No professionals yet"
              : `${professionalsList.length} professional${professionalsList.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/admin/professionals/create"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] hover:bg-[#277A4F] hover:-translate-y-px transition-all duration-150"
        >
          <Plus size={14} />
          Create Professional
        </Link>
      </div>

      {professionalsList.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center py-14 px-6 text-center">
          <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center mb-4">
            <Users size={22} className="text-[#9CA3AF]" />
          </div>
          <p className="text-[15px] font-semibold text-[#374151] mb-1">No professionals yet</p>
          <p className="text-[13px] text-[#9CA3AF] mb-4">Create the first nutritionist account.</p>
          <Link
            href="/admin/professionals/create"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-[13px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] hover:bg-[#277A4F] transition-all duration-150"
          >
            <Plus size={14} />
            Create Professional
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="divide-y divide-[#F3F4F6]">
            {professionalsList.map((prof) => (
              <div key={prof.id} className="flex items-start gap-3 px-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-semibold text-[#111827] truncate">{prof.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {prof.specialization && (
                      <p className="text-[12px] text-[#6B7280]">{prof.specialization}</p>
                    )}
                    {prof.professionalLicense && (
                      <p className="text-[12px] text-[#9CA3AF]">License: {prof.professionalLicense}</p>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[13px] font-semibold text-[#374151]">
                    {prof.patientCount} patient{prof.patientCount !== 1 ? "s" : ""}
                  </p>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                    {new Date(prof.userCreatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

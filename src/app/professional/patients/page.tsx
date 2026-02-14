"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronRight, Users, KeyRound } from "lucide-react";
import { Patient } from "@/types";

function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function PatientInitial({ name, email }: { name: string | null; email: string }) {
  const label = name?.[0] ?? email[0];
  return (
    <div className="w-9 h-9 rounded-full bg-[rgba(46,139,90,0.10)] flex items-center justify-center shrink-0">
      <span className="text-[13px] font-bold text-[#2E8B5A] uppercase">{label}</span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-[#F3F4F6] shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-36 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-48 bg-[#F3F4F6] rounded" />
      </div>
      <div className="h-3 w-10 bg-[#F3F4F6] rounded" />
    </div>
  );
}

export default function PatientsListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/professional/patients")
      .then((r) => r.json())
      .then((data) => setPatients(data.patients ?? []))
      .catch(() => setError("Failed to load patients"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.email.toLowerCase().includes(q) ||
      (p.name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      {/* Page heading */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
            My Patients
          </h1>
          {!loading && (
            <p className="text-sm font-medium text-[#6B7280]">
              {patients.length === 0
                ? "No patients yet"
                : `${patients.length} patient${patients.length !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>
      </div>

      {/* Search */}
      {(loading || patients.length > 0) && (
        <div className="relative mb-4">
          <span className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
            <Search size={15} strokeWidth={2} />
          </span>
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-[38px] pr-3 bg-white border border-[#E5E7EB] rounded-[10px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all duration-150 hover:border-[#D1D5DB] focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.12)]"
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {/* Patient list */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">

        {/* Loading skeletons */}
        {loading && (
          <div className="divide-y divide-[#F3F4F6]">
            {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* Empty state — no patients at all */}
        {!loading && patients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center mb-4">
              <Users size={22} className="text-[#9CA3AF]" />
            </div>
            <p className="text-[15px] font-semibold text-[#374151] mb-1">
              No patients yet
            </p>
            <p className="text-[13px] text-[#9CA3AF] mb-5">
              Generate an invite code to add your first patient.
            </p>
            <Link
              href="/professional/invite-codes"
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#2E8B5A] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#277A4F] transition-colors duration-150"
            >
              <KeyRound size={13} strokeWidth={2.2} />
              Go to Invite Codes
            </Link>
          </div>
        )}

        {/* No search results */}
        {!loading && patients.length > 0 && filtered.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-[14px] font-medium text-[#9CA3AF]">
              No patients match &quot;{search}&quot;
            </p>
          </div>
        )}

        {/* Patient rows */}
        {!loading && filtered.length > 0 && (
          <div className="divide-y divide-[#F3F4F6]">
            {filtered.map((patient) => {
              const age = calculateAge(patient.dateOfBirth);
              const displayName = patient.name ?? patient.email;

              return (
                <Link
                  key={patient.id}
                  href={`/professional/patients/${patient.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#F9FAFB] transition-colors duration-100 group"
                >
                  <PatientInitial name={patient.name} email={patient.email} />

                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#111827] truncate">
                      {displayName}
                    </p>
                    {patient.name && (
                      <p className="text-[12px] text-[#9CA3AF] truncate">
                        {patient.email}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {age !== null && (
                      <span className="text-[12px] font-medium text-[#9CA3AF]">
                        {age}y
                      </span>
                    )}
                    {(patient.height || patient.weight) && (
                      <span className="hidden sm:block text-[12px] text-[#9CA3AF]">
                        {patient.height ? `${patient.height} cm` : ""}
                        {patient.height && patient.weight ? " · " : ""}
                        {patient.weight ? `${patient.weight} kg` : ""}
                      </span>
                    )}
                    <ChevronRight
                      size={16}
                      strokeWidth={2}
                      className="text-[#D1D5DB] group-hover:text-[#9CA3AF] transition-colors duration-100"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, ChevronRight, Users, UserPlus, X, Copy, Check, Clock, Trash2 } from "lucide-react";
import { Patient, PendingInvite } from "@/types";

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

function PendingInitial({ name }: { name: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-[#F3F4F6] border border-dashed border-[#D1D5DB] flex items-center justify-center shrink-0">
      <span className="text-[13px] font-bold text-[#9CA3AF] uppercase">{name[0]}</span>
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

// ── Invite modal ──────────────────────────────────────────────────────────

interface InviteModalProps {
  onClose: () => void;
  onInvited: () => void;
}

function InviteModal({ onClose, onInvited }: InviteModalProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/professional/invite-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientName: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha ao gerar convite");
      }
      const data = await res.json();
      setGeneratedCode(data.inviteCode.code);
      onInvited();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar convite");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyCode() {
    if (!generatedCode) return;
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <UserPlus size={16} className="text-[#2E8B5A]" strokeWidth={2} />
            <p className="text-[14px] font-semibold text-[#111827]">Convidar paciente</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center text-[#9CA3AF] hover:text-[#374151] rounded-[6px] transition-colors duration-100"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        <div className="p-5">
          {!generatedCode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-[#374151] mb-1.5 block">
                  Nome do paciente
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex.: Maria Silva"
                  autoFocus
                  required
                  className="w-full h-10 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all duration-150 focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.12)]"
                />
              </div>

              {error && (
                <p className="text-[12px] font-medium text-[#DC2626]">{error}</p>
              )}

              <p className="text-[12px] text-[#9CA3AF]">
                Um código de 8 dígitos será gerado. Válido por 30 dias.
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-10 text-[13px] font-semibold text-[#374151] bg-white border border-[#E5E7EB] rounded-[8px] hover:bg-[#F9FAFB] transition-colors duration-150"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className="flex-1 h-10 text-[13px] font-semibold text-white bg-[#2E8B5A] rounded-[8px] hover:bg-[#277A4F] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Gerando…" : "Gerar convite"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-[13px] text-[#6B7280] mb-3">
                  Código gerado para <strong className="text-[#111827]">{name}</strong>
                </p>
                <div className="inline-flex items-center gap-3 bg-[#F2F4F3] rounded-[12px] px-5 py-4">
                  <span className="text-[28px] font-extrabold text-[#111827] tracking-[0.2em] font-mono">
                    {generatedCode}
                  </span>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="h-8 w-8 flex items-center justify-center rounded-[6px] text-[#6B7280] hover:text-[#2E8B5A] hover:bg-white transition-all duration-150"
                    title="Copiar código"
                  >
                    {copied ? <Check size={15} strokeWidth={2.5} className="text-[#2E8B5A]" /> : <Copy size={15} strokeWidth={2} />}
                  </button>
                </div>
                <p className="text-[12px] text-[#9CA3AF] mt-3">
                  Compartilhe este código com o paciente para que ele possa criar a conta.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full h-10 text-[13px] font-semibold text-white bg-[#2E8B5A] rounded-[8px] hover:bg-[#277A4F] transition-colors duration-150"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function PatientsListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/professional/patients");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPatients(data.patients ?? []);
      setPendingInvites(data.pendingInvites ?? []);
    } catch {
      setError("Falha ao carregar pacientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function cancelInvite(id: number) {
    if (!confirm("Cancelar este convite?")) return;
    try {
      await fetch(`/api/professional/invite-codes/${id}`, { method: "DELETE" });
      setPendingInvites((prev) => prev.filter((inv) => inv.id !== id));
    } catch {
      // silently ignore
    }
  }

  const q = search.toLowerCase();
  const filteredPatients = patients.filter(
    (p) =>
      (p.email ?? "").toLowerCase().includes(q) ||
      (p.name ?? "").toLowerCase().includes(q)
  );
  const filteredPending = pendingInvites.filter((inv) =>
    inv.patientName.toLowerCase().includes(q)
  );

  const totalCount = patients.length + pendingInvites.length;
  const hasAny = totalCount > 0;
  const hasResults = filteredPatients.length > 0 || filteredPending.length > 0;

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      {/* Page heading */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
            Meus pacientes
          </h1>
          {!loading && (
            <p className="text-sm font-medium text-[#6B7280]">
              {patients.length === 0 && pendingInvites.length === 0
                ? "Nenhum paciente ainda"
                : `${patients.length} ativo${patients.length !== 1 ? "s" : ""}${pendingInvites.length > 0 ? ` · ${pendingInvites.length} aguardando cadastro` : ""}`}
            </p>
          )}
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#2E8B5A] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#277A4F] transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)]"
        >
          <UserPlus size={13} strokeWidth={2.5} />
          Convidar
        </button>
      </div>

      {/* Search */}
      {(loading || hasAny) && (
        <div className="relative mb-4">
          <span className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none">
            <Search size={15} strokeWidth={2} />
          </span>
          <input
            type="search"
            placeholder="Buscar por nome ou e-mail…"
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

      {/* List */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">

        {loading && (
          <div className="divide-y divide-[#F3F4F6]">
            {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !hasAny && (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center mb-4">
              <Users size={22} className="text-[#9CA3AF]" />
            </div>
            <p className="text-[15px] font-semibold text-[#374151] mb-1">
              Nenhum paciente ainda
            </p>
            <p className="text-[13px] text-[#9CA3AF] mb-5">
              Convide seu primeiro paciente para começar.
            </p>
            <button
              onClick={() => setInviteOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#2E8B5A] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#277A4F] transition-colors duration-150"
            >
              <UserPlus size={13} strokeWidth={2.2} />
              Convidar paciente
            </button>
          </div>
        )}

        {/* No search results */}
        {!loading && hasAny && !hasResults && (
          <div className="py-10 text-center">
            <p className="text-[14px] font-medium text-[#9CA3AF]">
              Nenhum resultado para &quot;{search}&quot;
            </p>
          </div>
        )}

        {/* Rows */}
        {!loading && hasResults && (
          <div className="divide-y divide-[#F3F4F6]">

            {/* Active patients */}
            {filteredPatients.map((patient) => {
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

            {/* Pending invites */}
            {filteredPending.map((invite) => (
              <div
                key={`invite-${invite.id}`}
                className="flex items-center gap-3 px-4 py-3"
              >
                <PendingInitial name={invite.patientName} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-semibold text-[#9CA3AF] truncate">
                      {invite.patientName}
                    </p>
                    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
                      <Clock size={10} strokeWidth={2} />
                      Aguardando cadastro
                    </span>
                  </div>
                  <p className="text-[12px] text-[#9CA3AF] font-mono tracking-wider">
                    {invite.code}
                  </p>
                </div>

                <button
                  onClick={() => cancelInvite(invite.id)}
                  className="h-7 w-7 flex items-center justify-center shrink-0 text-[#D1D5DB] hover:text-[#DC2626] rounded-[6px] transition-colors duration-100"
                  aria-label="Cancelar convite"
                >
                  <Trash2 size={13} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {inviteOpen && (
        <InviteModal
          onClose={() => setInviteOpen(false)}
          onInvited={() => fetchData()}
        />
      )}
    </div>
  );
}

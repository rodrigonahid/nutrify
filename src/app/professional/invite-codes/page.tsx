"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Ticket, Plus, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InviteCode } from "@/types";

function codeStatus(code: InviteCode): { label: string; style: string } {
  if (code.used) return { label: "Usado", style: "text-[#2E8B5A] bg-[rgba(46,139,90,0.08)]" };
  if (code.expiresAt && new Date(code.expiresAt) < new Date())
    return { label: "Expirado", style: "text-[#DC2626] bg-[rgba(220,38,38,0.08)]" };
  return { label: "Disponível", style: "text-[#1D4ED8] bg-[rgba(29,78,216,0.08)]" };
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
      <div className="flex-1 space-y-1.5">
        <div className="h-4 w-36 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-24 bg-[#F3F4F6] rounded" />
      </div>
      <div className="h-5 w-16 bg-[#F3F4F6] rounded-full" />
    </div>
  );
}

export default function InviteCodesPage() {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [patientName, setPatientName] = useState("");

  useEffect(() => {
    fetchCodes();
  }, []);

  async function fetchCodes() {
    try {
      const res = await fetch("/api/professional/invite-codes");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInviteCodes(data.inviteCodes ?? []);
    } catch {
      setError("Falha ao carregar códigos de convite");
    } finally {
      setLoading(false);
    }
  }

  async function generateCode(e: React.FormEvent) {
    e.preventDefault();
    if (!patientName.trim()) {
      setError("Nome do paciente obrigatório");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/professional/invite-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientName: patientName.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Falha ao gerar código de convite");
      }
      await fetchCodes();
      setShowModal(false);
      setPatientName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar código de convite");
    } finally {
      setGenerating(false);
    }
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  function closeModal() {
    setShowModal(false);
    setPatientName("");
    setError("");
  }

  return (
    <div className="p-4 md:p-8 max-w-[900px]">

      {/* Back link */}
      <Link
        href="/professional"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Voltar ao painel
      </Link>

      {/* Page heading */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
            Códigos de convite
          </h1>
          {!loading && (
            <p className="text-sm font-medium text-[#6B7280]">
              {inviteCodes.length === 0
                ? "Nenhum código ainda"
                : `${inviteCodes.length} code${inviteCodes.length !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#2E8B5A] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#277A4F] transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] shrink-0"
        >
          <Plus size={13} strokeWidth={2.5} />
          Gerar código
        </button>
      </div>

      {/* Error */}
      {error && !showModal && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden divide-y divide-[#F3F4F6]">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : inviteCodes.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center py-14 px-6 text-center">
          <div className="w-12 h-12 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center mb-4">
            <Ticket size={22} className="text-[#9CA3AF]" />
          </div>
          <p className="text-[15px] font-semibold text-[#374151] mb-1">
            Nenhum código ainda
          </p>
          <p className="text-[13px] text-[#9CA3AF] mb-5">
            Gere um código para convidar um novo paciente.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#2E8B5A] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#277A4F] transition-colors duration-150"
          >
            <Plus size={13} strokeWidth={2.5} />
            Gerar código
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="divide-y divide-[#F3F4F6]">
            {inviteCodes.map((ic) => {
              const { label, style } = codeStatus(ic);
              return (
                <div
                  key={ic.id}
                  className="flex items-start gap-3 px-4 py-3.5"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-[#111827] font-mono tracking-widest mb-0.5">
                      {ic.code}
                    </p>
                    <p className="text-[12px] text-[#6B7280]">
                      {ic.patientName}
                      {ic.used && ic.patientEmail && (
                        <span className="text-[#9CA3AF]"> · usado por {ic.patientEmail}</span>
                      )}
                      {!ic.used && ic.expiresAt && (
                        <span className="text-[#9CA3AF]">
                          {" "}· expira em {new Date(ic.expiresAt).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${style}`}>
                      {label}
                    </span>
                    {!ic.used && (
                      <button
                        onClick={() => copyCode(ic.code)}
                        className="h-7 w-7 flex items-center justify-center text-[#9CA3AF] hover:text-[#374151] rounded-[6px] transition-colors duration-100"
                        aria-label="Copiar código"
                        title={copiedCode === ic.code ? "Copiado!" : "Copiar código"}
                      >
                        {copiedCode === ic.code ? (
                          <Check size={13} strokeWidth={2.5} className="text-[#2E8B5A]" />
                        ) : (
                          <Copy size={13} strokeWidth={2} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Generate Code Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-[#F3F4F6]">
              <p className="text-[16px] font-bold text-[#111827]">Gerar código de convite</p>
              <p className="text-[13px] text-[#6B7280] mt-0.5">
                Digite o nome do paciente para gerar um código.
              </p>
            </div>

            <form onSubmit={generateCode} className="p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-3 py-2.5 text-[13px] font-semibold text-[#DC2626]">
                  {error}
                </div>
              )}

              <div>
                <Label
                  htmlFor="patient-name"
                  className="text-[14px] font-semibold text-[#374151] mb-1.5 block"
                >
                  Nome do paciente
                </Label>
                <Input
                  id="patient-name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="ex.: Maria Silva"
                  autoFocus
                  disabled={generating}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={generating}
                  className="flex-1 h-11 flex items-center justify-center text-[14px] font-semibold text-[#374151] bg-white border border-[#E5E7EB] rounded-[10px] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-all duration-150 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="flex-1 h-11 flex items-center justify-center gap-2 text-[14px] font-semibold text-white bg-[#2E8B5A] rounded-[10px] hover:bg-[#277A4F] transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] disabled:opacity-60 disabled:shadow-none"
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Gerando…
                    </>
                  ) : (
                    "Gerar código"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

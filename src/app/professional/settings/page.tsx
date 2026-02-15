"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ProfessionalSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [bio, setBio] = useState("");
  const [professionalLicense, setProfessionalLicense] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/professional/profile");
        if (!res.ok) throw new Error("Falha ao carregar perfil");
        const { profile } = await res.json();
        setName(profile.name ?? "");
        setPhone(profile.phone ?? "");
        setSpecialization(profile.specialization ?? "");
        setBio(profile.bio ?? "");
        setProfessionalLicense(profile.professionalLicense ?? "");
      } catch {
        setError("Falha ao carregar perfil.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/professional/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || null,
          phone: phone || null,
          specialization: specialization || null,
          bio: bio || null,
          professionalLicense: professionalLicense || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Falha ao salvar perfil");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar perfil");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full h-10 px-3 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E8B5A] focus:ring-2 focus:ring-[rgba(46,139,90,0.15)] transition-all duration-150";
  const labelClass = "block text-[13px] font-semibold text-[#374151] mb-1.5";

  return (
    <div className="p-4 md:p-8 max-w-[600px]">

      <div className="mb-8">
        <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-1">
          Configurações
        </h1>
        <p className="text-sm font-medium text-[#6B7280]">
          Gerencie suas informações de perfil
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626] mb-4">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="flex items-center gap-2 bg-[rgba(46,139,90,0.08)] border border-[rgba(46,139,90,0.2)] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#2E8B5A] mb-4">
          Perfil atualizado com sucesso.
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i}>
              <div className="h-3 w-20 bg-[#F3F4F6] rounded mb-2" />
              <div className="h-10 w-full bg-[#F3F4F6] rounded-[10px]" />
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4">

            <div>
              <label className={labelClass}>Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Telefone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+55 (11) 99999-9999"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Especialização</label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="ex.: Nutrição Esportiva"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Registro profissional</label>
              <input
                type="text"
                value={professionalLicense}
                onChange={(e) => setProfessionalLicense(e.target.value)}
                placeholder="CRN-0 00000"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Bio <span className="font-normal text-[#9CA3AF]">(opcional)</span></label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Uma breve descrição sobre você…"
                className="w-full px-3 py-2.5 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E8B5A] focus:ring-2 focus:ring-[rgba(46,139,90,0.15)] transition-all duration-150 resize-none"
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-4 h-11 rounded-[10px] bg-[#2E8B5A] text-white text-[14px] font-bold hover:bg-[#267a50] active:bg-[#1e6b43] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {saving ? "Salvando…" : "Salvar perfil"}
          </button>
        </form>
      )}

      {/* Account info */}
      <div className="mt-6 bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#F3F4F6]">
          <p className="text-[14px] font-semibold text-[#111827]">Conta</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[13px] text-[#6B7280]">
            Para alterar seu e-mail ou senha, entre em contato com o administrador.
          </p>
        </div>
      </div>

    </div>
  );
}

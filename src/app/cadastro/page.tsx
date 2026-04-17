"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { professionalSignupSchema } from "@/lib/validation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type SignupFormData = z.infer<typeof professionalSignupSchema>;

export default function CadastroPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleGoogleSignup() {
    setGoogleLoading(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(professionalSignupSchema),
  });

  const password = watch("password", "");
  const strength = getPasswordStrength(password);

  async function onSubmit(data: SignupFormData) {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup/professional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Erro ao criar conta");
        return;
      }
      window.location.href = "/professional";
    } catch {
      setError("Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[#F2F4F3] flex items-center justify-center p-8 max-sm:p-0 max-sm:items-start">
      <div className="w-full max-w-[428px] bg-white rounded-3xl overflow-hidden shadow-[0_0_0_1px_rgba(46,139,90,0.06),0_4px_12px_rgba(46,139,90,0.06),0_20px_48px_rgba(46,139,90,0.09),0_40px_80px_rgba(0,0,0,0.05)] animate-[rise_0.5s_cubic-bezier(0.16,1,0.3,1)_both] max-sm:rounded-none max-sm:shadow-none max-sm:max-w-none max-sm:min-h-dvh max-sm:[animation:none]">

        {/* Green header */}
        <div className="bg-[#236B47] p-0 relative overflow-hidden after:content-[''] after:absolute after:w-[260px] after:h-[260px] after:top-[-100px] after:right-[-80px] after:rounded-full after:bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_65%)] after:pointer-events-none">
          <div className="px-10 pt-10 pb-0 flex flex-col items-center max-sm:px-7 max-sm:pt-16">
            <div className="relative z-10 flex items-center gap-[11px] mb-[10px]">
              <div className="w-10 h-10 bg-white/[0.14] border-[1.5px] border-white/20 rounded-[12px] flex items-center justify-center flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                  <line x1="11" y1="20" x2="11" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M11 10.5C11 10.5 6.5 9 6 3.5C6 3.5 11.5 3 14 7C15.5 9 14.5 10.8 11 10.5Z" fill="white" fillOpacity="0.92"/>
                  <path d="M11 15C11 15 15.5 12.5 18.5 15C18.5 15 17.5 20 13.5 20.5C11.5 20.8 10.5 17.5 11 15Z" fill="white" fillOpacity="0.65"/>
                </svg>
              </div>
              <span className="text-[22px] font-extrabold text-white tracking-[-0.4px]">
                Nutri<span className="opacity-55 font-semibold">fy</span>
              </span>
            </div>
            <p className="relative z-10 text-[13px] font-medium text-white/[0.48] mb-[26px]">
              Gestão nutricional para profissionais
            </p>
          </div>
          <svg
            className="block w-full mb-[-2px] relative z-10"
            viewBox="0 0 428 72"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path d="M0 0 Q214 72 428 0 L428 72 L0 72 Z" fill="white"/>
          </svg>
        </div>

        {/* White form body */}
        <div className="px-10 pt-0 pb-10 max-sm:px-7 max-sm:pb-12">
          <div className="mb-[26px]">
            <h1 className="text-[22px] font-extrabold text-[#111827] tracking-[-0.4px] mb-1">
              Criar sua conta
            </h1>
            <p className="text-sm font-medium text-[#6B7280]">
              Grátis para começar, sem cartão de crédito
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col" noValidate>

            {error && (
              <div
                className="flex items-center gap-[9px] bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-[14px] py-[11px] text-[13.5px] font-semibold text-[#DC2626] mb-[18px] animate-[rise_0.3s_cubic-bezier(0.16,1,0.3,1)_both]"
                role="alert"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
                  <circle cx="7.5" cy="7.5" r="6.5" stroke="#DC2626" strokeWidth="1.4"/>
                  <line x1="7.5" y1="4.5" x2="7.5" y2="8" stroke="#DC2626" strokeWidth="1.4" strokeLinecap="round"/>
                  <circle cx="7.5" cy="10.5" r="0.75" fill="#DC2626"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Name */}
            <div
              className="flex flex-col gap-[6px] mb-[14px] opacity-0 animate-[rise_0.5s_cubic-bezier(0.16,1,0.3,1)_both]"
              style={{ animationDelay: "60ms" }}
            >
              <label htmlFor="name" className="text-[14px] font-semibold text-[#374151]">
                Nome completo
              </label>
              <div className="group relative flex items-center">
                <span className="absolute left-[13px] text-[#9CA3AF] pointer-events-none flex transition-colors duration-150 group-focus-within:text-[#2E8B5A]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  autoComplete="name"
                  disabled={loading}
                  aria-invalid={errors.name ? "true" : "false"}
                  {...register("name")}
                  className="w-full h-11 pl-[42px] pr-[13px] bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-[10px] text-[15px] font-normal text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all duration-150 hover:border-[#D1D5DB] hover:bg-[#F3F4F6] focus:bg-white focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.16)] aria-invalid:border-[#DC2626] aria-invalid:shadow-[0_0_0_3px_rgba(220,38,38,0.14)] disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              {errors.name && (
                <p className="text-xs font-medium text-[#DC2626]">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div
              className="flex flex-col gap-[6px] mb-[14px] opacity-0 animate-[rise_0.5s_cubic-bezier(0.16,1,0.3,1)_both]"
              style={{ animationDelay: "100ms" }}
            >
              <label htmlFor="email" className="text-[14px] font-semibold text-[#374151]">
                E-mail
              </label>
              <div className="group relative flex items-center">
                <span className="absolute left-[13px] text-[#9CA3AF] pointer-events-none flex transition-colors duration-150 group-focus-within:text-[#2E8B5A]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M1 6l7 4.5L15 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  aria-invalid={errors.email ? "true" : "false"}
                  {...register("email")}
                  className="w-full h-11 pl-[42px] pr-[13px] bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-[10px] text-[15px] font-normal text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all duration-150 hover:border-[#D1D5DB] hover:bg-[#F3F4F6] focus:bg-white focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.16)] aria-invalid:border-[#DC2626] aria-invalid:shadow-[0_0_0_3px_rgba(220,38,38,0.14)] disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              {errors.email && (
                <p className="text-xs font-medium text-[#DC2626]">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div
              className="flex flex-col gap-[6px] mb-[14px] opacity-0 animate-[rise_0.5s_cubic-bezier(0.16,1,0.3,1)_both]"
              style={{ animationDelay: "140ms" }}
            >
              <label htmlFor="password" className="text-[14px] font-semibold text-[#374151]">
                Senha
              </label>
              <div className="group relative flex items-center">
                <span className="absolute left-[13px] text-[#9CA3AF] pointer-events-none flex transition-colors duration-150 group-focus-within:text-[#2E8B5A]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="7.5" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M5 7.5V5a3 3 0 016 0v2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    <circle cx="8" cy="11" r="1" fill="currentColor"/>
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  disabled={loading}
                  aria-invalid={errors.password ? "true" : "false"}
                  {...register("password")}
                  className="w-full h-11 pl-[42px] pr-[42px] bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-[10px] text-[15px] font-normal text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all duration-150 hover:border-[#D1D5DB] hover:bg-[#F3F4F6] focus:bg-white focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.16)] aria-invalid:border-[#DC2626] aria-invalid:shadow-[0_0_0_3px_rgba(220,38,38,0.14)] disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-[11px] text-[#9CA3AF] hover:text-[#2E8B5A] p-[5px] rounded-[6px] transition-colors duration-150"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 2l12 12M6.5 6.6A2 2 0 009.4 9.4M4.5 4.6C3 5.7 1 8 1 8s2.5 5 7 5c1.4 0 2.6-.4 3.6-1.1M9.8 9.8C11.2 8.8 15 8 15 8s-2.5-5-7-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                  )}
                </button>
              </div>
              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="flex gap-1 mt-[2px]">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className="h-[3px] flex-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor:
                          strength >= level
                            ? strength <= 1 ? "#DC2626" : strength === 2 ? "#F59E0B" : strength === 3 ? "#3B82F6" : "#2E8B5A"
                            : "#E5E7EB",
                      }}
                    />
                  ))}
                </div>
              )}
              {errors.password && (
                <p className="text-xs font-medium text-[#DC2626]">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm password */}
            <div
              className="flex flex-col gap-[6px] mb-[14px] opacity-0 animate-[rise_0.5s_cubic-bezier(0.16,1,0.3,1)_both]"
              style={{ animationDelay: "180ms" }}
            >
              <label htmlFor="confirmPassword" className="text-[14px] font-semibold text-[#374151]">
                Confirmar senha
              </label>
              <div className="group relative flex items-center">
                <span className="absolute left-[13px] text-[#9CA3AF] pointer-events-none flex transition-colors duration-150 group-focus-within:text-[#2E8B5A]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="7.5" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M5 7.5V5a3 3 0 016 0v2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    <circle cx="8" cy="11" r="1" fill="currentColor"/>
                  </svg>
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  disabled={loading}
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                  {...register("confirmPassword")}
                  className="w-full h-11 pl-[42px] pr-[42px] bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-[10px] text-[15px] font-normal text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all duration-150 hover:border-[#D1D5DB] hover:bg-[#F3F4F6] focus:bg-white focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.16)] aria-invalid:border-[#DC2626] aria-invalid:shadow-[0_0_0_3px_rgba(220,38,38,0.14)] disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-[11px] text-[#9CA3AF] hover:text-[#2E8B5A] p-[5px] rounded-[6px] transition-colors duration-150"
                >
                  {showConfirm ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 2l12 12M6.5 6.6A2 2 0 009.4 9.4M4.5 4.6C3 5.7 1 8 1 8s2.5 5 7 5c1.4 0 2.6-.4 3.6-1.1M9.8 9.8C11.2 8.8 15 8 15 8s-2.5-5-7-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-medium text-[#DC2626]">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* CRN (optional) */}
            <div
              className="flex flex-col gap-[6px] mb-[10px] opacity-0 animate-[rise_0.5s_cubic-bezier(0.16,1,0.3,1)_both]"
              style={{ animationDelay: "220ms" }}
            >
              <label htmlFor="crn" className="text-[14px] font-semibold text-[#374151] flex items-center gap-2">
                CRN
                <span className="text-[12px] font-medium text-[#9CA3AF]">opcional</span>
              </label>
              <div className="group relative flex items-center">
                <span className="absolute left-[13px] text-[#9CA3AF] pointer-events-none flex transition-colors duration-150 group-focus-within:text-[#2E8B5A]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  id="crn"
                  type="text"
                  placeholder="Ex: 1234/SP"
                  disabled={loading}
                  {...register("crn")}
                  className="w-full h-11 pl-[42px] pr-[13px] bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-[10px] text-[15px] font-normal text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all duration-150 hover:border-[#D1D5DB] hover:bg-[#F3F4F6] focus:bg-white focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.16)] disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="h-[14px]" />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#2E8B5A] hover:bg-[#277A4F] text-white text-[15px] font-bold rounded-[10px] border-none cursor-pointer flex items-center justify-center gap-2 mb-5 transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] hover:-translate-y-px hover:shadow-[0_1px_3px_rgba(0,0,0,0.10),0_6px_18px_rgba(46,139,90,0.26)] active:translate-y-0 active:scale-[0.99] active:shadow-[0_1px_2px_rgba(0,0,0,0.08),0_2px_6px_rgba(46,139,90,0.18)] disabled:opacity-70 disabled:cursor-not-allowed opacity-0 animate-[rise_0.5s_cubic-bezier(0.16,1,0.3,1)_both]"
              style={{ animationDelay: "260ms" }}
            >
              {loading ? (
                <svg className="w-[17px] h-[17px] animate-spin shrink-0" viewBox="0 0 17 17" fill="none">
                  <circle cx="8.5" cy="8.5" r="7" stroke="rgba(255,255,255,0.35)" strokeWidth="2"/>
                  <path d="M8.5 1.5a7 7 0 017 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                "Criar conta grátis"
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-[#E5E7EB]" />
              <span className="text-[12px] font-medium text-[#9CA3AF]">ou</span>
              <div className="flex-1 h-px bg-[#E5E7EB]" />
            </div>

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading || googleLoading}
              className="w-full h-11 bg-white border-[1.5px] border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] text-[#374151] text-[15px] font-semibold rounded-[10px] flex items-center justify-center gap-[10px] mb-5 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <svg className="w-[17px] h-[17px] animate-spin shrink-0" viewBox="0 0 17 17" fill="none">
                  <circle cx="8.5" cy="8.5" r="7" stroke="rgba(0,0,0,0.15)" strokeWidth="2"/>
                  <path d="M8.5 1.5a7 7 0 017 7" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
              )}
              Continuar com Google
            </button>

            <p
              className="text-center text-[14px] font-medium text-[#6B7280] opacity-0 animate-[rise_0.5s_cubic-bezier(0.16,1,0.3,1)_both]"
              style={{ animationDelay: "300ms" }}
            >
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="text-[#2E8B5A] font-bold hover:opacity-75 transition-opacity duration-150"
              >
                Entrar
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}

function getPasswordStrength(password: string): number {
  if (password.length === 0) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

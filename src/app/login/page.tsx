"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { emailSchema } from "@/lib/validation";

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if user is already authenticated (also clears stale cookies via /api/auth/me)
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          const roleRedirects: Record<string, string> = {
            admin: "/admin",
            professional: "/professional",
            patient: "/patient",
          };
          window.location.href = roleRedirects[data.user.role] || "/";
        }
      })
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Falha no login");
        return;
      }

      // Redirect based on user role returned from API
      // This avoids the redirect chain through the root page
      const roleRedirects: Record<string, string> = {
        admin: "/admin",
        professional: "/professional",
        patient: "/patient",
      };

      const destination = roleRedirects[result.user.role] || "/";

      // If there was a specific redirect requested, use that instead
      // But only if it's not the default "/" which would create a loop
      const finalDestination = redirect !== "/" ? redirect : destination;

      window.location.href = finalDestination;
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

            {/* Logo */}
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

            {/* Tagline */}
            <p className="relative z-10 text-[13px] font-medium text-white/[0.48] mb-[26px]">
              Gestão nutricional para profissionais
            </p>
          </div>

          {/* Concave arc */}
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
              Bem-vindo de volta
            </h1>
            <p className="text-sm font-medium text-[#6B7280]">
              Entre para acessar seu painel
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col" noValidate>

            {/* Error banner */}
            {error && (
              <div
                className="flex items-center gap-[9px] bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-[14px] py-[11px] text-[13.5px] font-semibold text-[#DC2626] mb-[18px]"
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

            {/* Email field */}
            <div className="flex flex-col gap-[6px] mb-[14px]">
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

            {/* Password field */}
            <div className="flex flex-col gap-[6px] mb-[14px]">
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
                  placeholder="••••••••"
                  autoComplete="current-password"
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
              {errors.password && (
                <p className="text-xs font-medium text-[#DC2626]">{errors.password.message}</p>
              )}
            </div>

            <div className="h-[10px]" />

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#2E8B5A] hover:bg-[#277A4F] text-white text-[15px] font-bold rounded-[10px] border-none cursor-pointer flex items-center justify-center gap-2 mb-5 transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] hover:-translate-y-px hover:shadow-[0_1px_3px_rgba(0,0,0,0.10),0_6px_18px_rgba(46,139,90,0.26)] active:translate-y-0 active:scale-[0.99] active:shadow-[0_1px_2px_rgba(0,0,0,0.08),0_2px_6px_rgba(46,139,90,0.18)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="w-[17px] h-[17px] animate-spin shrink-0" viewBox="0 0 17 17" fill="none">
                  <circle cx="8.5" cy="8.5" r="7" stroke="rgba(255,255,255,0.35)" strokeWidth="2"/>
                  <path d="M8.5 1.5a7 7 0 017 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                "Entrar"
              )}
            </button>

            <p className="text-center text-[14px] font-medium text-[#6B7280]">
              Não tem uma conta?{" "}
              <Link
                href="/signup"
                className="text-[#2E8B5A] font-bold hover:opacity-75 transition-opacity duration-150"
              >
                Criar conta
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center bg-[#F2F4F3]">
        <div className="animate-pulse text-[#6B7280]">Carregando...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { inviteCodeSchema } from "@/lib/validation";

// Step 1: Invite code validation schema
const step1Schema = z.object({
  inviteCode: inviteCodeSchema,
});

// Step 2: Personal information schema
const step2Schema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  dateOfBirth: z.string().optional(),
});

// Step 3: Account credentials schema (relaxed - allow weak passwords)
const step3Schema = z
  .object({
    email: z
      .string()
      .email("Invalid email address")
      .min(1, "Email is required")
      .max(255, "Email is too long"),
    password: z
      .string()
      .min(1, "Password is required")
      .max(100, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

const STEP_LABELS = {
  1: { heading: "Enter your code", sub: "Enter the 8-digit code from your nutritionist" },
  2: { heading: "Your information", sub: "Confirm your personal details" },
  3: { heading: "Create account", sub: "Set up your login credentials" },
} as const;

// Shared input className
const inputBase =
  "w-full h-11 bg-[#F9FAFB] border-[1.5px] border-[#E5E7EB] rounded-[10px] text-[15px] font-normal text-[#111827] placeholder:text-[#9CA3AF] outline-none transition-all duration-150 hover:border-[#D1D5DB] hover:bg-[#F3F4F6] focus:bg-white focus:border-[#2E8B5A] focus:shadow-[0_0_0_3px_rgba(46,139,90,0.16)] aria-invalid:border-[#DC2626] aria-invalid:shadow-[0_0_0_3px_rgba(220,38,38,0.14)] disabled:opacity-60 disabled:cursor-not-allowed";

export default function SignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 1 form (invite code)
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
  });

  // Step 2 form (personal info)
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  });

  // Step 3 form (credentials)
  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
  });

  // Real-time validation states
  const emailValue = step3Form.watch("email");
  const passwordValue = step3Form.watch("password");
  const confirmPasswordValue = step3Form.watch("confirmPassword");

  const isEmailValid = emailValue && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

  const passwordValidation = {
    hasMinLength: passwordValue && passwordValue.length >= 8,
    hasUpperCase: passwordValue && /[A-Z]/.test(passwordValue),
    hasLowerCase: passwordValue && /[a-z]/.test(passwordValue),
    hasNumber: passwordValue && /\d/.test(passwordValue),
  };

  const isPasswordStrong =
    passwordValidation.hasMinLength &&
    passwordValidation.hasUpperCase &&
    passwordValidation.hasLowerCase &&
    passwordValidation.hasNumber;

  const passwordsMatch =
    passwordValue && confirmPasswordValue && passwordValue === confirmPasswordValue;

  // Store validated data across steps
  const [validatedCode, setValidatedCode] = useState("");
  const [professionalInfo, setProfessionalInfo] = useState<{
    email: string;
    specialization: string | null;
  } | null>(null);

  // Step 1: Validate invite code
  async function onStep1Submit(data: Step1Data) {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `/api/invite-codes/validate?code=${data.inviteCode}`
      );
      const result = await response.json();

      if (!response.ok || !result.valid) {
        setError(result.error || "Invalid invite code");
        return;
      }

      setValidatedCode(data.inviteCode);
      setProfessionalInfo(result.professional);
      step2Form.setValue("name", result.patientName || "");
      setCurrentStep(2);
    } catch {
      setError("Failed to validate invite code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Proceed to credentials step
  async function onStep2Submit(_data: Step2Data) {
    setError("");
    setCurrentStep(3);
  }

  // Step 3: Final signup submission
  async function onStep3Submit(data: Step3Data) {
    setShowValidation(true);
    setError("");
    setLoading(true);

    try {
      const step2Data = step2Form.getValues();

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: validatedCode,
          name: step2Data.name,
          dateOfBirth: step2Data.dateOfBirth || undefined,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Signup failed:", result);

        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details
            .map((err: { field: string; message: string }) => `${err.field}: ${err.message}`)
            .join(", ");
          setError(errorMessages);
        } else {
          setError(result.error || "Signup failed");
        }
        return;
      }

      router.push("/patient");
    } catch (err) {
      console.error("Signup error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const { heading, sub } = STEP_LABELS[currentStep];

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
              Nutrition management for professionals
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

          {/* Numbered pill step indicator */}
          <div className="flex items-center justify-center mb-[26px]">
            {([1, 2, 3] as const).map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={[
                    "w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-200",
                    currentStep > step
                      ? "bg-[#2E8B5A] text-white"
                      : currentStep === step
                      ? "bg-[#2E8B5A] text-white shadow-[0_0_0_3px_rgba(46,139,90,0.18)]"
                      : "bg-[#E5E7EB] text-[#9CA3AF]",
                  ].join(" ")}
                >
                  {currentStep > step ? (
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M2 5.5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={[
                      "w-8 h-[2px] transition-all duration-200",
                      currentStep > step ? "bg-[#2E8B5A]" : "bg-[#E5E7EB]",
                    ].join(" ")}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step heading */}
          <div className="mb-[22px]">
            <h1 className="text-[22px] font-extrabold text-[#111827] tracking-[-0.4px] mb-1">
              {heading}
            </h1>
            <p className="text-sm font-medium text-[#6B7280]">{sub}</p>
          </div>

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

          {/* ── Step 1: Invite code ── */}
          {currentStep === 1 && (
            <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="flex flex-col" noValidate>
              <div className="flex flex-col gap-[6px] mb-[14px]">
                <label htmlFor="inviteCode" className="text-[14px] font-semibold text-[#374151]">
                  Invite code
                </label>
                <div className="group relative flex items-center">
                  <span className="absolute left-[13px] text-[#9CA3AF] pointer-events-none flex transition-colors duration-150 group-focus-within:text-[#2E8B5A]">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M10 2a4 4 0 011 7.9V11h1a1 1 0 010 2h-1v1a1 1 0 01-2 0v-1H7a1 1 0 010-2h2v-1.1A4 4 0 0110 2zm0 2a2 2 0 100 4 2 2 0 000-4z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                    </svg>
                  </span>
                  <input
                    id="inviteCode"
                    type="text"
                    placeholder="12345678"
                    disabled={loading}
                    maxLength={8}
                    aria-invalid={step1Form.formState.errors.inviteCode ? "true" : "false"}
                    {...step1Form.register("inviteCode", {
                      onChange: (e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        e.target.value = value;
                      },
                    })}
                    className={`${inputBase} pl-[42px] pr-[13px] text-center tracking-[0.25em] font-mono text-lg`}
                  />
                </div>
                {step1Form.formState.errors.inviteCode && (
                  <p className="text-xs font-medium text-[#DC2626]">
                    {step1Form.formState.errors.inviteCode.message}
                  </p>
                )}
                <p className="text-xs text-[#9CA3AF]">8-digit code provided by your nutritionist</p>
              </div>

              <div className="h-[10px]" />
              <SubmitButton loading={loading} label="Continue" />
              <SignInCta />
            </form>
          )}

          {/* ── Step 2: Personal information ── */}
          {currentStep === 2 && (
            <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="flex flex-col" noValidate>

              {/* Nutritionist info banner */}
              {professionalInfo && (
                <div className="flex items-start gap-2 bg-[rgba(46,139,90,0.07)] border border-[rgba(46,139,90,0.18)] rounded-[10px] px-[14px] py-[11px] text-[13px] font-medium text-[#236B47] mb-[18px]">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0 mt-[1px]">
                    <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                    <line x1="7.5" y1="6.5" x2="7.5" y2="10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    <circle cx="7.5" cy="4.5" r="0.75" fill="currentColor"/>
                  </svg>
                  <span>
                    Your nutritionist: <strong>{professionalInfo.email}</strong>
                    {professionalInfo.specialization && ` · ${professionalInfo.specialization}`}
                  </span>
                </div>
              )}

              {/* Full name */}
              <div className="flex flex-col gap-[6px] mb-[14px]">
                <label htmlFor="name" className="text-[14px] font-semibold text-[#374151]">
                  Full name
                </label>
                <div className="group relative flex items-center">
                  <span className="absolute left-[13px] text-[#9CA3AF] pointer-events-none flex transition-colors duration-150 group-focus-within:text-[#2E8B5A]">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <input
                    id="name"
                    type="text"
                    placeholder="Jane Doe"
                    disabled={loading}
                    aria-invalid={step2Form.formState.errors.name ? "true" : "false"}
                    {...step2Form.register("name")}
                    className={`${inputBase} pl-[42px] pr-[13px]`}
                  />
                </div>
                {step2Form.formState.errors.name && (
                  <p className="text-xs font-medium text-[#DC2626]">
                    {step2Form.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Date of birth */}
              <div className="flex flex-col gap-[6px] mb-[14px]">
                <label htmlFor="dateOfBirth" className="text-[14px] font-semibold text-[#374151]">
                  Date of birth <span className="font-normal text-[#9CA3AF]">(optional)</span>
                </label>
                <div className="group relative flex items-center">
                  <span className="absolute left-[13px] text-[#9CA3AF] pointer-events-none flex transition-colors duration-150 group-focus-within:text-[#2E8B5A]">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M1 7h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      <path d="M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <input
                    id="dateOfBirth"
                    type="date"
                    disabled={loading}
                    aria-invalid={step2Form.formState.errors.dateOfBirth ? "true" : "false"}
                    {...step2Form.register("dateOfBirth")}
                    className={`${inputBase} pl-[42px] pr-[13px]`}
                  />
                </div>
              </div>

              <div className="h-[10px]" />
              <div className="flex gap-3 mb-5">
                <BackButton onClick={() => setCurrentStep(1)} />
                <SubmitButton loading={loading} label="Continue" flex />
              </div>
              <SignInCta />
            </form>
          )}

          {/* ── Step 3: Account credentials ── */}
          {currentStep === 3 && (
            <form onSubmit={step3Form.handleSubmit(onStep3Submit)} className="flex flex-col" noValidate>

              {/* Email */}
              <div className="flex flex-col gap-[6px] mb-[14px]">
                <label htmlFor="email" className="text-[14px] font-semibold text-[#374151]">
                  Email address
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
                    aria-invalid={step3Form.formState.errors.email ? "true" : "false"}
                    {...step3Form.register("email")}
                    className={`${inputBase} pl-[42px] pr-[13px]`}
                  />
                </div>
                {step3Form.formState.errors.email && (
                  <p className="text-xs font-medium text-[#DC2626]">{step3Form.formState.errors.email.message}</p>
                )}
                {showValidation && emailValue && !isEmailValid && !step3Form.formState.errors.email && (
                  <p className="text-xs font-medium text-amber-600">Invalid email format</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-[6px] mb-[14px]">
                <label htmlFor="password" className="text-[14px] font-semibold text-[#374151]">
                  Password
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
                    autoComplete="new-password"
                    disabled={loading}
                    aria-invalid={step3Form.formState.errors.password ? "true" : "false"}
                    {...step3Form.register("password")}
                    className={`${inputBase} pl-[42px] pr-[42px]`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-[11px] text-[#9CA3AF] hover:text-[#2E8B5A] p-[5px] rounded-[6px] transition-colors duration-150"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {step3Form.formState.errors.password && (
                  <p className="text-xs font-medium text-[#DC2626]">{step3Form.formState.errors.password.message}</p>
                )}
                {showValidation && passwordValue && !isPasswordStrong && !step3Form.formState.errors.password && (
                  <p className="text-xs font-medium text-amber-600">
                    Use 8+ chars with uppercase, lowercase, and a number
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-[6px] mb-[14px]">
                <label htmlFor="confirmPassword" className="text-[14px] font-semibold text-[#374151]">
                  Confirm password
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
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={loading}
                    aria-invalid={step3Form.formState.errors.confirmPassword ? "true" : "false"}
                    {...step3Form.register("confirmPassword")}
                    className={`${inputBase} pl-[42px] pr-[42px]`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute right-[11px] text-[#9CA3AF] hover:text-[#2E8B5A] p-[5px] rounded-[6px] transition-colors duration-150"
                  >
                    <EyeIcon open={showConfirmPassword} />
                  </button>
                </div>
                {step3Form.formState.errors.confirmPassword && (
                  <p className="text-xs font-medium text-[#DC2626]">{step3Form.formState.errors.confirmPassword.message}</p>
                )}
                {confirmPasswordValue && passwordsMatch && (
                  <p className="text-xs font-medium text-[#2E8B5A]">Passwords match</p>
                )}
              </div>

              <div className="h-[10px]" />
              <div className="flex gap-3 mb-5">
                <BackButton onClick={() => setCurrentStep(2)} />
                <SubmitButton loading={loading} label="Create account" flex />
              </div>
              <SignInCta />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small shared sub-components ──────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 2l12 12M6.5 6.6A2 2 0 009.4 9.4M4.5 4.6C3 5.7 1 8 1 8s2.5 5 7 5c1.4 0 2.6-.4 3.6-1.1M9.8 9.8C11.2 8.8 15 8 15 8s-2.5-5-7-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
}

function SubmitButton({
  loading,
  label,
  flex,
}: {
  loading: boolean;
  label: string;
  flex?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`${flex ? "flex-1" : "w-full"} h-11 bg-[#2E8B5A] hover:bg-[#277A4F] text-white text-[15px] font-bold rounded-[10px] border-none cursor-pointer flex items-center justify-center gap-2 transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(46,139,90,0.22)] hover:-translate-y-px hover:shadow-[0_1px_3px_rgba(0,0,0,0.10),0_6px_18px_rgba(46,139,90,0.26)] active:translate-y-0 active:scale-[0.99] active:shadow-[0_1px_2px_rgba(0,0,0,0.08),0_2px_6px_rgba(46,139,90,0.18)] disabled:opacity-70 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <svg className="w-[17px] h-[17px] animate-spin shrink-0" viewBox="0 0 17 17" fill="none">
          <circle cx="8.5" cy="8.5" r="7" stroke="rgba(255,255,255,0.35)" strokeWidth="2"/>
          <path d="M8.5 1.5a7 7 0 017 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ) : (
        label
      )}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 h-11 bg-white border-[1.5px] border-[#E5E7EB] text-[#374151] text-[15px] font-semibold rounded-[10px] cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-150 hover:bg-[#F9FAFB] hover:border-[#D1D5DB]"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Back
    </button>
  );
}

function SignInCta() {
  return (
    <p className="text-center text-[14px] font-medium text-[#6B7280]">
      Already have an account?{" "}
      <Link
        href="/login"
        className="text-[#2E8B5A] font-bold hover:opacity-75 transition-opacity duration-150"
      >
        Sign in
      </Link>
    </p>
  );
}

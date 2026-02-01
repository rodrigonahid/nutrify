"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default function SignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showValidation, setShowValidation] = useState(false);

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

  // Email validation
  const isEmailValid = emailValue && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

  // Password strength validation
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

  const passwordsMatch = passwordValue && confirmPasswordValue && passwordValue === confirmPasswordValue;

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

      // Store validated data
      setValidatedCode(data.inviteCode);
      setProfessionalInfo(result.professional);

      // Pre-fill name from invite code
      step2Form.setValue("name", result.patientName || "");

      // Move to step 2
      setCurrentStep(2);
    } catch {
      setError("Failed to validate invite code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Proceed to credentials step
  async function onStep2Submit(data: Step2Data) {
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

        // Check for validation errors
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details
            .map((err: any) => `${err.field}: ${err.message}`)
            .join(", ");
          setError(errorMessages);
        } else {
          setError(result.error || "Signup failed");
        }
        return;
      }

      // Success - redirect to patient dashboard
      router.push("/patient");
    } catch (err) {
      console.error("Signup error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[500px]">
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>
            {currentStep === 1 &&
              "Enter the 8-digit code provided by your nutritionist"}
            {currentStep === 2 && "Confirm your personal information"}
            {currentStep === 3 && "Set up your account credentials"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-6 gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                currentStep >= 1 ? "bg-primary" : "bg-muted"
              }`}
            />
            <div
              className={`h-0.5 w-8 ${
                currentStep >= 2 ? "bg-primary" : "bg-muted"
              }`}
            />
            <div
              className={`h-2 w-2 rounded-full ${
                currentStep >= 2 ? "bg-primary" : "bg-muted"
              }`}
            />
            <div
              className={`h-0.5 w-8 ${
                currentStep >= 3 ? "bg-primary" : "bg-muted"
              }`}
            />
            <div
              className={`h-2 w-2 rounded-full ${
                currentStep >= 3 ? "bg-primary" : "bg-muted"
              }`}
            />
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
              {error}
            </div>
          )}

          {/* Step 1: Invite Code */}
          {currentStep === 1 && (
            <form
              onSubmit={step1Form.handleSubmit(onStep1Submit)}
              className="space-y-6"
            >
              <FormField
                label="Invite Code"
                type="text"
                placeholder="12345678"
                registration={step1Form.register("inviteCode", {
                  onChange: (e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    e.target.value = value;
                  },
                })}
                error={step1Form.formState.errors.inviteCode}
                hint="8-digit code provided by your nutritionist"
                disabled={loading}
                className="text-center text-lg tracking-wider font-mono"
                maxLength={8}
              />

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Validating..." : "Next"}
              </Button>
            </form>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <>
              {professionalInfo && (
                <div className="p-3 mb-6 bg-primary/10 border border-primary/30 rounded text-sm text-primary">
                  Nutritionist: {professionalInfo.email}
                  {professionalInfo.specialization &&
                    ` (${professionalInfo.specialization})`}
                </div>
              )}

              <form
                onSubmit={step2Form.handleSubmit(onStep2Submit)}
                className="space-y-6"
              >
                <FormField
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  registration={step2Form.register("name")}
                  error={step2Form.formState.errors.name}
                  disabled={loading}
                />

                <FormField
                  label="Date of Birth (Optional)"
                  type="date"
                  registration={step2Form.register("dateOfBirth")}
                  error={step2Form.formState.errors.dateOfBirth}
                  disabled={loading}
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    disabled={loading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    Next
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* Step 3: Account Credentials */}
          {currentStep === 3 && (
            <form
              onSubmit={step3Form.handleSubmit(onStep3Submit)}
              className="space-y-6"
            >
              <div>
                <FormField
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  registration={step3Form.register("email")}
                  error={step3Form.formState.errors.email}
                  disabled={loading}
                />
                {showValidation && emailValue && !isEmailValid && !step3Form.formState.errors.email && (
                  <p className="text-xs mt-1 text-amber-600">
                    ⚠ Invalid email format
                  </p>
                )}
              </div>

              <div>
                <FormField
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  registration={step3Form.register("password")}
                  error={step3Form.formState.errors.password}
                  disabled={loading}
                />
                {showValidation && passwordValue && !isPasswordStrong && (
                  <p className="text-xs mt-1 text-amber-600">
                    Weak password
                  </p>
                )}
              </div>

              <div>
                <FormField
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  registration={step3Form.register("confirmPassword")}
                  error={step3Form.formState.errors.confirmPassword}
                  disabled={loading}
                />
                {confirmPasswordValue && passwordsMatch && (
                  <p className="text-xs mt-1 text-green-600">
                    ✓ Passwords match
                  </p>
                )}
                {showValidation && confirmPasswordValue && !passwordsMatch && !step3Form.formState.errors.confirmPassword && (
                  <p className="text-xs mt-1 text-red-600">
                    ✗ Passwords do not match
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  disabled={loading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
            </form>
          )}

          <p className="text-xs text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

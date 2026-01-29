"use client";

import { useState, useEffect } from "react";
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
import { signupSchema } from "@/lib/validation";

const signupFormSchema = signupSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupFormSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [professionalInfo, setProfessionalInfo] = useState<{
    email: string;
    specialization: string | null;
  } | null>(null);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
  });

  const inviteCode = watch("inviteCode");

  // Validate code when user finishes typing 8 digits
  async function validateCode(code: string) {
    if (!/^\d{8}$/.test(code)) {
      setProfessionalInfo(null);
      return;
    }

    setValidating(true);
    setError("");

    try {
      const response = await fetch(`/api/invite-codes/validate?code=${code}`);
      const data = await response.json();

      if (data.valid) {
        setProfessionalInfo(data.professional);
      } else {
        setError(data.error || "Invalid invite code");
        setProfessionalInfo(null);
      }
    } catch (err) {
      setError("Failed to validate invite code");
      setProfessionalInfo(null);
      console.error(err);
    } finally {
      setValidating(false);
    }
  }

  async function onSubmit(data: SignupFormData) {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          inviteCode: data.inviteCode,
          dateOfBirth: data.dateOfBirth || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Signup failed");
        return;
      }

      // Success - redirect to patient dashboard
      router.push("/patient");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Validate invite code when it reaches 8 digits
  useEffect(() => {
    if (inviteCode && inviteCode.length === 8) {
      validateCode(inviteCode);
    } else {
      setProfessionalInfo(null);
    }
  }, [inviteCode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[1200px]">
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>
            Enter your details and the 8-digit code provided by your nutritionist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {/* Invite Code - First */}
            <FormField
              label="Invite Code"
              type="text"
              placeholder="12345678"
              registration={register("inviteCode", {
                onChange: (e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  e.target.value = value;
                },
              })}
              error={errors.inviteCode}
              hint="8-digit code provided by your nutritionist"
              disabled={loading}
              className="text-center text-lg tracking-wider font-mono"
              maxLength={8}
            />
            {validating && (
              <p className="text-xs text-muted-foreground -mt-3">
                Validating...
              </p>
            )}
            {professionalInfo && (
              <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 -mt-3">
                ✓ Valid code from {professionalInfo.email}
                {professionalInfo.specialization &&
                  ` (${professionalInfo.specialization})`}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-medium text-sm">Account Information</h3>

              <FormField
                label="Email"
                type="email"
                placeholder="your@email.com"
                registration={register("email")}
                error={errors.email}
                disabled={loading}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  registration={register("password")}
                  error={errors.password}
                  hint="At least 8 characters with uppercase, lowercase, and number"
                  disabled={loading}
                />

                <FormField
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  registration={register("confirmPassword")}
                  error={errors.confirmPassword}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-medium text-sm">
                Personal Information (Optional)
              </h3>

              <FormField
                label="Date of Birth"
                type="date"
                registration={register("dateOfBirth")}
                error={errors.dateOfBirth}
                disabled={loading}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

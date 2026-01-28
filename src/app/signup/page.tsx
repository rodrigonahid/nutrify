"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [professionalInfo, setProfessionalInfo] = useState<{
    email: string;
    specialization: string | null;
  } | null>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    inviteCode: "",
    dateOfBirth: "",
  });

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate code format
    if (!/^\d{8}$/.test(formData.inviteCode)) {
      setError("Invite code must be 8 digits");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          inviteCode: formData.inviteCode,
          dateOfBirth: formData.dateOfBirth || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>
            Enter your details and the 8-digit code provided by your nutritionist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {/* Invite Code - First */}
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code *</Label>
              <Input
                id="inviteCode"
                type="text"
                placeholder="12345678"
                maxLength={8}
                value={formData.inviteCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // Only digits
                  setFormData({ ...formData, inviteCode: value });
                  if (value.length === 8) {
                    validateCode(value);
                  } else {
                    setProfessionalInfo(null);
                  }
                }}
                required
                disabled={loading}
                className="text-center text-lg tracking-wider font-mono"
              />
              <p className="text-xs text-muted-foreground">
                8-digit code provided by your nutritionist
              </p>
              {validating && (
                <p className="text-xs text-muted-foreground">Validating...</p>
              )}
              {professionalInfo && (
                <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  ✓ Valid code from {professionalInfo.email}
                  {professionalInfo.specialization && ` (${professionalInfo.specialization})`}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm">Account Information</h3>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-medium text-sm">Personal Information (Optional)</h3>

              <div className="gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>

              </div>
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

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { emailSchema, passwordSchema } from "@/lib/validation";

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        setError(result.error || "Login failed");
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
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[1200px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <FormField
              label="Email"
              type="email"
              placeholder="name@example.com"
              registration={register("email")}
              error={errors.email}
              disabled={loading}
            />

            <FormField
              label="Password"
              type="password"
              registration={register("password")}
              error={errors.password}
              disabled={loading}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Create account
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

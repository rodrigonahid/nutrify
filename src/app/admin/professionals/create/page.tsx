"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormField, FormTextArea } from "@/components/ui/form-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  emailSchema,
  passwordSchema,
  nutritionistProfileSchema,
} from "@/lib/validation";

const createProfessionalSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .merge(nutritionistProfileSchema)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type CreateProfessionalFormData = z.infer<typeof createProfessionalSchema>;

export default function CreateProfessionalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProfessionalFormData>({
    resolver: zodResolver(createProfessionalSchema),
  });

  async function onSubmit(data: CreateProfessionalFormData) {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/professionals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          professionalLicense: data.professionalLicense || undefined,
          specialization: data.specialization || undefined,
          bio: data.bio || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to create professional");
        return;
      }

      // Success - redirect to professionals list
      router.push("/admin/professionals");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <Link
          href="/admin/professionals"
          className="inline-block mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Professionals
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Create Professional Account</CardTitle>
            <CardDescription>
              Add a new nutritionist to the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-medium text-sm">Account Credentials</h3>

                <FormField
                  label="Email"
                  type="email"
                  placeholder="professional@example.com"
                  registration={register("email")}
                  error={errors.email}
                  disabled={loading}
                />

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

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-medium text-sm">
                  Professional Information (Optional)
                </h3>

                <FormField
                  label="Professional License"
                  type="text"
                  placeholder="License number"
                  registration={register("professionalLicense")}
                  error={errors.professionalLicense}
                  disabled={loading}
                />

                <FormField
                  label="Specialization"
                  type="text"
                  placeholder="e.g., Sports Nutrition, Weight Management"
                  registration={register("specialization")}
                  error={errors.specialization}
                  hint="Maximum 255 characters"
                  disabled={loading}
                />

                <FormTextArea
                  label="Bio"
                  placeholder="Brief professional biography..."
                  registration={register("bio")}
                  error={errors.bio}
                  hint="Maximum 2000 characters"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Professional"}
                </Button>
                <Link href="/admin/professionals" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

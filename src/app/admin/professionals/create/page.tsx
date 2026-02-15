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
      router.push("/admin/professionals");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-[640px]">
      <Link
        href="/admin/professionals"
        className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6"
      >
        ← Back to Professionals
      </Link>

      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight mb-0.5">
          Create Professional Account
        </h1>
        <p className="text-sm font-medium text-[#6B7280]">
          Add a new nutritionist to the platform
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626]">
            {error}
          </div>
        )}

        {/* Account credentials */}
        <div className="space-y-4">
          <p className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
            Account Credentials
          </p>

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

        {/* Professional info */}
        <div className="border-t border-[#F3F4F6] pt-6 space-y-4">
          <p className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
            Professional Information (Optional)
          </p>

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
            placeholder="Brief professional biography…"
            registration={register("bio")}
            error={errors.bio}
            hint="Maximum 2000 characters"
            disabled={loading}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Creating…" : "Create Professional"}
          </Button>
          <Link href="/admin/professionals" className="flex-1">
            <Button type="button" variant="outline" disabled={loading} className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

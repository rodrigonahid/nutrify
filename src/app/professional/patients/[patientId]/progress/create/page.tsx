"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { progressSchema } from "@/lib/validation";
import { ProgressFormFields } from "@/components/progress-form-fields";

type ProgressFormData = z.infer<typeof progressSchema>;

export default function CreateProgressPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
  });

  async function onSubmit(data: ProgressFormData) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/professional/patients/${patientId}/progress`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to create progress entry");
      }

      // Redirect back to patient detail page
      router.push(`/professional/patients/${patientId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create progress entry"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Add Progress Entry</h1>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <Link
          href={`/professional/patients/${patientId}`}
          className="inline-block mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Patient
        </Link>
        {error && (
          <div className="mb-6 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <ProgressFormFields
            register={register}
            errors={errors}
            disabled={loading}
          />

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push(`/professional/patients/${patientId}`)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating..." : "Create Progress Entry"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CreateProgressPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const router = useRouter();
  const didCreate = useRef(false);

  useEffect(() => {
    if (didCreate.current) return;
    didCreate.current = true;

    fetch(`/api/professional/patients/${patientId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDraft: true }),
    })
      .then((r) => r.json())
      .then((data) => {
        router.replace(
          `/professional/patients/${patientId}/progress/${data.progress.id}/edit`
        );
      });
  }, [patientId, router]);

  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Loader2 size={24} className="animate-spin text-[#9CA3AF]" />
    </div>
  );
}

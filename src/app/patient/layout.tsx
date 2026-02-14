import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { PatientNav } from "@/components/nav/patient-nav";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getSession();

  if (!user || user.role !== "patient") {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh bg-[#F2F4F3]">
      <PatientNav userEmail={user.email} />
      <div className="md:pl-14 pt-14 md:pt-0 pb-16 md:pb-0">
        {children}
      </div>
    </div>
  );
}

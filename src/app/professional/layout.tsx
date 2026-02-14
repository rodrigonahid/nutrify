import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ProfessionalNav } from "@/components/nav/professional-nav";

export default async function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getSession();

  if (!user || user.role !== "professional") {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh bg-[#F2F4F3]">
      <ProfessionalNav userEmail={user.email} />
      {/* Offset for fixed nav: left rail on md+, top + bottom bars on mobile */}
      <div className="md:pl-14 pt-14 md:pt-0 pb-16 md:pb-0">
        {children}
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AdminNav } from "@/components/nav/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getSession();

  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh bg-[#F2F4F3]">
      <AdminNav userEmail={user.email} />
      <div className="md:pl-14 pt-14 md:pt-0 pb-16 md:pb-0">
        {children}
      </div>
    </div>
  );
}

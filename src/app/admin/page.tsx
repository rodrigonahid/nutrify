import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";
import { PageHeader } from "@/components/page-header";

export default async function AdminDashboard() {
  const { user } = await getSession();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Admin Dashboard">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <LogoutButton />
        </div>
      </PageHeader>

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin/professionals"
            className="p-6 border rounded-lg hover:border-primary transition-colors"
          >
            <h2 className="text-lg font-semibold mb-2">Nutritionists</h2>
            <p className="text-muted-foreground text-sm">
              Manage nutritionist accounts
            </p>
          </a>

          <div className="p-6 border rounded-lg opacity-50">
            <h2 className="text-lg font-semibold mb-2">Patients</h2>
            <p className="text-muted-foreground text-sm">
              View all patients in the system
            </p>
          </div>

          <div className="p-6 border rounded-lg opacity-50">
            <h2 className="text-lg font-semibold mb-2">Statistics</h2>
            <p className="text-muted-foreground text-sm">
              Platform analytics and reports
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

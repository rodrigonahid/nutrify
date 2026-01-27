import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";

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
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Nutritionists</h2>
            <p className="text-muted-foreground text-sm">
              Manage nutritionist accounts
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Patients</h2>
            <p className="text-muted-foreground text-sm">
              View all patients in the system
            </p>
          </div>

          <div className="p-6 border rounded-lg">
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

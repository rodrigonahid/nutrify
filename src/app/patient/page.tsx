import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";

export default async function PatientDashboard() {
  const { user } = await getSession();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "patient") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Patient Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 border rounded-lg opacity-50">
            <h2 className="text-lg font-semibold mb-2">My Meal Plan</h2>
            <p className="text-muted-foreground text-sm">
              View your current nutrition plan
            </p>
          </div>

          <a
            href="/patient/progress"
            className="p-6 border rounded-lg hover:border-primary transition-colors"
          >
            <h2 className="text-lg font-semibold mb-2">Progress</h2>
            <p className="text-muted-foreground text-sm">
              Track your health journey
            </p>
          </a>

          <div className="p-6 border rounded-lg opacity-50">
            <h2 className="text-lg font-semibold mb-2">My Nutritionist</h2>
            <p className="text-muted-foreground text-sm">
              Contact and schedule appointments
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

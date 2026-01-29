import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";

export default async function ProfessionalDashboard() {
  const { user } = await getSession();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "professional") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Professional Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <a
            href="/professional/patients"
            className="p-6 border rounded-lg hover:border-primary transition-colors"
          >
            <h2 className="text-lg font-semibold mb-2">My Patients</h2>
            <p className="text-muted-foreground text-sm">
              View and manage your patients
            </p>
          </a>

          <a
            href="/professional/invite-codes"
            className="p-6 border rounded-lg hover:border-primary transition-colors"
          >
            <h2 className="text-lg font-semibold mb-2">Invite Codes</h2>
            <p className="text-muted-foreground text-sm">
              Generate codes for new patients
            </p>
          </a>

          <div className="p-6 border rounded-lg opacity-50">
            <h2 className="text-lg font-semibold mb-2">Meal Plans</h2>
            <p className="text-muted-foreground text-sm">
              Create and manage nutrition plans
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

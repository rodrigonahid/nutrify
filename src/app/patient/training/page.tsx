import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";
import { PageHeader } from "@/components/page-header";
import { Dumbbell, ClipboardList, BookOpen } from "lucide-react";

export default async function TrainingDashboard() {
  const { user } = await getSession();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "patient") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Training">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <LogoutButton />
        </div>
      </PageHeader>

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <div className="mb-6">
          <a href="/patient" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <a
            href="/patient/training/sessions"
            className="p-6 border rounded-lg hover:border-primary transition-colors"
          >
            <ClipboardList className="w-8 h-8 mb-3 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">Sessions</h2>
            <p className="text-muted-foreground text-sm">
              Log and view your training sessions
            </p>
          </a>

          <a
            href="/patient/training/workouts"
            className="p-6 border rounded-lg hover:border-primary transition-colors"
          >
            <Dumbbell className="w-8 h-8 mb-3 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">Workouts</h2>
            <p className="text-muted-foreground text-sm">
              Create and manage workout templates
            </p>
          </a>

          <a
            href="/patient/training/exercises"
            className="p-6 border rounded-lg hover:border-primary transition-colors"
          >
            <BookOpen className="w-8 h-8 mb-3 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">Exercise Library</h2>
            <p className="text-muted-foreground text-sm">
              Browse and add exercises
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}

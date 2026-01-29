import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import { professionals, users, patients } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export default async function ProfessionalsListPage() {
  const { user } = await getSession();

  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  // Fetch all professionals with patient counts
  const professionalsList = await db
    .select({
      id: professionals.id,
      userId: professionals.userId,
      professionalLicense: professionals.professionalLicense,
      specialization: professionals.specialization,
      bio: professionals.bio,
      createdAt: professionals.createdAt,
      email: users.email,
      userCreatedAt: users.createdAt,
      patientCount: sql<number>`count(${patients.id})::int`,
    })
    .from(professionals)
    .innerJoin(users, eq(professionals.userId, users.id))
    .leftJoin(patients, eq(patients.professionalId, professionals.id))
    .groupBy(professionals.id, users.id, users.email, users.createdAt);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Professionals</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <Link
          href="/admin"
          className="inline-block mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Dashboard
        </Link>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Manage Professionals</h2>
            <p className="text-muted-foreground">
              View and manage all nutritionist accounts
            </p>
          </div>
          <Link href="/admin/professionals/create">
            <Button>+ Create Professional</Button>
          </Link>
        </div>

        {professionalsList.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No professionals found. Create your first professional account.
              </p>
              <Link href="/admin/professionals/create">
                <Button>Create Professional</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {professionalsList.map((prof) => (
              <Card key={prof.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{prof.email}</CardTitle>
                  {prof.specialization && (
                    <CardDescription>{prof.specialization}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  {prof.professionalLicense && (
                    <p className="text-sm text-muted-foreground">
                      License: {prof.professionalLicense}
                    </p>
                  )}
                  <p className="text-sm font-medium">
                    Patients: {prof.patientCount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined:{" "}
                    {new Date(prof.userCreatedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

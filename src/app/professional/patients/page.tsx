"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";

interface Patient {
  id: number;
  userId: number;
  email: string;
  dateOfBirth: string | null;
  height: string | null;
  weight: string | null;
  medicalNotes: string | null;
  createdAt: string;
  userCreatedAt: string;
}

export default function PatientsListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    try {
      const response = await fetch("/api/professional/patients");
      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }
      const data = await response.json();
      setPatients(data.patients);
    } catch (err) {
      setError("Failed to load patients");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function calculateAge(dateOfBirth: string | null): number | null {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/professional"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-xl font-bold">My Patients</h1>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Patient List</h2>
          <p className="text-muted-foreground">
            Manage and view all your patients
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {patients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No patients yet. Generate an invite code to add your first patient.
              </p>
              <Link
                href="/professional/invite-codes"
                className="text-primary hover:underline"
              >
                Go to Invite Codes →
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {patients.map((patient) => {
              const age = calculateAge(patient.dateOfBirth);
              return (
                <Link
                  key={patient.id}
                  href={`/professional/patients/${patient.id}`}
                >
                  <Card className="cursor-pointer hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg">{patient.email}</CardTitle>
                      {age !== null && (
                        <CardDescription>{age} years old</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {patient.height && (
                        <p className="text-sm text-muted-foreground">
                          Height: {patient.height} cm
                        </p>
                      )}
                      {patient.weight && (
                        <p className="text-sm text-muted-foreground">
                          Weight: {patient.weight} kg
                        </p>
                      )}
                      {patient.medicalNotes && (
                        <p className="text-sm text-muted-foreground">
                          Notes: {patient.medicalNotes.substring(0, 100)}
                          {patient.medicalNotes.length > 100 && "..."}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground pt-2">
                        Patient since:{" "}
                        {new Date(patient.userCreatedAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";

interface InviteCode {
  id: number;
  code: string;
  used: boolean;
  usedBy: number | null;
  expiresAt: string | null;
  createdAt: string;
  patientEmail: string | null;
}

export default function InviteCodesPage() {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchInviteCodes();
  }, []);

  async function fetchInviteCodes() {
    try {
      const response = await fetch("/api/professional/invite-codes");
      if (!response.ok) {
        throw new Error("Failed to fetch invite codes");
      }
      const data = await response.json();
      setInviteCodes(data.inviteCodes);
    } catch (err) {
      setError("Failed to load invite codes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function generateCode() {
    setGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/professional/invite-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresInDays: 7 }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate invite code");
      }

      // Refresh the list
      await fetchInviteCodes();
    } catch (err) {
      setError("Failed to generate invite code");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  async function copyToClipboard(code: string) {
    try {
      // Just copy the code, no URL needed
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  function getCodeStatus(code: InviteCode) {
    if (code.used) {
      return { label: "Used", color: "text-green-600" };
    }
    if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
      return { label: "Expired", color: "text-red-600" };
    }
    return { label: "Available", color: "text-blue-600" };
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
            <h1 className="text-xl font-bold">Invite Codes</h1>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Patient Invite Codes</h2>
            <p className="text-muted-foreground">
              Generate codes for new patients to sign up
            </p>
          </div>
          <Button onClick={generateCode} disabled={generating}>
            {generating ? "Generating..." : "+ Generate Code"}
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {inviteCodes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No invite codes yet. Generate your first code to invite patients.
              </p>
              <Button onClick={generateCode} disabled={generating}>
                Generate Invite Code
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {inviteCodes.map((inviteCode) => {
              const status = getCodeStatus(inviteCode);
              return (
                <Card key={inviteCode.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-2xl font-mono tracking-widest">
                          {inviteCode.code}
                        </CardTitle>
                        <CardDescription>
                          Created {new Date(inviteCode.createdAt).toLocaleDateString()}
                          {inviteCode.expiresAt && (
                            <> • Expires {new Date(inviteCode.expiresAt).toLocaleDateString()}</>
                          )}
                        </CardDescription>
                      </div>
                      <span className={`text-sm font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        {inviteCode.used && inviteCode.patientEmail ? (
                          <p className="text-muted-foreground">
                            Used by: <span className="font-medium">{inviteCode.patientEmail}</span>
                          </p>
                        ) : (
                          <p className="text-muted-foreground">
                            Share this code with your patient to sign up
                          </p>
                        )}
                      </div>
                      {!inviteCode.used && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(inviteCode.code)}
                        >
                          {copiedCode === inviteCode.code ? "Copied!" : "Copy Code"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

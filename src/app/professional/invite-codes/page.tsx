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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoutButton } from "@/components/logout-button";
import { PageHeader } from "@/components/page-header";
import { InviteCode } from "@/types";

export default function InviteCodesPage() {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [patientName, setPatientName] = useState("");

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

  async function generateCode(e: React.FormEvent) {
    e.preventDefault();

    if (!patientName.trim()) {
      setError("Patient name is required");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/professional/invite-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientName: patientName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate invite code");
      }

      // Refresh the list
      await fetchInviteCodes();

      // Close modal and reset form
      setShowModal(false);
      setPatientName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate invite code");
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
      <PageHeader title="Invite Codes" />

      <main className="container mx-auto px-4 py-8 max-w-[1200px]">
        <Link
          href="/professional"
          className="inline-block mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Dashboard
        </Link>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Patient Invite Codes</h2>
            <p className="text-muted-foreground">
              Generate codes for new patients to sign up
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            + Generate Code
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
            {error}
          </div>
        )}

        {inviteCodes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No invite codes yet. Generate your first code to invite patients.
              </p>
              <Button onClick={() => setShowModal(true)}>
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
                      <div className="text-sm space-y-1">
                        <p className="text-muted-foreground">
                          Patient: <span className="font-medium text-foreground">{inviteCode.patientName}</span>
                        </p>
                        {inviteCode.used && inviteCode.patientEmail ? (
                          <p className="text-muted-foreground">
                            Used by: <span className="font-medium">{inviteCode.patientEmail}</span>
                          </p>
                        ) : (
                          <p className="text-muted-foreground text-xs">
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

        {/* Generate Code Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => {
              setShowModal(false);
              setPatientName("");
              setError("");
            }}
          >
            <Card
              className="max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <CardTitle>Generate Invite Code</CardTitle>
                <CardDescription>
                  Enter the patient's name to generate an invite code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={generateCode} className="space-y-4">
                  <div>
                    <Label htmlFor="patient-name">Patient Name</Label>
                    <Input
                      id="patient-name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g., John Doe"
                      autoFocus
                      disabled={generating}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={generating} className="flex-1">
                      {generating ? "Generating..." : "Generate Code"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowModal(false);
                        setPatientName("");
                        setError("");
                      }}
                      disabled={generating}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

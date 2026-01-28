# Simplified Patient Signup Flow

## Overview

A simpler, more intuitive patient signup process using 8-digit codes instead of complex UUID links.

## Current vs. New Flow

### Current Flow (Complex)
1. Professional generates UUID invite code (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
2. Professional shares link: `https://app.com/signup?code=a1b2c3d4-e5f6-7890-abcd-ef1234567890`
3. Patient clicks link and fills signup form
4. System validates UUID and creates account

**Problems:**
- Long, complex URLs hard to share
- Code can't be easily communicated verbally or via SMS
- Patient must click exact link (can't type manually)

### New Flow (Simplified)
1. Professional generates **8-digit code** (e.g., `12345678`)
2. Professional shares code via any method (SMS, WhatsApp, verbally, etc.)
3. Patient goes to login page → clicks "Create Account"
4. Patient redirected to signup page
5. Patient enters: email, password, and **8-digit code**
6. System validates code and creates account linked to professional

**Benefits:**
- Easy to share codes (SMS, verbal, written)
- Patient can start from familiar login page
- No complex URLs to manage
- More flexible signup entry points

---

## Implementation Plan

### 1. Database Changes

**Update `inviteCodes` table:**
```typescript
// src/db/schema.ts
export const inviteCodes = pgTable("invite_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),  // Change: 8-digit string instead of UUID
  professionalId: integer("professional_id")
    .notNull()
    .references(() => professionals.id, { onDelete: "cascade" }),
  used: boolean("used").default(false).notNull(),
  usedBy: integer("used_by").references(() => patients.id, {
    onDelete: "set null",
  }),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**No schema migration needed** - just change code generation logic.

---

### 2. Backend Changes

#### A. Update Invite Code Generation

**File:** `src/app/api/professional/invite-codes/route.ts`

**Change the `POST` handler:**
```typescript
import { randomInt } from "crypto";

// Generate 8-digit code
function generateInviteCode(): string {
  // Generate number between 10000000 and 99999999 (8 digits)
  return randomInt(10000000, 100000000).toString();
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(["professional"]);

    // Get the professional ID
    const [professional] = await db
      .select()
      .from(professionals)
      .where(eq(professionals.userId, user.id))
      .limit(1);

    if (!professional) {
      return NextResponse.json(
        { error: "Professional profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const expiresInDays = body.expiresInDays || 30; // Default 30 days

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Generate 8-digit code and ensure uniqueness
    let code: string;
    let isUnique = false;

    while (!isUnique) {
      code = generateInviteCode();
      const existing = await db
        .select()
        .from(inviteCodes)
        .where(eq(inviteCodes.code, code))
        .limit(1);

      if (existing.length === 0) {
        isUnique = true;
      }
    }

    // Create invite code
    const [inviteCode] = await db
      .insert(inviteCodes)
      .values({
        code: code!,
        professionalId: professional.id,
        used: false,
        expiresAt,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Invite code generated successfully",
        inviteCode,
      },
      { status: 201 }
    );
  } catch (error) {
    // ... error handling
  }
}
```

#### B. Update Invite Code Validation

**File:** `src/app/api/invite-codes/validate/route.ts`

**Update validation to accept 8-digit codes:**
```typescript
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    // Validate format: must be 8 digits
    if (!/^\d{8}$/.test(code)) {
      return NextResponse.json(
        { valid: false, error: "Invalid code format. Code must be 8 digits." },
        { status: 400 }
      );
    }

    // Find the invite code with professional info
    const [inviteCode] = await db
      .select({
        id: inviteCodes.id,
        code: inviteCodes.code,
        used: inviteCodes.used,
        expiresAt: inviteCodes.expiresAt,
        professionalId: inviteCodes.professionalId,
        professionalEmail: users.email,
        specialization: professionals.specialization,
      })
      .from(inviteCodes)
      .innerJoin(professionals, eq(inviteCodes.professionalId, professionals.id))
      .innerJoin(users, eq(professionals.userId, users.id))
      .where(eq(inviteCodes.code, code))
      .limit(1);

    if (!inviteCode) {
      return NextResponse.json(
        { valid: false, error: "Invalid invite code" },
        { status: 404 }
      );
    }

    // Check if already used
    if (inviteCode.used) {
      return NextResponse.json(
        { valid: false, error: "This invite code has already been used" },
        { status: 400 }
      );
    }

    // Check if expired
    if (inviteCode.expiresAt && new Date(inviteCode.expiresAt) < new Date()) {
      return NextResponse.json(
        { valid: false, error: "This invite code has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      professional: {
        email: inviteCode.professionalEmail,
        specialization: inviteCode.specialization,
      },
    });
  } catch (error) {
    // ... error handling
  }
}
```

#### C. Update Signup API

**File:** `src/app/api/auth/signup/route.ts`

**Update validation schema:**
```typescript
const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  inviteCode: z.string().regex(/^\d{8}$/, "Invite code must be 8 digits"),
  dateOfBirth: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
});

// Rest of the logic stays the same - just validates 8-digit format
```

---

### 3. Frontend Changes

#### A. Update Login Page - Add "Create Account" Link

**File:** `src/app/login/page.tsx`

**Add signup link below the form:**
```typescript
<form onSubmit={handleSubmit} className="space-y-4">
  {/* ... existing form fields ... */}

  <Button type="submit" className="w-full" disabled={loading}>
    {loading ? "Signing in..." : "Sign in"}
  </Button>

  {/* NEW: Add signup link */}
  <p className="text-center text-sm text-muted-foreground">
    Don't have an account?{" "}
    <Link href="/signup" className="text-primary hover:underline">
      Create account
    </Link>
  </p>
</form>
```

#### B. Simplify Signup Page

**File:** `src/app/signup/page.tsx`

**Remove query parameter dependency, add code input field:**
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [professionalInfo, setProfessionalInfo] = useState<{
    email: string;
    specialization: string | null;
  } | null>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    inviteCode: "",
    dateOfBirth: "",
    height: "",
    weight: "",
  });

  // Validate code when user finishes typing 8 digits
  async function validateCode(code: string) {
    if (!/^\d{8}$/.test(code)) {
      setProfessionalInfo(null);
      return;
    }

    setValidating(true);
    setError("");

    try {
      const response = await fetch(`/api/invite-codes/validate?code=${code}`);
      const data = await response.json();

      if (data.valid) {
        setProfessionalInfo(data.professional);
      } else {
        setError(data.error || "Invalid invite code");
        setProfessionalInfo(null);
      }
    } catch (err) {
      setError("Failed to validate invite code");
      setProfessionalInfo(null);
    } finally {
      setValidating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate code format
    if (!/^\d{8}$/.test(formData.inviteCode)) {
      setError("Invite code must be 8 digits");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          inviteCode: formData.inviteCode,
          dateOfBirth: formData.dateOfBirth || undefined,
          height: formData.height || undefined,
          weight: formData.weight || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      // Success - redirect to patient dashboard
      router.push("/patient");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>
            Enter your details and the 8-digit code provided by your nutritionist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {/* Invite Code - First */}
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code *</Label>
              <Input
                id="inviteCode"
                type="text"
                placeholder="12345678"
                maxLength={8}
                value={formData.inviteCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // Only digits
                  setFormData({ ...formData, inviteCode: value });
                  if (value.length === 8) {
                    validateCode(value);
                  } else {
                    setProfessionalInfo(null);
                  }
                }}
                required
                disabled={loading}
                className="text-center text-lg tracking-wider font-mono"
              />
              <p className="text-xs text-muted-foreground">
                8-digit code provided by your nutritionist
              </p>
              {validating && (
                <p className="text-xs text-muted-foreground">Validating...</p>
              )}
              {professionalInfo && (
                <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  ✓ Valid code from {professionalInfo.email}
                  {professionalInfo.specialization && ` (${professionalInfo.specialization})`}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm">Account Information</h3>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-medium text-sm">Personal Information (Optional)</h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    placeholder="170"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### C. Update Professional Invite Codes Page

**File:** `src/app/professional/invite-codes/page.tsx`

**Update display to show 8-digit codes:**
```typescript
// Update the code display section
<CardTitle className="text-base font-mono text-2xl tracking-widest">
  {inviteCode.code}
</CardTitle>

// Update the copy function
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

// Update the display text
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
```

---

### 4. Validation Updates

**File:** `src/lib/validation.ts`

**Add invite code validation:**
```typescript
/**
 * Invite code validation - 8 digits
 */
export const inviteCodeSchema = z
  .string()
  .regex(/^\d{8}$/, "Invite code must be 8 digits")
  .length(8, "Invite code must be exactly 8 digits");
```

---

## User Experience Flow

### Professional Creates Code
1. Professional logs in → goes to "Invite Codes"
2. Clicks "Generate Code"
3. System shows: `12345678`
4. Professional shares code (SMS, WhatsApp, verbal, etc.)

### Patient Signs Up
1. Patient goes to `yourapp.com/login`
2. Sees "Don't have an account? Create account"
3. Clicks → redirected to `/signup`
4. Enters:
   - **Invite Code:** `12345678` (validates instantly)
   - **Email:** `patient@example.com`
   - **Password:** `SecurePass123`
   - **Optional:** Date of birth, height, weight
5. Submits → Account created → Redirected to patient dashboard

---

## Migration Strategy

If you have existing UUID codes in production:

### Option 1: Clean Break
1. Mark all existing codes as expired
2. Deploy new system
3. Professionals generate new 8-digit codes

### Option 2: Support Both (Transitional)
1. Keep UUID validation for existing codes
2. New codes are 8-digit
3. Gradually phase out UUIDs

**Recommended:** Option 1 (clean break) if still in development/testing.

---

## Testing Checklist

- [ ] Generate 8-digit code as professional
- [ ] Verify code uniqueness (try generating multiple)
- [ ] Copy code to clipboard
- [ ] Navigate to /login → click "Create account"
- [ ] Enter invalid code (7 digits, 9 digits, letters) - should show error
- [ ] Enter valid 8-digit code - should show professional info
- [ ] Complete signup with all required fields
- [ ] Verify patient account created and linked to professional
- [ ] Try using same code again - should show "already used" error
- [ ] Test expired code (manually set expiresAt in DB to past date)

---

Last Updated: 2026-01-27

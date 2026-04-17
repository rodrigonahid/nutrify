import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { db } from "@/db";
import { users, professionals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSession } from "@/lib/session";
import { hashPassword } from "@/lib/auth";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const response = NextResponse.redirect(`${origin}/professional`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const email = data.user.email;
  const name =
    data.user.user_metadata?.full_name ||
    data.user.user_metadata?.name ||
    email?.split("@")[0] ||
    "Nutricionista";

  if (!email) {
    return NextResponse.redirect(`${origin}/login?error=no_email`);
  }

  // Find or create user in our own users table
  let [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!existingUser) {
    // New user — create professional account
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const passwordHash = await hashPassword(randomPassword);

    await db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({ email, passwordHash, role: "professional" })
        .returning();

      await tx.insert(professionals).values({ userId: newUser.id, name });

      existingUser = newUser;
    });
  }

  await createSession(existingUser.id);

  // Redirect based on role
  const roleRedirects: Record<string, string> = {
    admin: "/admin",
    professional: "/professional",
    patient: "/patient",
  };

  response.headers.set(
    "Location",
    `${origin}${roleRedirects[existingUser.role] ?? "/"}`
  );

  return response;
}

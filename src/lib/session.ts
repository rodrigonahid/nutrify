import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { randomBytes } from "crypto";
import type { User } from "@/db/types";

const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION_DAYS = 7;

/**
 * Generate a secure random session token
 */
function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: number): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await db.insert(sessions).values({
    token,
    userId,
    expiresAt,
  });

  // Set the session cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

/**
 * Get the current session and user from cookies
 */
export async function getSession(): Promise<{
  session: { id: number; token: string; expiresAt: Date } | null;
  user: User | null;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return { session: null, user: null };
  }

  const result = await db
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (result.length === 0) {
    return { session: null, user: null };
  }

  return {
    session: result[0].session,
    user: result[0].user,
  };
}

/**
 * Destroy the current session (logout)
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Validate session and return user (for API routes)
 */
export async function validateSession(): Promise<User | null> {
  const { user } = await getSession();
  return user;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await validateSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

/**
 * Require specific role - throws if not authorized
 */
export async function requireRole(
  allowedRoles: Array<"admin" | "nutritionist" | "patient">
): Promise<User> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

/**
 * Clean up expired sessions (can be called periodically)
 */
export async function cleanupExpiredSessions(): Promise<void> {
  const { lt } = await import("drizzle-orm");
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

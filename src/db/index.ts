import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Supabase session-mode pooler caps connections at pool_size (≈15 on free tier).
// postgres.js defaults to max:10, which leaves no room for drizzle-kit or other tools.
// Capping at 3 keeps the app well within the limit.
//
// The globalThis singleton prevents Next.js hot-module reloads from creating
// additional pools during development.
declare global {
  // eslint-disable-next-line no-var
  var pgClient: postgres.Sql | undefined;
}

const client =
  globalThis.pgClient ??
  postgres(process.env.DATABASE_URL, {
    max: 3,
    idle_timeout: 20,
    // Required for Supabase transaction-mode pooler (port 6543)
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") globalThis.pgClient = client;

export const db = drizzle(client, { schema });

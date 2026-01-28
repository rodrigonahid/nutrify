#!/usr/bin/env tsx

import { input, password, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";
import { emailSchema } from "../src/lib/validation";
import { eq } from "drizzle-orm";

async function createAdmin() {
  console.log(chalk.bold.blue("\n🔐 Create Admin User\n"));

  try {
    // Get email
    const email = await input({
      message: "Admin email:",
      validate: (value) => {
        const result = emailSchema.safeParse(value);
        return result.success ? true : result.error.issues[0].message;
      },
    });

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log(chalk.red("\n✗ Error: Email already exists\n"));
      process.exit(1);
    }

    // Get password
    const pwd = await password({
      message: "Password:",
      mask: "*",
      validate: (value) => {
        if (!value || value.length === 0) {
          return "Password is required";
        }
        return true;
      },
    });

    // Confirm password
    const confirmPwd = await password({
      message: "Confirm password:",
      mask: "*",
    });

    if (pwd !== confirmPwd) {
      console.log(chalk.red("\n✗ Error: Passwords do not match\n"));
      process.exit(1);
    }

    // Confirm creation
    const shouldCreate = await confirm({
      message: `Create admin user with email: ${email}?`,
      default: true,
    });

    if (!shouldCreate) {
      console.log(chalk.yellow("\n⚠ Cancelled\n"));
      process.exit(0);
    }

    // Hash password
    const passwordHash = await hashPassword(pwd);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        role: "admin",
      })
      .returning();

    console.log(chalk.green("\n✓ Admin user created successfully\n"));
    console.log(chalk.dim("Details:"));
    console.log(chalk.dim(`  Email: ${newUser.email}`));
    console.log(chalk.dim(`  Role: ${newUser.role}`));
    console.log(chalk.dim(`  ID: ${newUser.id}`));
    console.log(
      chalk.dim(`  Created: ${newUser.createdAt.toLocaleString()}\n`)
    );

    process.exit(0);
  } catch (error) {
    console.log(chalk.red("\n✗ Error creating admin user\n"));
    console.error(error);
    process.exit(1);
  }
}

createAdmin();

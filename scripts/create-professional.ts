#!/usr/bin/env tsx

import { input, password, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { db } from "../src/db";
import { users, professionals } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";
import { emailSchema, passwordSchema } from "../src/lib/validation";
import { eq } from "drizzle-orm";

async function createProfessional() {
  console.log(chalk.bold.blue("\n👨‍⚕️ Create Professional User\n"));

  try {
    // Get email
    const email = await input({
      message: "Professional email:",
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
        const result = passwordSchema.safeParse(value);
        return result.success ? true : result.error.issues[0].message;
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

    // Get optional professional info
    const professionalLicense = await input({
      message: "Professional license number (optional):",
      default: "",
    });

    const specialization = await input({
      message: "Specialization (optional):",
      default: "",
    });

    const bio = await input({
      message: "Bio (optional):",
      default: "",
    });

    // Confirm creation
    console.log(chalk.dim("\nSummary:"));
    console.log(chalk.dim(`  Email: ${email}`));
    if (professionalLicense) {
      console.log(chalk.dim(`  License: ${professionalLicense}`));
    }
    if (specialization) {
      console.log(chalk.dim(`  Specialization: ${specialization}`));
    }
    console.log();

    const shouldCreate = await confirm({
      message: "Create professional user?",
      default: true,
    });

    if (!shouldCreate) {
      console.log(chalk.yellow("\n⚠ Cancelled\n"));
      process.exit(0);
    }

    // Hash password
    const passwordHash = await hashPassword(pwd);

    // Create user and professional profile in a transaction
    const result = await db.transaction(async (tx) => {
      // Create user
      const [newUser] = await tx
        .insert(users)
        .values({
          email,
          passwordHash,
          role: "professional",
        })
        .returning();

      // Create professional profile
      const [newProfessional] = await tx
        .insert(professionals)
        .values({
          userId: newUser.id,
          professionalLicense: professionalLicense || null,
          specialization: specialization || null,
          bio: bio || null,
        })
        .returning();

      return { user: newUser, professional: newProfessional };
    });

    console.log(chalk.green("\n✓ Professional user created successfully\n"));
    console.log(chalk.dim("Details:"));
    console.log(chalk.dim(`  Email: ${result.user.email}`));
    console.log(chalk.dim(`  Role: ${result.user.role}`));
    console.log(chalk.dim(`  User ID: ${result.user.id}`));
    console.log(chalk.dim(`  Professional ID: ${result.professional.id}`));
    if (result.professional.professionalLicense) {
      console.log(
        chalk.dim(`  License: ${result.professional.professionalLicense}`)
      );
    }
    if (result.professional.specialization) {
      console.log(
        chalk.dim(`  Specialization: ${result.professional.specialization}`)
      );
    }
    console.log(
      chalk.dim(`  Created: ${result.user.createdAt.toLocaleString()}\n`)
    );

    process.exit(0);
  } catch (error) {
    console.log(chalk.red("\n✗ Error creating professional user\n"));
    console.error(error);
    process.exit(1);
  }
}

createProfessional();

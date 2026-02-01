#!/usr/bin/env tsx

import chalk from "chalk";
import { db } from "../src/db";
import { users, professionals, patients, inviteCodes, appointments } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";

const DEFAULT_PASSWORD = "Test1234";

async function seedDatabase() {
  console.log(chalk.bold.blue("\n🌱 Seeding Database\n"));

  try {
    // 1. Create Admin User
    console.log(chalk.cyan("Creating admin user..."));
    const adminPasswordHash = await hashPassword(DEFAULT_PASSWORD);
    const [admin] = await db
      .insert(users)
      .values({
        email: "admin@nutrify.com",
        passwordHash: adminPasswordHash,
        role: "admin",
      })
      .returning();
    console.log(chalk.green(`✓ Admin created: ${admin.email}`));

    // 2. Create Professional Users
    console.log(chalk.cyan("\nCreating professional users..."));
    const professionalPasswordHash = await hashPassword(DEFAULT_PASSWORD);

    const professional1Data = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email: "nutritionist1@nutrify.com",
          passwordHash: professionalPasswordHash,
          role: "professional",
        })
        .returning();

      const [professional] = await tx
        .insert(professionals)
        .values({
          userId: user.id,
          name: "Dr. Sarah Johnson",
          professionalLicense: "CRN-12345",
          specialization: "Sports Nutrition",
          bio: "Specialized in sports nutrition and athletic performance optimization.",
        })
        .returning();

      return { user, professional };
    });
    console.log(chalk.green(`✓ Professional created: ${professional1Data.user.email}`));

    const professional2Data = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email: "nutritionist2@nutrify.com",
          passwordHash: professionalPasswordHash,
          role: "professional",
        })
        .returning();

      const [professional] = await tx
        .insert(professionals)
        .values({
          userId: user.id,
          name: "Dr. Michael Chen",
          professionalLicense: "CRN-67890",
          specialization: "Clinical Nutrition",
          bio: "Expert in clinical nutrition and weight management programs.",
        })
        .returning();

      return { user, professional };
    });
    console.log(chalk.green(`✓ Professional created: ${professional2Data.user.email}`));

    // 3. Create Patient Users
    console.log(chalk.cyan("\nCreating patient users..."));
    const patientPasswordHash = await hashPassword(DEFAULT_PASSWORD);

    const patientNames = [
      "John Smith",
      "Emma Wilson",
      "Michael Brown",
      "Sophia Davis",
      "James Miller",
      "Olivia Garcia",
      "William Martinez",
      "Ava Rodriguez",
      "Robert Anderson",
      "Isabella Taylor",
    ];

    const patientsData: Array<{
      user: typeof users.$inferSelect;
      patient: typeof patients.$inferSelect;
      professional: typeof professionals.$inferSelect;
    }> = [];

    for (let i = 0; i < 10; i++) {
      // Alternate between the two professionals
      const professionalData = i % 2 === 0 ? professional1Data : professional2Data;

      const patientData = await db.transaction(async (tx) => {
        const [user] = await tx
          .insert(users)
          .values({
            email: `patient${i + 1}@test.com`,
            passwordHash: patientPasswordHash,
            role: "patient",
          })
          .returning();

        // Random date of birth between 1970 and 2005
        const year = 1970 + Math.floor(Math.random() * 35);
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const dob = `${year}-${month}-${day}`;

        const [patient] = await tx
          .insert(patients)
          .values({
            userId: user.id,
            professionalId: professionalData.professional.id,
            name: patientNames[i],
            dateOfBirth: dob,
            height: 160 + Math.floor(Math.random() * 30), // 160-190 cm
            weight: 50 + Math.floor(Math.random() * 50), // 50-100 kg
          })
          .returning();

        // Create an invite code for this patient (already used)
        const inviteCodeValue = String(10000000 + i).padStart(8, '0');
        await tx.insert(inviteCodes).values({
          code: inviteCodeValue,
          professionalId: professionalData.professional.id,
          patientName: patientNames[i],
          used: true,
          usedBy: patient.id,
        });

        return { user, patient, professional: professionalData.professional };
      });

      patientsData.push(patientData);
      console.log(chalk.green(`✓ Patient ${i + 1}/10 created: ${patientData.user.email}`));
    }

    // 4. Create Appointments
    console.log(chalk.cyan("\nCreating appointments..."));

    const today = new Date();
    const statuses: Array<typeof appointments.$inferInsert.status> = [
      'pending',
      'confirmed',
      'completed',
      'cancelled',
    ];

    let appointmentCount = 0;

    for (const patientData of patientsData) {
      // Create 3-5 appointments per patient
      const numAppointments = 3 + Math.floor(Math.random() * 3);

      for (let i = 0; i < numAppointments; i++) {
        // Random date between -60 days and +30 days
        const daysOffset = -60 + Math.floor(Math.random() * 90);
        const appointmentDate = new Date(today);
        appointmentDate.setDate(appointmentDate.getDate() + daysOffset);

        const dateStr = appointmentDate.toISOString().split('T')[0];

        // Random time between 8:00 and 18:00
        const hour = 8 + Math.floor(Math.random() * 10);
        const minute = Math.random() < 0.5 ? '00' : '30';
        const timeStr = `${String(hour).padStart(2, '0')}:${minute}`;

        // Determine status based on date
        let status: typeof appointments.$inferInsert.status;
        if (daysOffset < -1) {
          // Past appointments are either completed or cancelled
          status = Math.random() < 0.8 ? 'completed' : 'cancelled';
        } else if (daysOffset === -1 || daysOffset === 0) {
          // Today/yesterday appointments are likely confirmed
          status = 'confirmed';
        } else {
          // Future appointments can be pending, confirmed, or requested
          const rand = Math.random();
          status = rand < 0.5 ? 'confirmed' : rand < 0.8 ? 'pending' : 'requested';
        }

        // Duration: 30, 45, or 60 minutes
        const durations = [30, 45, 60];
        const duration = durations[Math.floor(Math.random() * durations.length)];

        const notes = i === 0
          ? "Initial consultation and assessment"
          : Math.random() < 0.3
          ? "Follow-up appointment to track progress"
          : null;

        const cancellationReason = status === 'cancelled'
          ? "Patient requested reschedule"
          : null;

        await db.insert(appointments).values({
          professionalId: patientData.professional.id,
          patientId: patientData.patient.id,
          appointmentDate: dateStr,
          appointmentTime: timeStr,
          durationMinutes: duration,
          status,
          notes,
          cancellationReason,
          cancelledAt: status === 'cancelled' ? new Date() : null,
          cancelledBy: status === 'cancelled' ? patientData.user.id : null,
        });

        appointmentCount++;
      }
    }

    console.log(chalk.green(`✓ Created ${appointmentCount} appointments`));

    // 5. Summary
    console.log(chalk.bold.green("\n✅ Database seeded successfully!\n"));
    console.log(chalk.bold("Summary:"));
    console.log(chalk.dim("━".repeat(50)));
    console.log(chalk.cyan("Admin Users:"));
    console.log(`  • ${admin.email}`);
    console.log(chalk.cyan("\nProfessionals:"));
    console.log(`  • ${professional1Data.user.email} - ${professional1Data.professional.name}`);
    console.log(`  • ${professional2Data.user.email} - ${professional2Data.professional.name}`);
    console.log(chalk.cyan("\nPatients:"));
    patientsData.forEach((p, i) => {
      console.log(`  • ${p.user.email} - ${p.patient.name} (assigned to ${p.professional.name})`);
    });
    console.log(chalk.cyan(`\nAppointments: ${appointmentCount} total`));
    console.log(chalk.dim("━".repeat(50)));
    console.log(chalk.yellow("\n🔑 Default password for all users: " + DEFAULT_PASSWORD));
    console.log(chalk.dim("\nYou can now login with any of the above emails.\n"));

    process.exit(0);
  } catch (error) {
    console.log(chalk.red("\n✗ Error seeding database\n"));
    console.error(error);
    process.exit(1);
  }
}

seedDatabase();

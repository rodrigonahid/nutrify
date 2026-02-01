/**
 * Generate Random Appointments Script
 *
 * Usage: npm run generate:appointments
 *
 * Creates random test appointments for all professionals across 3 days:
 * - Yesterday (all marked as completed)
 * - Today (past: completed, future: confirmed)
 * - Tomorrow (all marked as confirmed)
 *
 * Features:
 * - Random time slots during working hours (8 AM - 6 PM)
 * - Random durations (30/45/60/90 minutes)
 * - Random notes
 * - 3-8 appointments per day
 * - Skips conflicts automatically
 */

import { db } from "../src/db";
import { appointments, patients, professionals } from "../src/db/schema";
import { eq } from "drizzle-orm";

// Configuration
const WORKING_HOURS = {
  start: 8, // 8 AM
  end: 18, // 6 PM
};

const DURATIONS = [30, 45, 60, 90]; // minutes
const NOTES_OPTIONS = [
  "Initial consultation",
  "Follow-up appointment",
  "Progress review",
  "Meal plan discussion",
  "Body composition analysis",
  null, // Some appointments without notes
  null,
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateTimeSlots(date: Date): { time: string; isPast: boolean }[] {
  const slots: { time: string; isPast: boolean }[] = [];
  const now = new Date();
  const isToday = formatDate(date) === formatDate(now);

  // Generate slots every 30-90 minutes (randomized)
  let currentHour = WORKING_HOURS.start;
  let currentMinute = 0;

  while (currentHour < WORKING_HOURS.end) {
    const time = formatTime(currentHour, currentMinute);

    // Check if this slot is in the past (for today only)
    let isPast = false;
    if (isToday) {
      const slotTime = new Date(date);
      slotTime.setHours(currentHour, currentMinute, 0, 0);
      isPast = slotTime < now;
    }

    slots.push({ time, isPast });

    // Add random interval (30-90 minutes)
    const interval = getRandomElement([30, 60, 90]);
    currentMinute += interval;

    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }

  return slots;
}

async function generateAppointments() {
  try {
    console.log("🚀 Starting appointment generation...\n");

    // Get all professionals
    const allProfessionals = await db.select().from(professionals);

    if (allProfessionals.length === 0) {
      console.error("❌ No professionals found in the database");
      process.exit(1);
    }

    console.log(`✅ Found ${allProfessionals.length} professional(s)\n`);

    for (const professional of allProfessionals) {
      console.log(`📋 Generating appointments for professional ID: ${professional.id}`);

      // Get all patients for this professional
      const professionalPatients = await db
        .select()
        .from(patients)
        .where(eq(patients.professionalId, professional.id));

      if (professionalPatients.length === 0) {
        console.log(`⚠️  No patients found for professional ${professional.id}, skipping...\n`);
        continue;
      }

      console.log(`   Found ${professionalPatients.length} patient(s)`);

      // Generate appointments for yesterday, today, and tomorrow
      const dates = [
        { date: new Date(Date.now() - 24 * 60 * 60 * 1000), label: "Yesterday" },
        { date: new Date(), label: "Today" },
        { date: new Date(Date.now() + 24 * 60 * 60 * 1000), label: "Tomorrow" },
      ];

      for (const { date, label } of dates) {
        console.log(`\n   📅 Generating appointments for ${label} (${formatDate(date)})`);

        const timeSlots = generateTimeSlots(date);
        const numAppointments = Math.floor(Math.random() * (timeSlots.length - 3)) + 3; // 3 to max slots

        // Shuffle and take random slots
        const shuffledSlots = [...timeSlots].sort(() => Math.random() - 0.5);
        const selectedSlots = shuffledSlots.slice(0, numAppointments);

        // Sort by time
        selectedSlots.sort((a, b) => a.time.localeCompare(b.time));

        for (const slot of selectedSlots) {
          const patient = getRandomElement(professionalPatients);
          const duration = getRandomElement(DURATIONS);
          const notes = getRandomElement(NOTES_OPTIONS);

          // Determine status based on whether it's in the past
          let status: "confirmed" | "completed" = "confirmed";
          if (label === "Yesterday" || (label === "Today" && slot.isPast)) {
            status = "completed";
          }

          try {
            await db.insert(appointments).values({
              professionalId: professional.id,
              patientId: patient.id,
              appointmentDate: formatDate(date),
              appointmentTime: slot.time,
              durationMinutes: duration,
              notes: notes,
              status: status,
            });

            console.log(
              `      ✓ Created: ${slot.time} - ${duration}min with patient ${patient.id} [${status}]`
            );
          } catch (error) {
            // Ignore conflicts (duplicate appointments at same time)
            if (error instanceof Error && error.message.includes("unique")) {
              console.log(`      ⚠️  Skipped: ${slot.time} (conflict)`);
            } else {
              throw error;
            }
          }
        }
      }

      console.log("\n");
    }

    console.log("✅ Appointment generation completed!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error generating appointments:", error);
    process.exit(1);
  }
}

// Run the script
generateAppointments();

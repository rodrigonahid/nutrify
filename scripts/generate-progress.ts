#!/usr/bin/env tsx

import { select, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { db } from "../src/db";
import { patients, progress, users } from "../src/db/schema";
import { eq } from "drizzle-orm";

interface ProgressData {
  bodyFatPercentage: string;
  height: string;
  totalWeight: string;
  bmi: string;
  perimeterChest: string;
  perimeterShoulder: string;
  perimeterWaist: string;
  perimeterAbdomen: string;
  perimeterHip: string;
  perimeterBicepsLeftRelaxed: string;
  perimeterBicepsLeftContracted: string;
  perimeterBicepsRightRelaxed: string;
  perimeterBicepsRightContracted: string;
  perimeterForearmLeft: string;
  perimeterForearmRight: string;
  perimeterThighProximalLeft: string;
  perimeterThighProximalRight: string;
  perimeterThighMedialLeft: string;
  perimeterThighMedialRight: string;
  perimeterThighDistalLeft: string;
  perimeterThighDistalRight: string;
  perimeterCalfLeft: string;
  perimeterCalfRight: string;
  skinfoldBiceps: string;
  skinfoldTriceps: string;
  skinfoldAxillary: string;
  skinfoldSuprailiac: string;
  skinfoldAbdominal: string;
  skinfoldSubscapular: string;
  skinfoldChest: string;
  skinfoldThigh: string;
  skinfoldCalf: string;
}

function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
}

function generateProgressiveMeasurements(entryNumber: number): ProgressData {
  // Starting values (entry 1)
  const baseWeight = 85.0;
  const baseHeight = 175;
  const baseBodyFat = 28.0;

  // Progressive changes per entry
  const weightLoss = 1.5; // kg per entry
  const bodyFatLoss = 1.2; // % per entry
  const waistReduction = 2.0; // cm per entry
  const muscleGain = 0.3; // cm per entry for arms/legs
  const skinfoldReduction = 1.5; // mm per entry

  // Calculate current values based on entry number
  const currentWeight = baseWeight - (weightLoss * (entryNumber - 1));
  const currentBodyFat = baseBodyFat - (bodyFatLoss * (entryNumber - 1));
  const currentBMI = calculateBMI(currentWeight, baseHeight);

  return {
    // Body Composition
    bodyFatPercentage: currentBodyFat.toFixed(1),
    height: baseHeight.toString(),
    totalWeight: currentWeight.toFixed(1),
    bmi: currentBMI.toFixed(1),

    // Perimeters - Trunk (decreasing for fat loss areas)
    perimeterChest: (102 - (waistReduction * 0.5 * (entryNumber - 1))).toFixed(0),
    perimeterShoulder: (115 + (muscleGain * 0.5 * (entryNumber - 1))).toFixed(0),
    perimeterWaist: (95 - (waistReduction * (entryNumber - 1))).toFixed(0),
    perimeterAbdomen: (98 - (waistReduction * 1.2 * (entryNumber - 1))).toFixed(0),
    perimeterHip: (105 - (waistReduction * 0.8 * (entryNumber - 1))).toFixed(0),

    // Perimeters - Upper Limbs (increasing for muscle gain)
    perimeterBicepsLeftRelaxed: (32 + (muscleGain * (entryNumber - 1))).toFixed(0),
    perimeterBicepsLeftContracted: (35 + (muscleGain * 1.2 * (entryNumber - 1))).toFixed(0),
    perimeterBicepsRightRelaxed: (32.5 + (muscleGain * (entryNumber - 1))).toFixed(0),
    perimeterBicepsRightContracted: (35.5 + (muscleGain * 1.2 * (entryNumber - 1))).toFixed(0),
    perimeterForearmLeft: (27 + (muscleGain * 0.5 * (entryNumber - 1))).toFixed(0),
    perimeterForearmRight: (27.5 + (muscleGain * 0.5 * (entryNumber - 1))).toFixed(0),

    // Perimeters - Lower Limbs
    perimeterThighProximalLeft: (58 + (muscleGain * 0.8 * (entryNumber - 1))).toFixed(0),
    perimeterThighProximalRight: (58.5 + (muscleGain * 0.8 * (entryNumber - 1))).toFixed(0),
    perimeterThighMedialLeft: (52 + (muscleGain * 0.6 * (entryNumber - 1))).toFixed(0),
    perimeterThighMedialRight: (52.5 + (muscleGain * 0.6 * (entryNumber - 1))).toFixed(0),
    perimeterThighDistalLeft: (45 + (muscleGain * 0.4 * (entryNumber - 1))).toFixed(0),
    perimeterThighDistalRight: (45.5 + (muscleGain * 0.4 * (entryNumber - 1))).toFixed(0),
    perimeterCalfLeft: (37 + (muscleGain * 0.3 * (entryNumber - 1))).toFixed(0),
    perimeterCalfRight: (37.5 + (muscleGain * 0.3 * (entryNumber - 1))).toFixed(0),

    // Skinfolds (decreasing)
    skinfoldBiceps: Math.max(3, 12 - (skinfoldReduction * (entryNumber - 1))).toFixed(1),
    skinfoldTriceps: Math.max(4, 18 - (skinfoldReduction * (entryNumber - 1))).toFixed(1),
    skinfoldAxillary: Math.max(4, 15 - (skinfoldReduction * (entryNumber - 1))).toFixed(1),
    skinfoldSuprailiac: Math.max(5, 22 - (skinfoldReduction * 1.5 * (entryNumber - 1))).toFixed(1),
    skinfoldAbdominal: Math.max(6, 25 - (skinfoldReduction * 1.8 * (entryNumber - 1))).toFixed(1),
    skinfoldSubscapular: Math.max(5, 20 - (skinfoldReduction * 1.3 * (entryNumber - 1))).toFixed(1),
    skinfoldChest: Math.max(4, 16 - (skinfoldReduction * (entryNumber - 1))).toFixed(1),
    skinfoldThigh: Math.max(5, 20 - (skinfoldReduction * 1.2 * (entryNumber - 1))).toFixed(1),
    skinfoldCalf: Math.max(3, 14 - (skinfoldReduction * (entryNumber - 1))).toFixed(1),
  };
}

async function generateProgress() {
  console.log(chalk.bold.blue("\n📊 Generate Progress Entries\n"));

  try {
    // Fetch all patients with their user info
    const patientsList = await db
      .select({
        id: patients.id,
        email: users.email,
        professionalId: patients.professionalId,
      })
      .from(patients)
      .leftJoin(users, eq(patients.userId, users.id));

    if (patientsList.length === 0) {
      console.log(chalk.yellow("\n⚠ No patients found in the database\n"));
      console.log(chalk.dim("Create a patient first before generating progress entries.\n"));
      process.exit(0);
    }

    // Select patient
    const selectedPatientId = await select({
      message: "Select patient:",
      choices: patientsList.map((p) => ({
        name: `${p.email} (ID: ${p.id})`,
        value: p.id,
      })),
    });

    const selectedPatient = patientsList.find((p) => p.id === selectedPatientId);

    console.log(chalk.dim(`\nSelected patient: ${selectedPatient?.email}`));
    console.log(chalk.dim("This will generate 5 progressive entries showing:\n"));
    console.log(chalk.dim("  • Weight loss progression"));
    console.log(chalk.dim("  • Body fat reduction"));
    console.log(chalk.dim("  • Muscle gain (arms, legs)"));
    console.log(chalk.dim("  • Waist reduction"));
    console.log(chalk.dim("  • Skinfold improvements\n"));

    const shouldGenerate = await confirm({
      message: "Generate 5 progress entries?",
      default: true,
    });

    if (!shouldGenerate) {
      console.log(chalk.yellow("\n⚠ Cancelled\n"));
      process.exit(0);
    }

    console.log(chalk.dim("\nGenerating entries...\n"));

    // Generate 5 entries with 1-week intervals
    const baseDate = new Date();
    const entries = [];

    for (let i = 1; i <= 5; i++) {
      const entryDate = new Date(baseDate);
      entryDate.setDate(baseDate.getDate() - ((5 - i) * 7)); // Space entries 1 week apart

      const measurements = generateProgressiveMeasurements(i);

      const [entry] = await db
        .insert(progress)
        .values({
          patientId: selectedPatientId!,
          ...measurements,
          createdAt: entryDate,
          updatedAt: entryDate,
        })
        .returning();

      entries.push({ entry, measurements, date: entryDate });

      console.log(chalk.green(`✓ Entry ${i}/5 created`));
      console.log(chalk.dim(`  Date: ${entryDate.toLocaleDateString()}`));
      console.log(chalk.dim(`  Weight: ${measurements.totalWeight} kg`));
      console.log(chalk.dim(`  Body Fat: ${measurements.bodyFatPercentage}%`));
      console.log(chalk.dim(`  BMI: ${measurements.bmi}`));
      console.log(chalk.dim(`  Waist: ${measurements.perimeterWaist} cm\n`));
    }

    console.log(chalk.green("\n✓ Successfully generated 5 progress entries\n"));

    // Show summary
    const firstEntry = entries[0].measurements;
    const lastEntry = entries[entries.length - 1].measurements;

    console.log(chalk.bold("Summary of Changes:\n"));
    console.log(
      chalk.dim(
        `  Weight: ${firstEntry.totalWeight} kg → ${lastEntry.totalWeight} kg (${(
          parseFloat(firstEntry.totalWeight) - parseFloat(lastEntry.totalWeight)
        ).toFixed(1)} kg lost)`
      )
    );
    console.log(
      chalk.dim(
        `  Body Fat: ${firstEntry.bodyFatPercentage}% → ${lastEntry.bodyFatPercentage}% (${(
          parseFloat(firstEntry.bodyFatPercentage) - parseFloat(lastEntry.bodyFatPercentage)
        ).toFixed(1)}% reduced)`
      )
    );
    console.log(
      chalk.dim(
        `  Waist: ${firstEntry.perimeterWaist} cm → ${lastEntry.perimeterWaist} cm (${(
          parseFloat(firstEntry.perimeterWaist) - parseFloat(lastEntry.perimeterWaist)
        ).toFixed(0)} cm lost)`
      )
    );
    console.log(
      chalk.dim(
        `  Biceps (R): ${firstEntry.perimeterBicepsRightContracted} cm → ${lastEntry.perimeterBicepsRightContracted} cm (+${(
          parseFloat(lastEntry.perimeterBicepsRightContracted) -
          parseFloat(firstEntry.perimeterBicepsRightContracted)
        ).toFixed(1)} cm)\n`
      )
    );

    console.log(chalk.dim(`Patient ID: ${selectedPatientId}`));
    console.log(chalk.dim(`Entries created: ${entries.length}\n`));

    process.exit(0);
  } catch (error) {
    console.log(chalk.red("\n✗ Error generating progress entries\n"));
    console.error(error);
    process.exit(1);
  }
}

generateProgress();

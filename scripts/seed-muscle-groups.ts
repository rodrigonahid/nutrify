import "dotenv/config";
import { db } from "@/db";
import { muscleGroups } from "@/db/schema";

const defaultMuscleGroups = [
  "Push (Chest / Shoulders / Triceps)",
  "Pull (Back / Biceps)",
  "Legs",
  "Glutes",
  "Core",
  "Full Body",
];

async function seedMuscleGroups() {
  console.log("Seeding default muscle groups...");

  for (const name of defaultMuscleGroups) {
    await db
      .insert(muscleGroups)
      .values({ name, isDefault: true, patientId: null })
      .onConflictDoNothing();
    console.log(`  ✓ ${name}`);
  }

  console.log("Done! 6 default muscle groups inserted.");
  process.exit(0);
}

seedMuscleGroups().catch((err) => {
  console.error("Error seeding muscle groups:", err);
  process.exit(1);
});

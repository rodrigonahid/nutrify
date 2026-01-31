import { db } from "../src/db";
import { users, patients, professionals } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";
import { eq } from "drizzle-orm";

async function createTestPatient() {
  try {
    console.log("🔍 Checking for existing test patient...");

    // Check if test patient already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "patient@test.com"))
      .limit(1);

    if (existingUser.length > 0) {
      console.log("✅ Test patient already exists!");
      console.log("📧 Email: patient@test.com");
      console.log("🔑 Password: password123");
      return;
    }

    console.log("👤 Creating test professional first...");

    // Check if we have any professional
    const allProfessionals = await db.select().from(professionals).limit(1);

    let professionalId: number;

    if (allProfessionals.length === 0) {
      // Create a test professional
      const hashedPassword = await hashPassword("password123");

      const [professionalUser] = await db
        .insert(users)
        .values({
          email: "nutritionist@test.com",
          passwordHash: hashedPassword,
          role: "professional",
        })
        .returning();

      const [professional] = await db
        .insert(professionals)
        .values({
          userId: professionalUser.id,
          professionalLicense: "TEST-LICENSE",
          specialization: "General Nutrition",
          bio: "Test nutritionist account",
        })
        .returning();

      professionalId = professional.id;

      console.log("✅ Test professional created:");
      console.log("   📧 Email: nutritionist@test.com");
      console.log("   🔑 Password: password123");
    } else {
      professionalId = allProfessionals[0].id;
      console.log("✅ Using existing professional");
    }

    console.log("\n👤 Creating test patient...");

    // Create patient user
    const hashedPassword = await hashPassword("password123");

    const [patientUser] = await db
      .insert(users)
      .values({
        email: "patient@test.com",
        passwordHash: hashedPassword,
        role: "patient",
      })
      .returning();

    // Create patient profile
    await db
      .insert(patients)
      .values({
        userId: patientUser.id,
        professionalId: professionalId,
        height: "175.00", // 175 cm
        weight: "75.00", // 75 kg
        dateOfBirth: "1990-01-01",
      })
      .returning();

    console.log("\n✅ Test patient created successfully!");
    console.log("\n📱 Use these credentials in the mobile app:");
    console.log("   📧 Email: patient@test.com");
    console.log("   🔑 Password: password123");
  } catch (error) {
    console.error("❌ Error creating test patient:", error);
    process.exit(1);
  }

  process.exit(0);
}

createTestPatient();

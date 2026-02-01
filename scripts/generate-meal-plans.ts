#!/usr/bin/env tsx

import { select, confirm, checkbox } from "@inquirer/prompts";
import chalk from "chalk";
import { db } from "../src/db";
import { patients, professionals, users, mealPlans, meals, mealOptions, mealIngredients } from "../src/db/schema";
import { eq } from "drizzle-orm";

interface MealPlanTemplate {
  name: string;
  description: string;
  meals: Array<{
    timeOfDay: string;
    orderIndex: number;
    options: Array<{
      name: string;
      notes?: string;
      ingredients: Array<{
        ingredientName: string;
        quantity: number;
        unit: "g" | "scoops" | "spoons" | "cups" | "ml" | "units";
        orderIndex: number;
      }>;
    }>;
  }>;
}

const mealPlanTemplates: Record<string, MealPlanTemplate> = {
  weightLoss: {
    name: "Weight Loss Plan",
    description: "Calorie-controlled plan for healthy weight loss",
    meals: [
      {
        timeOfDay: "07:00",
        orderIndex: 0,
        options: [
          {
            name: "Protein Oatmeal",
            notes: "High fiber breakfast to keep you full",
            ingredients: [
              { ingredientName: "Rolled oats", quantity: 50, unit: "g", orderIndex: 0 },
              { ingredientName: "Whey protein powder", quantity: 30, unit: "g", orderIndex: 1 },
              { ingredientName: "Banana", quantity: 1, unit: "units", orderIndex: 2 },
              { ingredientName: "Cinnamon", quantity: 1, unit: "spoons", orderIndex: 3 },
              { ingredientName: "Almond milk", quantity: 250, unit: "ml", orderIndex: 4 },
            ],
          },
          {
            name: "Egg White Scramble",
            notes: "Low calorie, high protein option",
            ingredients: [
              { ingredientName: "Egg whites", quantity: 150, unit: "ml", orderIndex: 0 },
              { ingredientName: "Spinach", quantity: 50, unit: "g", orderIndex: 1 },
              { ingredientName: "Tomatoes", quantity: 80, unit: "g", orderIndex: 2 },
              { ingredientName: "Whole wheat toast", quantity: 2, unit: "units", orderIndex: 3 },
            ],
          },
        ],
      },
      {
        timeOfDay: "10:00",
        orderIndex: 1,
        options: [
          {
            name: "Greek Yogurt & Berries",
            ingredients: [
              { ingredientName: "Greek yogurt (low fat)", quantity: 150, unit: "g", orderIndex: 0 },
              { ingredientName: "Mixed berries", quantity: 80, unit: "g", orderIndex: 1 },
              { ingredientName: "Chia seeds", quantity: 1, unit: "spoons", orderIndex: 2 },
            ],
          },
        ],
      },
      {
        timeOfDay: "13:00",
        orderIndex: 2,
        options: [
          {
            name: "Grilled Chicken Salad",
            notes: "Lean protein with vegetables",
            ingredients: [
              { ingredientName: "Chicken breast (grilled)", quantity: 150, unit: "g", orderIndex: 0 },
              { ingredientName: "Mixed greens", quantity: 100, unit: "g", orderIndex: 1 },
              { ingredientName: "Cherry tomatoes", quantity: 80, unit: "g", orderIndex: 2 },
              { ingredientName: "Cucumber", quantity: 50, unit: "g", orderIndex: 3 },
              { ingredientName: "Olive oil", quantity: 1, unit: "spoons", orderIndex: 4 },
              { ingredientName: "Balsamic vinegar", quantity: 1, unit: "spoons", orderIndex: 5 },
            ],
          },
          {
            name: "Turkey Wrap",
            ingredients: [
              { ingredientName: "Whole wheat tortilla", quantity: 1, unit: "units", orderIndex: 0 },
              { ingredientName: "Sliced turkey breast", quantity: 100, unit: "g", orderIndex: 1 },
              { ingredientName: "Lettuce", quantity: 30, unit: "g", orderIndex: 2 },
              { ingredientName: "Avocado", quantity: 50, unit: "g", orderIndex: 3 },
              { ingredientName: "Mustard", quantity: 1, unit: "spoons", orderIndex: 4 },
            ],
          },
        ],
      },
      {
        timeOfDay: "16:00",
        orderIndex: 3,
        options: [
          {
            name: "Apple & Almonds",
            ingredients: [
              { ingredientName: "Apple", quantity: 1, unit: "units", orderIndex: 0 },
              { ingredientName: "Raw almonds", quantity: 20, unit: "g", orderIndex: 1 },
            ],
          },
        ],
      },
      {
        timeOfDay: "19:00",
        orderIndex: 4,
        options: [
          {
            name: "Baked Fish with Vegetables",
            notes: "Light dinner rich in omega-3",
            ingredients: [
              { ingredientName: "Salmon fillet", quantity: 150, unit: "g", orderIndex: 0 },
              { ingredientName: "Broccoli", quantity: 150, unit: "g", orderIndex: 1 },
              { ingredientName: "Sweet potato", quantity: 100, unit: "g", orderIndex: 2 },
              { ingredientName: "Lemon", quantity: 0.5, unit: "units", orderIndex: 3 },
              { ingredientName: "Olive oil", quantity: 1, unit: "spoons", orderIndex: 4 },
            ],
          },
          {
            name: "Chicken Stir-Fry",
            ingredients: [
              { ingredientName: "Chicken breast", quantity: 150, unit: "g", orderIndex: 0 },
              { ingredientName: "Bell peppers", quantity: 100, unit: "g", orderIndex: 1 },
              { ingredientName: "Zucchini", quantity: 100, unit: "g", orderIndex: 2 },
              { ingredientName: "Cauliflower rice", quantity: 150, unit: "g", orderIndex: 3 },
              { ingredientName: "Soy sauce (low sodium)", quantity: 1, unit: "spoons", orderIndex: 4 },
            ],
          },
        ],
      },
    ],
  },
  muscleGain: {
    name: "Muscle Gain Plan",
    description: "High protein, calorie surplus for muscle building",
    meals: [
      {
        timeOfDay: "07:00",
        orderIndex: 0,
        options: [
          {
            name: "Power Breakfast Bowl",
            notes: "High protein and carbs for energy",
            ingredients: [
              { ingredientName: "Whole eggs", quantity: 3, unit: "units", orderIndex: 0 },
              { ingredientName: "Oatmeal", quantity: 80, unit: "g", orderIndex: 1 },
              { ingredientName: "Peanut butter", quantity: 2, unit: "spoons", orderIndex: 2 },
              { ingredientName: "Banana", quantity: 1, unit: "units", orderIndex: 3 },
              { ingredientName: "Whole milk", quantity: 250, unit: "ml", orderIndex: 4 },
            ],
          },
        ],
      },
      {
        timeOfDay: "10:00",
        orderIndex: 1,
        options: [
          {
            name: "Protein Shake",
            notes: "Post-workout or mid-morning",
            ingredients: [
              { ingredientName: "Whey protein", quantity: 2, unit: "scoops", orderIndex: 0 },
              { ingredientName: "Banana", quantity: 1, unit: "units", orderIndex: 1 },
              { ingredientName: "Oats", quantity: 30, unit: "g", orderIndex: 2 },
              { ingredientName: "Almond butter", quantity: 1, unit: "spoons", orderIndex: 3 },
              { ingredientName: "Whole milk", quantity: 300, unit: "ml", orderIndex: 4 },
            ],
          },
        ],
      },
      {
        timeOfDay: "13:00",
        orderIndex: 2,
        options: [
          {
            name: "Beef & Rice Bowl",
            notes: "High protein lunch with complex carbs",
            ingredients: [
              { ingredientName: "Lean beef", quantity: 200, unit: "g", orderIndex: 0 },
              { ingredientName: "Brown rice", quantity: 150, unit: "g", orderIndex: 1 },
              { ingredientName: "Black beans", quantity: 100, unit: "g", orderIndex: 2 },
              { ingredientName: "Avocado", quantity: 80, unit: "g", orderIndex: 3 },
              { ingredientName: "Mixed vegetables", quantity: 100, unit: "g", orderIndex: 4 },
            ],
          },
        ],
      },
      {
        timeOfDay: "16:00",
        orderIndex: 3,
        options: [
          {
            name: "Cottage Cheese & Nuts",
            ingredients: [
              { ingredientName: "Cottage cheese", quantity: 200, unit: "g", orderIndex: 0 },
              { ingredientName: "Mixed nuts", quantity: 30, unit: "g", orderIndex: 1 },
              { ingredientName: "Honey", quantity: 1, unit: "spoons", orderIndex: 2 },
            ],
          },
        ],
      },
      {
        timeOfDay: "19:00",
        orderIndex: 4,
        options: [
          {
            name: "Chicken & Quinoa",
            notes: "Complete proteins for recovery",
            ingredients: [
              { ingredientName: "Chicken breast", quantity: 250, unit: "g", orderIndex: 0 },
              { ingredientName: "Quinoa", quantity: 100, unit: "g", orderIndex: 1 },
              { ingredientName: "Broccoli", quantity: 150, unit: "g", orderIndex: 2 },
              { ingredientName: "Olive oil", quantity: 2, unit: "spoons", orderIndex: 3 },
            ],
          },
        ],
      },
      {
        timeOfDay: "22:00",
        orderIndex: 5,
        options: [
          {
            name: "Casein Shake",
            notes: "Slow-release protein before bed",
            ingredients: [
              { ingredientName: "Casein protein", quantity: 1, unit: "scoops", orderIndex: 0 },
              { ingredientName: "Almond milk", quantity: 250, unit: "ml", orderIndex: 1 },
            ],
          },
        ],
      },
    ],
  },
  vegetarian: {
    name: "Vegetarian Plan",
    description: "Plant-based meals with complete proteins",
    meals: [
      {
        timeOfDay: "07:30",
        orderIndex: 0,
        options: [
          {
            name: "Tofu Scramble",
            notes: "Plant protein breakfast",
            ingredients: [
              { ingredientName: "Firm tofu", quantity: 150, unit: "g", orderIndex: 0 },
              { ingredientName: "Spinach", quantity: 50, unit: "g", orderIndex: 1 },
              { ingredientName: "Bell peppers", quantity: 60, unit: "g", orderIndex: 2 },
              { ingredientName: "Nutritional yeast", quantity: 2, unit: "spoons", orderIndex: 3 },
              { ingredientName: "Whole wheat toast", quantity: 2, unit: "units", orderIndex: 4 },
            ],
          },
          {
            name: "Overnight Oats",
            ingredients: [
              { ingredientName: "Rolled oats", quantity: 60, unit: "g", orderIndex: 0 },
              { ingredientName: "Chia seeds", quantity: 1, unit: "spoons", orderIndex: 1 },
              { ingredientName: "Almond milk", quantity: 200, unit: "ml", orderIndex: 2 },
              { ingredientName: "Mixed berries", quantity: 100, unit: "g", orderIndex: 3 },
              { ingredientName: "Maple syrup", quantity: 1, unit: "spoons", orderIndex: 4 },
            ],
          },
        ],
      },
      {
        timeOfDay: "10:30",
        orderIndex: 1,
        options: [
          {
            name: "Hummus & Veggies",
            ingredients: [
              { ingredientName: "Hummus", quantity: 80, unit: "g", orderIndex: 0 },
              { ingredientName: "Carrot sticks", quantity: 100, unit: "g", orderIndex: 1 },
              { ingredientName: "Cucumber slices", quantity: 80, unit: "g", orderIndex: 2 },
              { ingredientName: "Whole grain crackers", quantity: 30, unit: "g", orderIndex: 3 },
            ],
          },
        ],
      },
      {
        timeOfDay: "13:30",
        orderIndex: 2,
        options: [
          {
            name: "Lentil Buddha Bowl",
            notes: "Complete plant protein meal",
            ingredients: [
              { ingredientName: "Cooked lentils", quantity: 150, unit: "g", orderIndex: 0 },
              { ingredientName: "Quinoa", quantity: 80, unit: "g", orderIndex: 1 },
              { ingredientName: "Sweet potato", quantity: 120, unit: "g", orderIndex: 2 },
              { ingredientName: "Kale", quantity: 50, unit: "g", orderIndex: 3 },
              { ingredientName: "Tahini dressing", quantity: 2, unit: "spoons", orderIndex: 4 },
              { ingredientName: "Chickpeas", quantity: 80, unit: "g", orderIndex: 5 },
            ],
          },
        ],
      },
      {
        timeOfDay: "16:30",
        orderIndex: 3,
        options: [
          {
            name: "Trail Mix",
            ingredients: [
              { ingredientName: "Mixed nuts", quantity: 30, unit: "g", orderIndex: 0 },
              { ingredientName: "Dried fruit", quantity: 20, unit: "g", orderIndex: 1 },
              { ingredientName: "Dark chocolate chips", quantity: 10, unit: "g", orderIndex: 2 },
            ],
          },
        ],
      },
      {
        timeOfDay: "19:30",
        orderIndex: 4,
        options: [
          {
            name: "Veggie Stir-Fry with Tempeh",
            notes: "High protein plant-based dinner",
            ingredients: [
              { ingredientName: "Tempeh", quantity: 150, unit: "g", orderIndex: 0 },
              { ingredientName: "Broccoli", quantity: 100, unit: "g", orderIndex: 1 },
              { ingredientName: "Snap peas", quantity: 80, unit: "g", orderIndex: 2 },
              { ingredientName: "Brown rice", quantity: 100, unit: "g", orderIndex: 3 },
              { ingredientName: "Sesame oil", quantity: 1, unit: "spoons", orderIndex: 4 },
              { ingredientName: "Soy sauce", quantity: 2, unit: "spoons", orderIndex: 5 },
            ],
          },
        ],
      },
    ],
  },
  lowCarb: {
    name: "Low Carb Plan",
    description: "Ketogenic-friendly meals for fat loss",
    meals: [
      {
        timeOfDay: "08:00",
        orderIndex: 0,
        options: [
          {
            name: "Keto Breakfast",
            notes: "High fat, low carb start",
            ingredients: [
              { ingredientName: "Eggs", quantity: 3, unit: "units", orderIndex: 0 },
              { ingredientName: "Bacon", quantity: 50, unit: "g", orderIndex: 1 },
              { ingredientName: "Avocado", quantity: 100, unit: "g", orderIndex: 2 },
              { ingredientName: "Butter", quantity: 1, unit: "spoons", orderIndex: 3 },
              { ingredientName: "Spinach", quantity: 50, unit: "g", orderIndex: 4 },
            ],
          },
        ],
      },
      {
        timeOfDay: "12:00",
        orderIndex: 1,
        options: [
          {
            name: "Bulletproof Coffee",
            ingredients: [
              { ingredientName: "Black coffee", quantity: 300, unit: "ml", orderIndex: 0 },
              { ingredientName: "MCT oil", quantity: 1, unit: "spoons", orderIndex: 1 },
              { ingredientName: "Grass-fed butter", quantity: 1, unit: "spoons", orderIndex: 2 },
            ],
          },
        ],
      },
      {
        timeOfDay: "14:00",
        orderIndex: 2,
        options: [
          {
            name: "Salmon Salad",
            notes: "High fat, moderate protein",
            ingredients: [
              { ingredientName: "Salmon fillet", quantity: 180, unit: "g", orderIndex: 0 },
              { ingredientName: "Mixed greens", quantity: 100, unit: "g", orderIndex: 1 },
              { ingredientName: "Avocado", quantity: 100, unit: "g", orderIndex: 2 },
              { ingredientName: "Olive oil", quantity: 2, unit: "spoons", orderIndex: 3 },
              { ingredientName: "Feta cheese", quantity: 40, unit: "g", orderIndex: 4 },
            ],
          },
        ],
      },
      {
        timeOfDay: "17:00",
        orderIndex: 3,
        options: [
          {
            name: "Keto Snack",
            ingredients: [
              { ingredientName: "Macadamia nuts", quantity: 30, unit: "g", orderIndex: 0 },
              { ingredientName: "Cheese cubes", quantity: 40, unit: "g", orderIndex: 1 },
            ],
          },
        ],
      },
      {
        timeOfDay: "20:00",
        orderIndex: 4,
        options: [
          {
            name: "Ribeye with Butter Vegetables",
            notes: "High fat dinner",
            ingredients: [
              { ingredientName: "Ribeye steak", quantity: 200, unit: "g", orderIndex: 0 },
              { ingredientName: "Asparagus", quantity: 150, unit: "g", orderIndex: 1 },
              { ingredientName: "Butter", quantity: 2, unit: "spoons", orderIndex: 2 },
              { ingredientName: "Mushrooms", quantity: 100, unit: "g", orderIndex: 3 },
            ],
          },
        ],
      },
    ],
  },
  balanced: {
    name: "Balanced Diet Plan",
    description: "Well-rounded nutrition for maintenance",
    meals: [
      {
        timeOfDay: "07:30",
        orderIndex: 0,
        options: [
          {
            name: "Balanced Breakfast",
            ingredients: [
              { ingredientName: "Whole grain toast", quantity: 2, unit: "units", orderIndex: 0 },
              { ingredientName: "Eggs", quantity: 2, unit: "units", orderIndex: 1 },
              { ingredientName: "Avocado", quantity: 60, unit: "g", orderIndex: 2 },
              { ingredientName: "Orange juice", quantity: 150, unit: "ml", orderIndex: 3 },
            ],
          },
        ],
      },
      {
        timeOfDay: "10:30",
        orderIndex: 1,
        options: [
          {
            name: "Fruit & Nuts",
            ingredients: [
              { ingredientName: "Apple", quantity: 1, unit: "units", orderIndex: 0 },
              { ingredientName: "Walnuts", quantity: 20, unit: "g", orderIndex: 1 },
            ],
          },
        ],
      },
      {
        timeOfDay: "13:00",
        orderIndex: 2,
        options: [
          {
            name: "Mediterranean Bowl",
            ingredients: [
              { ingredientName: "Grilled chicken", quantity: 150, unit: "g", orderIndex: 0 },
              { ingredientName: "Brown rice", quantity: 100, unit: "g", orderIndex: 1 },
              { ingredientName: "Mixed vegetables", quantity: 150, unit: "g", orderIndex: 2 },
              { ingredientName: "Olive oil", quantity: 1, unit: "spoons", orderIndex: 3 },
            ],
          },
        ],
      },
      {
        timeOfDay: "16:00",
        orderIndex: 3,
        options: [
          {
            name: "Yogurt Parfait",
            ingredients: [
              { ingredientName: "Greek yogurt", quantity: 150, unit: "g", orderIndex: 0 },
              { ingredientName: "Granola", quantity: 30, unit: "g", orderIndex: 1 },
              { ingredientName: "Berries", quantity: 80, unit: "g", orderIndex: 2 },
            ],
          },
        ],
      },
      {
        timeOfDay: "19:30",
        orderIndex: 4,
        options: [
          {
            name: "Balanced Dinner",
            ingredients: [
              { ingredientName: "Baked fish", quantity: 150, unit: "g", orderIndex: 0 },
              { ingredientName: "Quinoa", quantity: 80, unit: "g", orderIndex: 1 },
              { ingredientName: "Roasted vegetables", quantity: 150, unit: "g", orderIndex: 2 },
              { ingredientName: "Side salad", quantity: 100, unit: "g", orderIndex: 3 },
            ],
          },
        ],
      },
    ],
  },
};

async function generateMealPlans() {
  console.log(chalk.bold.blue("\n🍽️  Generate Meal Plans\n"));

  try {
    // Fetch all patients with their professional info
    const patientsList = await db
      .select({
        patientId: patients.id,
        patientEmail: users.email,
        professionalId: patients.professionalId,
      })
      .from(patients)
      .leftJoin(users, eq(patients.userId, users.id));

    if (patientsList.length === 0) {
      console.log(chalk.yellow("\n⚠ No patients found in the database\n"));
      console.log(chalk.dim("Create a patient first before generating meal plans.\n"));
      process.exit(0);
    }

    // Select patient
    const selectedPatientId = await select({
      message: "Select patient:",
      choices: patientsList.map((p) => ({
        name: `${p.patientEmail} (ID: ${p.patientId})`,
        value: p.patientId,
      })),
    });

    const selectedPatient = patientsList.find((p) => p.patientId === selectedPatientId);

    // Select meal plans to generate
    const selectedPlans = await checkbox({
      message: "Select meal plans to generate:",
      choices: [
        { name: "Weight Loss Plan", value: "weightLoss", checked: true },
        { name: "Muscle Gain Plan", value: "muscleGain" },
        { name: "Vegetarian Plan", value: "vegetarian" },
        { name: "Low Carb Plan", value: "lowCarb" },
        { name: "Balanced Diet Plan", value: "balanced" },
      ],
    });

    if (selectedPlans.length === 0) {
      console.log(chalk.yellow("\n⚠ No meal plans selected\n"));
      process.exit(0);
    }

    console.log(chalk.dim(`\nSelected patient: ${selectedPatient?.patientEmail}`));
    console.log(chalk.dim(`Plans to generate: ${selectedPlans.length}\n`));

    selectedPlans.forEach((planKey) => {
      const plan = mealPlanTemplates[planKey];
      console.log(chalk.dim(`  • ${plan.name} - ${plan.description}`));
    });
    console.log();

    const shouldGenerate = await confirm({
      message: "Generate selected meal plans?",
      default: true,
    });

    if (!shouldGenerate) {
      console.log(chalk.yellow("\n⚠ Cancelled\n"));
      process.exit(0);
    }

    console.log(chalk.dim("\nGenerating meal plans...\n"));

    for (const planKey of selectedPlans) {
      const template = mealPlanTemplates[planKey];

      await db.transaction(async (tx) => {
        // Create meal plan
        const [mealPlan] = await tx
          .insert(mealPlans)
          .values({
            patientId: selectedPatientId!,
            professionalId: selectedPatient!.professionalId,
            name: template.name,
            isActive: false,
          })
          .returning();

        // Create meals with options and ingredients
        for (const mealTemplate of template.meals) {
          const [meal] = await tx
            .insert(meals)
            .values({
              mealPlanId: mealPlan.id,
              timeOfDay: mealTemplate.timeOfDay,
              orderIndex: mealTemplate.orderIndex,
            })
            .returning();

          // Create options for this meal
          for (const optionTemplate of mealTemplate.options) {
            const [option] = await tx
              .insert(mealOptions)
              .values({
                mealId: meal.id,
                name: optionTemplate.name,
                notes: optionTemplate.notes || null,
              })
              .returning();

            // Create ingredients for this option
            const ingredientValues = optionTemplate.ingredients.map((ing) => ({
              mealOptionId: option.id,
              ingredientName: ing.ingredientName,
              quantity: ing.quantity.toString(),
              unit: ing.unit,
              orderIndex: ing.orderIndex,
            }));

            await tx.insert(mealIngredients).values(ingredientValues);
          }
        }

        console.log(chalk.green(`✓ ${template.name} created`));
        console.log(chalk.dim(`  Meals: ${template.meals.length}`));
        console.log(
          chalk.dim(
            `  Total options: ${template.meals.reduce((sum, m) => sum + m.options.length, 0)}\n`
          )
        );
      });
    }

    console.log(chalk.green(`\n✓ Successfully generated ${selectedPlans.length} meal plan(s)\n`));
    console.log(chalk.dim(`Patient ID: ${selectedPatientId}`));
    console.log(chalk.dim(`Plans created: ${selectedPlans.map((k) => mealPlanTemplates[k].name).join(", ")}\n`));

    process.exit(0);
  } catch (error) {
    console.log(chalk.red("\n✗ Error generating meal plans\n"));
    console.error(error);
    process.exit(1);
  }
}

generateMealPlans();

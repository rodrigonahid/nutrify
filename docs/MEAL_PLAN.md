# Meal Plan Feature

## Overview
The Meal Plan feature allows professionals (nutritionists) to create customized meal plans for their patients. Each meal plan consists of multiple meals throughout the day, with each meal offering multiple options and detailed ingredient lists.

## Data Structure

### Meal Plan Hierarchy

```
MealPlan (e.g., "Weekly Plan - January 2026")
  └── Meals (e.g., Breakfast at 08:00, Lunch at 12:30, Dinner at 19:00)
      └── MealOptions (e.g., "Option 1: Chicken with Rice", "Option 2: Fish with Salad")
          └── Ingredients (e.g., "Chicken Breast - 150g", "Brown Rice - 100g")
```

### Database Tables

#### 1. meal_plans
Main table for meal plans.

| Field | Type | Description |
|-------|------|-------------|
| `id` | serial (PK) | Primary key |
| `patientId` | integer (FK) | Patient this plan belongs to |
| `professionalId` | integer (FK) | Professional who created the plan |
| `name` | text | Plan name/title (e.g., "January Meal Plan") |
| `isActive` | boolean | Whether this is the current active plan |
| `createdAt` | timestamp | When the plan was created |
| `updatedAt` | timestamp | Last update timestamp |

**Business Rules:**
- Each patient can have multiple meal plans (history)
- Only one meal plan can be active at a time
- When a new plan is activated, the previous one is automatically deactivated

#### 2. meals
Individual meals within a meal plan (e.g., breakfast, lunch, snack).

| Field | Type | Description |
|-------|------|-------------|
| `id` | serial (PK) | Primary key |
| `mealPlanId` | integer (FK) | Parent meal plan |
| `timeOfDay` | time | Time this meal should be consumed (e.g., "08:00") |
| `orderIndex` | integer | Display order (0, 1, 2...) |
| `createdAt` | timestamp | When created |

**Business Rules:**
- Meals are ordered by `orderIndex` for display
- `timeOfDay` helps patients track when to eat
- Can have multiple meals at the same time (e.g., two breakfast options)

#### 3. meal_options
Alternative options for a meal (allows flexibility and variety).

| Field | Type | Description |
|-------|------|-------------|
| `id` | serial (PK) | Primary key |
| `mealId` | integer (FK) | Parent meal |
| `name` | text | Option name (e.g., "Grilled Chicken with Vegetables") |
| `notes` | text | Additional notes/instructions |
| `createdAt` | timestamp | When created |

**Business Rules:**
- Each meal should have at least one option
- Patients can choose which option to follow each day
- Notes can include preparation instructions or substitutions

#### 4. meal_ingredients
Individual ingredients within a meal option.

| Field | Type | Description |
|-------|------|-------------|
| `id` | serial (PK) | Primary key |
| `mealOptionId` | integer (FK) | Parent meal option |
| `ingredientName` | text | Name of the ingredient (e.g., "Chicken Breast") |
| `weightGrams` | decimal(7,2) | Weight in grams (e.g., 150.00) |
| `orderIndex` | integer | Display order |
| `createdAt` | timestamp | When created |

**Business Rules:**
- Each option should have at least one ingredient
- Weights are always in grams for consistency
- Ingredients are displayed in order of `orderIndex`

### Relationships

```
meal_plans (1) ───< (many) meals
meals (1) ───< (many) meal_options
meal_options (1) ───< (many) meal_ingredients

meal_plans (many) >─── (1) patients
meal_plans (many) >─── (1) professionals
```

## Features

### Professional Side

#### Meal Plan Management Page (`/professional/patients/:patientId/meal-plan`)
- View list of all meal plans for the patient
- See which plan is currently active
- Quick stats: total meals, creation date
- Actions:
  - Create new meal plan
  - View/Edit existing plan
  - Activate/Deactivate plan
  - Delete plan

#### Create Meal Plan Page (`/professional/patients/:patientId/meal-plan/create`)

**Layout:**
1. **Header Section:**
   - Meal plan name/title input
   - Back button to patient detail

2. **Meals Section (Dynamic Rows):**
   - "Add Meal" button to add new meal rows
   - Each meal row contains:
     - Time selector (HH:MM format)
     - "Add Option" button
     - Remove meal button

3. **Meal Options (Nested within each meal):**
   - Each option has:
     - Option name input
     - Notes textarea
     - "Add Ingredient" button
     - Remove option button

4. **Ingredients (Nested within each option):**
   - Each ingredient has:
     - Ingredient name input
     - Weight input (grams)
     - Remove ingredient button

5. **Footer Actions:**
   - Cancel button
   - Save as Draft button (isActive = false)
   - Save and Activate button (isActive = true)

**Example Structure:**
```
Meal Plan Name: [Weekly Plan - January]

Meal #1 - Time: [08:00] [Remove Meal]
  Option 1:
    Name: [Protein Breakfast]
    Notes: [Can substitute eggs for tofu]
    Ingredients:
      - [Scrambled Eggs] [100g] [Remove]
      - [Whole Wheat Toast] [50g] [Remove]
      - [Avocado] [50g] [Remove]
    [Add Ingredient]
  Option 2:
    Name: [Light Breakfast]
    Notes: [Good for busy mornings]
    Ingredients:
      - [Greek Yogurt] [150g] [Remove]
      - [Granola] [30g] [Remove]
    [Add Ingredient]
  [Add Option]

[Add Meal]

[Cancel] [Save as Draft] [Save and Activate]
```

### Patient Side

#### Meal Plan List Page (`/patient/meal-plan`)
- Display all meal plans (most recent first)
- Show creation date and active status
- Each plan card shows:
  - Plan name
  - Created by (nutritionist)
  - Number of meals
  - Active badge (if current plan)
  - Creation date
- Click to view full plan details

#### Meal Plan Detail Page (`/patient/meal-plan/:mealPlanId`)
- Display full meal plan in a structured, easy-to-read format
- Organized by time of day
- Each meal shows:
  - Time
  - All available options
  - Ingredients with weights
  - Notes/instructions
- Daily tracking interface:
  - Checkboxes to mark meals as consumed
  - Track which option was chosen
  - Visual progress indicator

**Example Display:**
```
Weekly Plan - January
Created on January 28, 2026

┌─ 08:00 - Breakfast ─────────────────────┐
│                                          │
│ Option 1: Protein Breakfast              │
│ • Scrambled Eggs (100g)                  │
│ • Whole Wheat Toast (50g)                │
│ • Avocado (50g)                          │
│ Notes: Can substitute eggs for tofu      │
│                                          │
│ Option 2: Light Breakfast                │
│ • Greek Yogurt (150g)                    │
│ • Granola (30g)                          │
│ Notes: Good for busy mornings            │
│                                          │
│ [ ] Mark as consumed                     │
└──────────────────────────────────────────┘

┌─ 12:30 - Lunch ─────────────────────────┐
│ ...                                      │
└──────────────────────────────────────────┘
```

## API Endpoints

### Professional Endpoints

```typescript
// List all meal plans for a patient
GET /api/professional/patients/[patientId]/meal-plan
Response: {
  mealPlans: [
    {
      id: number,
      name: string,
      isActive: boolean,
      createdAt: string,
      mealCount: number
    }
  ]
}

// Create new meal plan (with full nested structure)
POST /api/professional/patients/[patientId]/meal-plan
Body: {
  name: string,
  isActive: boolean,
  meals: [
    {
      timeOfDay: string, // "08:00"
      orderIndex: number,
      options: [
        {
          name: string,
          notes: string,
          ingredients: [
            {
              ingredientName: string,
              weightGrams: number,
              orderIndex: number
            }
          ]
        }
      ]
    }
  ]
}
Response: { mealPlan: MealPlanWithDetails }

// Get full meal plan details
GET /api/professional/patients/[patientId]/meal-plan/[mealPlanId]
Response: {
  mealPlan: {
    id, name, isActive, createdAt,
    meals: [
      {
        id, timeOfDay, orderIndex,
        options: [
          {
            id, name, notes,
            ingredients: [
              { id, ingredientName, weightGrams, orderIndex }
            ]
          }
        ]
      }
    ]
  }
}

// Update meal plan
PUT /api/professional/patients/[patientId]/meal-plan/[mealPlanId]
Body: { same as POST }
Response: { mealPlan: MealPlanWithDetails }

// Delete meal plan
DELETE /api/professional/patients/[patientId]/meal-plan/[mealPlanId]
Response: { success: true }

// Activate/deactivate meal plan
PATCH /api/professional/patients/[patientId]/meal-plan/[mealPlanId]/activate
Body: { isActive: boolean }
Response: { mealPlan: MealPlan }
```

### Patient Endpoints

```typescript
// List own meal plans
GET /api/patient/meal-plan
Response: {
  mealPlans: [
    {
      id, name, isActive, createdAt, mealCount,
      professional: { name, email }
    }
  ]
}

// Get meal plan details (read-only)
GET /api/patient/meal-plan/[mealPlanId]
Response: { mealPlan: MealPlanWithDetails }
```

## Implementation Checklist

### Phase 1: Database & API (Backend)
- [x] Create meal_plans table
- [x] Create meals table
- [x] Create meal_options table
- [x] Create meal_ingredients table
- [x] Add relationships and foreign keys
- [x] Create Zod validation schemas
- [x] Implement professional API endpoints
- [x] Implement patient API endpoints
- [x] Add business logic for active plan management

### Phase 2: Professional UI
- [x] Meal plan list page (`/professional/patients/[patientId]/meal-plan`)
- [x] Create meal plan page with dynamic forms
- [x] Implement add/remove meal functionality
- [x] Implement add/remove option functionality
- [x] Implement add/remove ingredient functionality
- [x] Time picker component
- [x] Save and activate logic

### Phase 3: Patient UI
- [x] Meal plan list page (`/patient/meal-plan`)
- [x] Meal plan detail page
- [ ] Daily tracking interface
- [ ] Meal consumption checkboxes

### Phase 4: Enhancements
- [ ] Duplicate meal plan feature
- [ ] Meal plan templates
- [ ] Nutrition calculator (calories, macros)
- [ ] Print/export meal plan as PDF
- [ ] Shopping list generator
- [ ] Ingredient substitution suggestions

## Business Rules & Validation

### Validation Rules

1. **Meal Plan:**
   - Name is required (max 255 characters)
   - Must belong to a valid patient
   - Can only be created by the patient's assigned professional

2. **Meals:**
   - Must have at least one meal
   - Time format: HH:MM (24-hour)
   - Valid time range: 00:00 to 23:59
   - Order index must be unique within a meal plan

3. **Meal Options:**
   - Each meal must have at least one option
   - Name is required (max 255 characters)
   - Notes are optional (max 2000 characters)

4. **Ingredients:**
   - Each option must have at least one ingredient
   - Ingredient name required (max 255 characters)
   - Weight must be positive (0.01 to 9999.99 grams)

### Active Plan Management

When activating a meal plan:
1. Check if patient has another active plan
2. If yes, deactivate the old plan
3. Activate the new plan
4. Log the change

## Technical Notes

- Use transactions when creating meal plans (all tables must be inserted atomically)
- Consider using React state management (useState/useReducer) for the complex form
- Implement optimistic UI updates for better UX
- Cache active meal plan for patients
- Index on (patientId, isActive) for fast active plan lookup

## Future Features

1. **Meal Plan Scheduling:**
   - Set start and end dates
   - Auto-rotate weekly plans

2. **Nutrition Analysis:**
   - Calculate total calories per meal
   - Track macros (protein, carbs, fats)
   - Micronutrient tracking

3. **Shopping List:**
   - Generate shopping list from meal plan
   - Group by category (produce, dairy, protein)

4. **Meal Swap:**
   - Patient requests meal substitution
   - Professional approves/denies

5. **Recipe Integration:**
   - Link to full recipes
   - Cooking instructions
   - Photos

---

Last Updated: 2026-01-28

## Implementation Status

✅ **Complete** - The meal plan feature is fully functional with:
- Complete database schema with 4 related tables
- Full CRUD API for professionals
- Read-only API for patients
- Professional UI for creating complex meal plans with dynamic forms
- Patient UI for viewing meal plans in a structured format
- Active/inactive meal plan management
- Automatic deactivation of old plans when activating new ones

Remaining features are enhancements for future phases.

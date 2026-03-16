# Feature: Progress Evolution (Comparativo de Avaliações)

**Status:** Planned — not yet implemented
**Last Updated:** 2026-03-14

---

## Overview

A new "Ver evolução" page that displays all progress entries side-by-side as a comparison table, with delta indicators (↑/↓) between consecutive columns. Inspired by the Comparativo de Avaliações pattern common in nutrition software.

- **Patient view:** `/patient/progress/evolution`
- **Professional view:** `/professional/patients/[patientId]/progress/evolution`

Default state: shows the **last 2 entries** (most recent + previous). The user can add more columns up to 5, picking from the available measurement dates.

---

## User Stories

1. **As a patient**, I want to see how my measurements have changed over time in a single table, so I can track my evolution without clicking into each entry individually.
2. **As a nutritionist**, I want to show a patient a side-by-side comparison of their assessments across multiple visits to illustrate their progress.
3. **As a patient/nutritionist**, I want to add more dates to the comparison (up to 5) and remove columns I don't need.

---

## Data Available (no new API routes needed)

The existing endpoints already return all progress fields:

- **Patient:** `GET /api/patient/progress` → returns full `progress[]` array, newest first
- **Professional:** `GET /api/professional/patients/[patientId]/progress` → same structure

All measurement fields are included in the list response. No new API is needed — the page fetches the list once, holds all entries in state, and selects which ones to display as columns.

---

## Page Design

### Layout

```
[← Voltar ao histórico]           [+ Adicionar data]

Parâmetros
┌──────────────────┬────────────┬──────────────────┬──────────────────┐
│                  │ 14/01/2026 │ 09/12/2025       │  04/11/2025  [×] │
├──────────────────┼────────────┼──────────────────┼──────────────────┤
│ Altura (m)       │    1.70    │   1.70           │   1.70           │
│ Peso (kg)        │    70.0    │   67.2 (↓ 2.8)  │   67.4 (↑ 0.2)  │
│ IMC              │    24.2    │   23.0 (↓ 1.2)  │   23.0  —        │
│ % Gordura        │    11.0    │    8.5 (↓ 2.5)  │    9.0 (↑ 0.5)  │
└──────────────────┴────────────┴──────────────────┴──────────────────┘

Circunferências
┌──────────────────┬────────────┬──────────────────┬──────────────────┐
│ Ombro (cm)       │   117.0    │  115.0 (↓ 2.0)  │  115.0  —        │
│ ...              │            │                  │                  │
└──────────────────┴────────────┴──────────────────┴──────────────────┘

Dobras Cutâneas
...
```

### Column behavior
- **Leftmost column:** most recent entry (no delta — it IS the reference)
- **Each subsequent column:** shows value + delta vs the column to its LEFT (i.e., chronological delta)
- Columns ordered newest → oldest (left → right), matching the screenshot pattern
- Max 5 columns; "Adicionar data" button is hidden when 5 are selected
- Each added column (beyond the first two) shows an [×] remove button

### Delta indicators
- Green ↑ / red ↓ for numeric fields, showing the absolute difference (1 decimal place)
- Direction meaning: context-dependent by field (weight ↑ may be good or bad — no color coding needed, just the arrow + number)
- `—` when no delta (first column or field was null in both entries)
- Text fields (no delta shown, just the value)

### Sections
Rows are grouped into 4 sections with a section header:

| Section | Fields |
|---|---|
| **Parâmetros** | Altura, Peso total, IMC, % Gordura corporal, Massa livre de gordura |
| **Circunferências** | Pescoço, Ombro, Tórax, Cintura, Abdômen, Quadril, Bíceps E/D (relaxado/contraído), Antebraço E/D, Pulso E/D, Coxa proximal/medial/distal E/D, Panturrilha E/D |
| **Dobras Cutâneas** | Bíceps, Tríceps, Axilar, Suprailíaca, Abdominal, Subescapular, Peitoral, Coxa, Panturrilha |

Only sections where at least one column has at least one non-null value are rendered. Rows where all columns are null are hidden.

### Date picker (add column)
- A dropdown/sheet appears listing all available dates not yet selected
- Shows the `createdAt` date formatted as `dd/MM/yyyy`
- Selecting a date adds it as the rightmost column

---

## Files to Create

### New pages
- `src/app/patient/progress/evolution/page.tsx`
- `src/app/professional/patients/[patientId]/progress/evolution/page.tsx`

### Shared component
- `src/components/progress-evolution-table.tsx`
  - Props: `entries: Progress[]`, `allEntries: Progress[]`, `onAdd: (id) => void`, `onRemove: (id) => void`
  - Contains all table rendering logic, delta computation, section grouping
  - Used by both patient and professional pages

---

## Files to Modify

| File | Change |
|---|---|
| `src/app/patient/progress/page.tsx` | Add "Ver evolução" button next to page title or header area |
| `src/app/professional/patients/[patientId]/progress/page.tsx` | Same — add "Ver evolução" button |

---

## Implementation Steps

### Step 1 — Shared component skeleton
Create `src/components/progress-evolution-table.tsx` with:
- Type definitions for `FieldDef` (key, label, unit, decimals)
- `SECTIONS` constant mapping section name → list of `FieldDef`
- `computeDelta(current, previous, key)` helper
- Empty table shell with correct structure

### Step 2 — Delta + rendering logic
Inside the component:
- `renderCell(entry, prevEntry, field)` → renders value + delta chip
- Filter out all-null rows
- Filter out all-null sections
- Column header with formatted date + optional remove button

### Step 3 — Date picker / add-column UI
- "Adicionar data" button (hidden when 5 columns active)
- Inline dropdown listing available (not-yet-selected) entries by date
- Selecting adds to `selectedIds` state

### Step 4 — Patient page
- `src/app/patient/progress/evolution/page.tsx`
- Fetches `GET /api/patient/progress` on mount
- Defaults to last 2 entry IDs
- Renders `<ProgressEvolutionTable />`

### Step 5 — Professional page
- `src/app/professional/patients/[patientId]/progress/evolution/page.tsx`
- Fetches `GET /api/professional/patients/[patientId]/progress` on mount
- Same default and component

### Step 6 — Button placement
- Add "Ver evolução" link button to patient progress list page header
- Add same button to professional patient progress list page

### Step 7 — Verification
1. Patient with ≥ 2 progress entries → evolution page shows 2 columns with deltas
2. Patient with 1 entry → evolution page shows 1 column, "Adicionar data" button is disabled or absent
3. Patient with 0 entries → empty state message
4. Add a 3rd column → appears on the right with correct deltas
5. Remove a middle column → remaining columns recalculate correctly
6. Sections/rows with all-null values are hidden
7. Professional view works identically via their route

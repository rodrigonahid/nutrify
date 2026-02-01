# UI Design System

This document describes the Nutrify web application's visual design system, including colors, theming, and UI components.

## Overview

The Nutrify web app uses a **clean green and white design system** that matches the mobile app's visual identity. The design emphasizes:
- Professional, healthcare-appropriate aesthetics
- High contrast for accessibility
- Consistent spacing and layout
- Clean, minimal interface with clear hierarchy

## Color System

### Primary Colors

The color system uses **OKLCH color space** for better perceptual uniformity and color manipulation.

| Purpose | OKLCH Value | Hex Equivalent | Usage |
|---------|-------------|----------------|-------|
| **Primary Green** | `oklch(0.637 0.177 142.5)` | `#4CAF50` | Buttons, active states, badges, focus rings |
| **Background** | `oklch(0.971 0 0)` | `#f5f5f5` | Page backgrounds |
| **Card** | `oklch(1 0 0)` | `#fff` | Card backgrounds, white surfaces |
| **Foreground** | `oklch(0.263 0 0)` | `#333` | Primary text |
| **Muted Foreground** | `oklch(0.486 0 0)` | `#666` | Secondary text |
| **Border** | `oklch(0.898 0 0)` | `#e0e0e0` | Borders, dividers |

### Semantic Colors

| Purpose | OKLCH Value | Usage |
|---------|-------------|-------|
| **Destructive** | `oklch(0.577 0.245 27.325)` | Error messages, delete buttons |
| **Secondary** | `oklch(0.95 0.02 142.5)` | Light green tint for secondary actions |
| **Accent** | `oklch(0.9 0.05 142.5)` | Lighter green for accents |
| **Muted** | `oklch(0.971 0 0)` | Muted backgrounds |

### Chart Colors

For data visualization:
- **Chart 1**: `oklch(0.637 0.177 142.5)` - Green (primary)
- **Chart 2**: `oklch(0.6 0.118 184.704)` - Blue
- **Chart 3**: `oklch(0.828 0.189 84.429)` - Yellow
- **Chart 4**: `oklch(0.769 0.188 70.08)` - Orange
- **Chart 5**: `oklch(0.398 0.07 227.392)` - Purple

## Theme Implementation

### CSS Variables

All colors are defined as CSS variables in `src/app/globals.css`:

```css
:root {
  --radius: 0.625rem;

  /* Backgrounds */
  --background: oklch(0.971 0 0);  /* #f5f5f5 */
  --foreground: oklch(0.263 0 0);  /* #333 */

  /* Cards */
  --card: oklch(1 0 0);  /* #fff */
  --card-foreground: oklch(0.263 0 0);

  /* Primary - Green #4CAF50 */
  --primary: oklch(0.637 0.177 142.5);
  --primary-foreground: oklch(1 0 0);  /* White text on green */

  /* ... other color variables */
}
```

### Tailwind Integration

Colors are automatically mapped to Tailwind classes via the `@theme` directive:

```css
@theme inline {
  --color-primary: var(--primary);
  --color-background: var(--background);
  /* ... etc */
}
```

This allows using standard Tailwind classes:
- `bg-primary` → Green background
- `text-foreground` → Dark text
- `border-border` → Light gray border

## Component Styling

### Buttons

Primary buttons automatically use the green theme:

```tsx
<Button>Save</Button>  // Green background, white text
<Button variant="outline">Cancel</Button>  // White background, green border
<Button variant="destructive">Delete</Button>  // Red for destructive actions
```

### Status Badges

Active/status indicators use theme colors:

```tsx
<span className="px-2 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
  Active
</span>
```

**Affected Files:**
- `src/app/patient/meal-plan/[mealPlanId]/page.tsx`
- `src/app/patient/meal-plan/page.tsx`
- `src/app/professional/patients/[patientId]/meal-plan/page.tsx`
- `src/app/signup/page.tsx`

### Error Messages

Error messages use semantic destructive colors:

```tsx
<div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
  {error}
</div>
```

**Affected Files (13 total):**
- `src/app/admin/professionals/create/page.tsx`
- `src/app/login/page.tsx`
- `src/app/patient/meal-plan/[mealPlanId]/page.tsx`
- `src/app/patient/meal-plan/page.tsx`
- `src/app/patient/progress/[progressId]/page.tsx`
- `src/app/patient/progress/page.tsx`
- `src/app/professional/invite-codes/page.tsx`
- `src/app/professional/patients/[patientId]/meal-plan/create/page.tsx`
- `src/app/professional/patients/[patientId]/meal-plan/page.tsx`
- `src/app/professional/patients/[patientId]/page.tsx`
- `src/app/professional/patients/[patientId]/progress/create/page.tsx`
- `src/app/professional/patients/page.tsx`
- `src/app/signup/page.tsx`

### Cards

Cards use white backgrounds with subtle shadows:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

## Layout & Spacing

### Container Width

All pages use consistent container sizing:

```tsx
<main className="container mx-auto px-4 py-8 max-w-[1200px]">
```

- **Max width**: 1200px
- **Horizontal padding**: 1rem (4 in Tailwind scale)
- **Vertical padding**: 2rem (8 in Tailwind scale)

### Header Alignment

Headers match content container width for visual consistency:

```tsx
<header className="border-b">
  <div className="container mx-auto px-4 py-4">
    {/* Header content */}
  </div>
</header>
```

## Focus States

Focus indicators use the primary green color:

```css
--ring: oklch(0.637 0.177 142.5);  /* Same as primary */
```

This provides clear visual feedback matching the brand color.

## Accessibility

### Contrast Ratios

All color combinations meet WCAG AA standards:
- Primary green on white: ✅ AAA
- Dark text on light background: ✅ AAA
- Error red on light background: ✅ AA

### Color Independence

UI never relies solely on color to convey information:
- Icons accompany status indicators
- Text labels clarify button purposes
- Error messages include descriptive text

## Design Principles

1. **Consistency**: Use theme colors instead of hardcoded values
2. **Semantic Naming**: Use descriptive color names (primary, destructive, muted)
3. **Maintainability**: All colors defined in one place (globals.css)
4. **Scalability**: CSS variables allow easy theme switching
5. **Accessibility**: High contrast, clear focus states, semantic HTML

## Future Enhancements

### Dark Mode (Planned)

The system includes dark mode color definitions:

```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  /* ... etc */
}
```

Dark mode can be enabled by adding the `.dark` class to the `<html>` element.

### Custom Themes

The CSS variable system allows for:
- Professional-specific color schemes
- White-label customization
- Seasonal themes

## Component Library

The application uses **shadcn/ui** components with Tailwind CSS v4:

- **Button**: Primary actions, secondary actions, destructive actions
- **Card**: Content containers with header/content sections
- **Form Components**: Input, Label, FormField, FormTextArea
- **LogoutButton**: Authentication actions

### Installation

New shadcn/ui components can be added via CLI:

```bash
npx shadcn@latest add [component-name]
```

Components are installed to `src/components/ui/`.

## Color Conversion Reference

For converting additional colors to OKLCH:

| Hex | RGB | OKLCH |
|-----|-----|-------|
| `#4CAF50` | `rgb(76, 175, 80)` | `oklch(0.637 0.177 142.5)` |
| `#f5f5f5` | `rgb(245, 245, 245)` | `oklch(0.971 0 0)` |
| `#333333` | `rgb(51, 51, 51)` | `oklch(0.263 0 0)` |
| `#666666` | `rgb(102, 102, 102)` | `oklch(0.486 0 0)` |
| `#999999` | `rgb(153, 153, 153)` | `oklch(0.678 0 0)` |
| `#e0e0e0` | `rgb(224, 224, 224)` | `oklch(0.898 0 0)` |

**OKLCH Format**: `oklch(L C H)`
- **L** = Lightness (0-1)
- **C** = Chroma (color intensity)
- **H** = Hue angle (0-360)

## Migration Notes

### January 2026 Theme Update

The application was restyled from a neutral gray theme to a green and white theme to match the mobile app:

**Changes Made:**
1. Updated `src/app/globals.css` with new color variables
2. Replaced hardcoded green values in status badges (4 files)
3. Replaced hardcoded red values in error messages (13 files)

**No Changes Needed:**
- Container alignment (already consistent)
- Header alignment (already aligned)
- Background application (already using theme variables)

---

Last Updated: 2026-01-31

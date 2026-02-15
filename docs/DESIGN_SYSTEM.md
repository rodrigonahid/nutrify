# Nutrify Design System

> **Approved direction**: Green header panel (auth) + clean white pages + Plus Jakarta Sans.
> All pages implemented. This document is the reference for future work.

---

## 1. Design Philosophy

- **Auth pages**: Green header panel flowing into white form via a concave SVG arc. Green dips in the center like a stadium arch.
- **All other pages**: White background. Green used only in buttons, links, and focus rings.
- **Components**: Minimal styling, typography-led. No dark backgrounds, no decorative blobs.
- **Layout**: Mobile-first. Desktop stays narrow — no multi-column divergence on any screen.

---

## 2. Design Tokens

### Colors

```css
/* Brand greens */
--green:         #2E8B5A;   /* primary — button, links, focus rings, logo accent */
--green-hover:   #277A4F;   /* button hover */
--green-header:  #236B47;   /* auth page header panel only */
--green-ring:    rgba(46, 139, 90, 0.16);   /* focus ring on inputs */
--green-tint:    rgba(46, 139, 90, 0.07);   /* subtle bg tint, use sparingly */

/* Page */
--page-bg:       #F2F4F3;   /* very light gray-green — layout background */
--white:         #FFFFFF;

/* Text */
--ink:           #111827;   /* headings, primary text */
--ink-2:         #374151;   /* labels, secondary dark text */
--mid:           #6B7280;   /* subheadings, body copy */
--muted:         #9CA3AF;   /* placeholders, icon default */

/* Borders & inputs */
--border:        #E5E7EB;   /* default border, card borders, dividers */
--border-hover:  #D1D5DB;   /* hover border */
--input-bg:      #F9FAFB;   /* input default background */

/* Semantic */
--error-bg:      #FEF2F2;
--error-border:  #FECACA;
--error-text:    #DC2626;
```

**Tailwind v4 OKLCH equivalents** (used in `globals.css`):

| Token | Hex | OKLCH |
|-------|-----|-------|
| `--green` | #2E8B5A | `oklch(0.563 0.142 152.6)` |
| `--green-header` | #236B47 | `oklch(0.449 0.114 152.6)` |
| `--ink` | #111827 | `oklch(0.145 0.012 264.3)` |
| `--ink-2` | #374151 | `oklch(0.296 0.018 264.3)` |
| `--mid` | #6B7280 | `oklch(0.487 0.016 264.4)` |
| `--muted` | #9CA3AF | `oklch(0.664 0.012 264.4)` |
| `--border` | #E5E7EB | `oklch(0.920 0.005 264.5)` |
| `--input-bg` | #F9FAFB | `oklch(0.984 0.002 264.5)` |
| `--page-bg` | #F2F4F3 | `oklch(0.961 0.005 152.6)` |

### Typography

Font: **Plus Jakarta Sans** — weights 400 / 500 / 600 / 700 / 800.

```tsx
// src/app/layout.tsx
import { Plus_Jakarta_Sans } from "next/font/google";
const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});
```

Type scale:

| Role | Tailwind classes |
|------|-----------------|
| Page heading (h1) | `text-[22px] font-extrabold tracking-tight text-[#111827]` |
| Section heading | `text-lg font-semibold text-[#111827]` |
| Field label | `text-[14px] font-semibold text-[#374151]` |
| Body / description | `text-sm font-medium text-[#6B7280]` |
| Hint / footnote | `text-xs text-[#9CA3AF]` |

### Spacing & Radius

```
rounded-[10px]  — inputs, buttons, error banners
rounded-xl      — cards (14px)
rounded-[12px]  — inner icon tiles, frosted-glass elements
```

---

## 3. Component Guidelines

### Button

```
Primary:
  bg: #2E8B5A  |  text: white  |  h: 44px  |  radius: 10px
  shadow: 0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(46,139,90,0.22)
  hover: bg #277A4F, translateY(-1px), shadow deepens
  active: scale(0.99), shadow flattens
  loading: show spinner (17px), hide label text

Secondary:
  bg: white  |  border: 1.5px solid #E5E7EB  |  text: #374151
  hover: bg #F9FAFB, border #D1D5DB

Ghost:
  no bg, no border  |  text: #6B7280
  hover: text #111827
```

### Input

```
Default:  bg #F9FAFB  |  border: 1.5px solid #E5E7EB  |  h: 44px  |  radius: 10px
Hover:    border #D1D5DB  |  bg #F3F4F6
Focus:    bg white  |  border #2E8B5A  |  box-shadow: 0 0 0 3px rgba(46,139,90,0.16)
Error:    border #DC2626  |  box-shadow: 0 0 0 3px rgba(220,38,38,0.14)

Label:    14px  font-weight 600  color #374151
```

Auth page inputs include an inline left icon (16px SVG, color `#9CA3AF` → `#2E8B5A` on focus). Password fields include a right-side visibility toggle.

### Card / White Panel

```
border: 1px solid #E5E7EB
border-radius: 12px  (rounded-xl)
background: white
box-shadow: 0 1px 3px rgba(0,0,0,0.06)
```

Navigation / feature cards (clickable) add:
```
hover: border-color #D1D5DB, shadow 0 4px 12px rgba(0,0,0,0.08), translateY(-1px)
transition: all 0.15s
```

### Row List Pattern

Used on most list pages (patients, sessions, workouts, progress, etc.):

```
Outer:  bg-white border border-[#E5E7EB] rounded-xl overflow-hidden
Rows:   divide-y divide-[#F3F4F6]
Row:    px-4 py-3.5 hover:bg-[#F9FAFB] transition-colors duration-100
```

### Status Badges

```
Active / success:  text-[#2E8B5A]  bg-[rgba(46,139,90,0.08)]
Assigned:          text-[#2563EB]  bg-[rgba(37,99,235,0.08)]
Error:             text-[#DC2626]  bg-[#FEF2F2]
Neutral:           text-[#6B7280]  bg-[#F3F4F6]

All:  text-[11px] font-semibold  px-2.5 py-0.5 rounded-full
```

### Filter Pills

Active: `bg-[#111827] text-white`
Inactive: `bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]`

Always use `g.id` (not `g.name`) as the React `key` when rendering from data.

### Skeleton Loading

Use `animate-pulse` placeholder elements — never full-page spinners. Pattern:

```tsx
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-36 bg-[#F3F4F6] rounded" />
        <div className="h-3 w-52 bg-[#F3F4F6] rounded" />
      </div>
    </div>
  );
}
```

### Error Banner

```tsx
<div className="flex items-center gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] px-4 py-3 text-[13.5px] font-semibold text-[#DC2626]">
  {error}
</div>
```

### Auth Page Layout

```
Card wrapper:
  max-width: 428px  |  border-radius: 24px  |  overflow: hidden
  shadow: layered green-tinted shadow

Header section (green):
  background: #236B47
  padding: 0  ← zero padding so SVG arc reaches edges
  Contains: .header-inner with 40px horizontal padding (logo + tagline)
  Bottom: SVG concave arc
    viewBox="0 0 428 72"
    path: M0 0 Q214 72 428 0 L428 72 L0 72 Z  fill="white"
    width: 100%, margin-bottom: -2px

Logo inside header:
  Frosted-glass tile: bg rgba(255,255,255,0.14), border rgba(255,255,255,0.20), radius 12px
  Wordmark: Plus Jakarta Sans 800, white, opacity 0.55 on the "fy" suffix

Form section (white):
  padding: 30px 40px 40px
```

### Navigation

- **Desktop** (≥ 768px): Left mini-rail, 56px wide, icons only.
- **Mobile**: Bottom tab bar + top header.
- Active: `#2E8B5A`. Inactive: `#6B7280`.
- Implemented via role-specific layout components in `src/app/[role]/layout.tsx`.

### Page Wrapper

All content pages use:
```tsx
<div className="p-4 md:p-8 max-w-[900px]">
```
Form/detail pages may use a narrower `max-w-[680px]` or `max-w-[640px]`.

Back links:
```tsx
<Link href="..." className="inline-flex items-center gap-1 text-[13px] text-[#9CA3AF] hover:text-[#374151] transition-colors duration-100 mb-6">
  ← Back to ...
</Link>
```

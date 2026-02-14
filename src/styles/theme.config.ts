/**
 * Global Style Configuration
 * Edit these values to customize your app's theme
 */

export const themeConfig = {
  // Border Radius
  radius: {
    default: "0.625rem", // 10px - applied globally
    sm: "calc(var(--radius) - 4px)",
    md: "calc(var(--radius) - 2px)",
    lg: "var(--radius)",
    xl: "calc(var(--radius) + 4px)",
    "2xl": "calc(var(--radius) + 8px)",
    "3xl": "calc(var(--radius) + 12px)",
    "4xl": "calc(var(--radius) + 16px)",
  },

  // Typography
  fonts: {
    sans: "var(--font-plus-jakarta-sans)",
  },

  // Light Mode Colors (OKLCH format)
  lightMode: {
    background: "oklch(0.961 0.005 152.6)", // Page bg #F2F4F3
    foreground: "oklch(0.145 0.012 264.3)", // Ink #111827
    primary: "oklch(0.563 0.142 152.6)", // Green #2E8B5A
    primaryForeground: "oklch(1 0 0)", // White
    secondary: "oklch(0.984 0.002 264.5)", // Input bg #F9FAFB
    secondaryForeground: "oklch(0.296 0.018 264.3)", // #374151
    muted: "oklch(0.984 0.002 264.5)", // #F9FAFB
    mutedForeground: "oklch(0.487 0.016 264.4)", // Mid #6B7280
    accent: "oklch(0.920 0.005 264.5)", // Border #E5E7EB
    accentForeground: "oklch(0.145 0.012 264.3)", // Ink
    destructive: "oklch(0.577 0.245 27.325)", // Red
    border: "oklch(0.920 0.005 264.5)", // #E5E7EB
    input: "oklch(0.920 0.005 264.5)", // #E5E7EB
    ring: "oklch(0.563 0.142 152.6)", // Green #2E8B5A
    card: "oklch(1 0 0)", // White
    cardForeground: "oklch(0.145 0.012 264.3)", // Ink
    popover: "oklch(1 0 0)", // White
    popoverForeground: "oklch(0.145 0.012 264.3)", // Ink
  },

  // Dark Mode Colors (OKLCH format)
  darkMode: {
    background: "oklch(0.145 0 0)", // Near black
    foreground: "oklch(0.985 0 0)", // Almost white
    primary: "oklch(0.922 0 0)", // Light gray
    primaryForeground: "oklch(0.205 0 0)", // Dark gray
    secondary: "oklch(0.269 0 0)", // Dark gray
    secondaryForeground: "oklch(0.985 0 0)", // Almost white
    muted: "oklch(0.269 0 0)", // Dark gray
    mutedForeground: "oklch(0.708 0 0)", // Medium-light gray
    accent: "oklch(0.269 0 0)", // Dark gray
    accentForeground: "oklch(0.985 0 0)", // Almost white
    destructive: "oklch(0.704 0.191 22.216)", // Red
    border: "oklch(1 0 0 / 10%)", // Translucent white
    input: "oklch(1 0 0 / 15%)", // Translucent white
    ring: "oklch(0.556 0 0)", // Medium gray
    card: "oklch(0.205 0 0)", // Dark gray
    cardForeground: "oklch(0.985 0 0)", // Almost white
    popover: "oklch(0.205 0 0)", // Dark gray
    popoverForeground: "oklch(0.985 0 0)", // Almost white
  },

  // Chart Colors
  charts: {
    light: {
      chart1: "oklch(0.646 0.222 41.116)",
      chart2: "oklch(0.6 0.118 184.704)",
      chart3: "oklch(0.398 0.07 227.392)",
      chart4: "oklch(0.828 0.189 84.429)",
      chart5: "oklch(0.769 0.188 70.08)",
    },
    dark: {
      chart1: "oklch(0.488 0.243 264.376)",
      chart2: "oklch(0.696 0.17 162.48)",
      chart3: "oklch(0.769 0.188 70.08)",
      chart4: "oklch(0.627 0.265 303.9)",
      chart5: "oklch(0.645 0.246 16.439)",
    },
  },

  // Sidebar Colors
  sidebar: {
    light: {
      background: "oklch(0.985 0 0)",
      foreground: "oklch(0.145 0 0)",
      primary: "oklch(0.205 0 0)",
      primaryForeground: "oklch(0.985 0 0)",
      accent: "oklch(0.97 0 0)",
      accentForeground: "oklch(0.205 0 0)",
      border: "oklch(0.922 0 0)",
      ring: "oklch(0.708 0 0)",
    },
    dark: {
      background: "oklch(0.205 0 0)",
      foreground: "oklch(0.985 0 0)",
      primary: "oklch(0.488 0.243 264.376)",
      primaryForeground: "oklch(0.985 0 0)",
      accent: "oklch(0.269 0 0)",
      accentForeground: "oklch(0.985 0 0)",
      border: "oklch(1 0 0 / 10%)",
      ring: "oklch(0.556 0 0)",
    },
  },
} as const;

/**
 * How to use OKLCH colors:
 *
 * OKLCH format: oklch(lightness chroma hue / alpha)
 * - Lightness (0-1): 0 = black, 1 = white
 * - Chroma (0-0.4): color intensity, 0 = grayscale
 * - Hue (0-360): color angle, e.g., 0 = red, 120 = green, 240 = blue
 * - Alpha (optional): 0-1 or percentage
 *
 * Examples:
 * - oklch(0.5 0.2 250) - Medium blue
 * - oklch(0.7 0.15 140) - Light green
 * - oklch(0.3 0.1 30) - Dark orange
 * - oklch(1 0 0 / 50%) - 50% transparent white
 *
 * Use https://oklch.com to pick colors visually
 */

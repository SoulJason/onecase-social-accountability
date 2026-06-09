// Design tokens — the single source of truth for the visual language.
// Tailwind/NativeWind mirrors these in tailwind.config.js; use these when you
// need raw values in JS (e.g. animations, canvas, charts).

export const colors = {
  blueberry: "#7189FF",
  cerulean: "#758ECD",
  apple: "#96DE90",
  danger: "#FF5858",
  ink: "#1a1a1a",
  cream: "#FFFCF7",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

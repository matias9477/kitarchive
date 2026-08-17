/**
 * "Deep Pitch" palette from DESIGN.md — the app ships dark-only; this is the
 * single source of truth for color. Keys are semantic, not literal.
 */
export const palette = {
  // Surfaces (tonal layering, level 0 → highest)
  background: "#101415",
  surfaceContainerLowest: "#0b0f10",
  surfaceContainerLow: "#191c1e",
  surfaceContainer: "#1d2022",
  surfaceContainerHigh: "#272a2c",
  surfaceContainerHighest: "#323537",
  surfaceBright: "#363a3b",

  // Content
  onSurface: "#e0e3e5",
  onSurfaceVariant: "#c6c6cd",
  outline: "#909097",
  outlineVariant: "#45464d",
  inverseSurface: "#e0e3e5",
  inverseOnSurface: "#2d3133",

  // Primary (steel blue — structural emphasis)
  primary: "#bec6e0",
  onPrimary: "#283044",
  primaryContainer: "#0f172a",
  onPrimaryContainer: "#798098",

  // Secondary (vibrant blue — the action color)
  secondary: "#b4c5ff",
  onSecondary: "#002a78",
  secondaryContainer: "#0053db",
  onSecondaryContainer: "#cdd7ff",

  // Tertiary (gold — achievement / prestige accent)
  tertiary: "#efc200",
  onTertiary: "#3c2f00",
  tertiaryContainer: "#cea700",
  onTertiaryContainer: "#4e3e00",

  // Error
  error: "#ffb4ab",
  onError: "#690005",
  errorContainer: "#93000a",
  onErrorContainer: "#ffdad6",
} as const;

export type Palette = typeof palette;

/** Legacy accent kept for android adaptive-icon config parity. */
export const colors = {
  accent: palette.tertiary,
};

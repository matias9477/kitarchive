/** 4px-baseline spacing scale from DESIGN.md. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  /** Horizontal screen padding on mobile. */
  screen: 16,
  /** Grid gutter. */
  gutter: 12,
} as const;

/** "Sophisticated Softness" radii. Inner radius should be 4–8px under its container's. */
export const radius = {
  sm: 4,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export type Spacing = typeof spacing;
export type Radius = typeof radius;

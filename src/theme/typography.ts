import type { TextStyle } from "react-native";

/**
 * Dual-sans system from DESIGN.md: Sora for display/headings/numerals,
 * Inter for functional UI. Font families are the exact names registered by
 * @expo-google-fonts in App.tsx — keep both in sync.
 */
export const fonts = {
  soraExtraBold: "Sora_800ExtraBold",
  soraBold: "Sora_700Bold",
  soraSemiBold: "Sora_600SemiBold",
  interRegular: "Inter_400Regular",
  interMedium: "Inter_500Medium",
  interSemiBold: "Inter_600SemiBold",
} as const;

export const typography = {
  /** Big numerals / hero counts. */
  display: {
    fontFamily: fonts.soraExtraBold,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  /** Screen titles (headline-lg-mobile). */
  headline: {
    fontFamily: fonts.soraBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.24,
  },
  /** Section / card titles. */
  title: {
    fontFamily: fonts.soraSemiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  /** Emphasized inline data (years, kit numbers). */
  titleSm: {
    fontFamily: fonts.soraSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  bodyLg: {
    fontFamily: fonts.interRegular,
    fontSize: 18,
    lineHeight: 28,
  },
  body: {
    fontFamily: fonts.interRegular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySm: {
    fontFamily: fonts.interRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  /** "Technical spec" labels — pair with uppercase text. */
  label: {
    fontFamily: fonts.interSemiBold,
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.65,
    textTransform: "uppercase" as const,
  },
  labelSm: {
    fontFamily: fonts.interMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
} satisfies Record<string, TextStyle>;

export type Typography = typeof typography;

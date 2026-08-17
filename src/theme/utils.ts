import { palette, type Palette } from "./colors";
import { typography, type Typography } from "./typography";
import { spacing, radius, type Spacing, type Radius } from "./layout";

export interface Theme {
  colors: Palette;
  typography: Typography;
  spacing: Spacing;
  radius: Radius;
  /** Always true — the app ships dark-only (see DESIGN.md). Kept so a light
   * palette can be reintroduced without touching call sites. */
  isDarkMode: boolean;
}

const theme: Theme = {
  colors: palette,
  typography,
  spacing,
  radius,
  isDarkMode: true,
};

export type ThemeColors = Palette;

export const getThemeColors = (): Palette => palette;

/** Single dark theme. Hook-shaped so theming can become dynamic later. */
export const useTheme = (): Theme => theme;

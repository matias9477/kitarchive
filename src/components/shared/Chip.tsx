import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

export type ChipTone = "neutral" | "gold" | "blue" | "error" | "outline";

interface ChipProps {
  label: string;
  tone?: ChipTone;
}

/** Pill status chip ("Authentic", "Deadstock", "2 owned"…) per DESIGN.md. */
export const Chip: React.FC<ChipProps> = ({ label, tone = "neutral" }) => {
  const { colors, radius } = useTheme();

  const palette: Record<ChipTone, { bg: string; fg: string; border?: string }> =
    {
      neutral: {
        bg: colors.surfaceContainerHighest,
        fg: colors.onSurfaceVariant,
      },
      gold: { bg: colors.tertiary, fg: colors.onTertiary },
      blue: { bg: colors.secondaryContainer, fg: "#ffffff" },
      error: { bg: colors.errorContainer, fg: colors.onErrorContainer },
      outline: {
        bg: "transparent",
        fg: colors.onSurfaceVariant,
        border: colors.outlineVariant,
      },
    };
  const { bg, fg, border } = palette[tone];

  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: bg, borderRadius: radius.full },
        border ? { borderWidth: 1, borderColor: border } : null,
      ]}
    >
      <AppText variant="labelSm" color={fg}>
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
});

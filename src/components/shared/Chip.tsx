import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

export type ChipTone =
  "neutral" | "gold" | "goldSoft" | "blue" | "error" | "outline";

interface ChipProps {
  label: string;
  tone?: ChipTone;
  icon?: keyof typeof Ionicons.glyphMap;
}

/** Pill status chip ("Authentic", "Deadstock", "2 owned"…) per DESIGN.md. */
export const Chip: React.FC<ChipProps> = ({
  label,
  tone = "neutral",
  icon,
}) => {
  const { colors, radius } = useTheme();

  const palette: Record<ChipTone, { bg: string; fg: string; border?: string }> =
    {
      neutral: {
        bg: colors.surfaceContainerHighest,
        fg: colors.onSurfaceVariant,
      },
      gold: { bg: colors.tertiary, fg: colors.onTertiary },
      // Dark gold pill with gold border + text — the "Owned" badge look.
      goldSoft: {
        bg: colors.onTertiary,
        fg: colors.tertiary,
        border: `${colors.tertiary}59`,
      },
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
      {icon ? <Ionicons name={icon} size={12} color={fg} /> : null}
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
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
});

import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

interface StatRowProps {
  label: string;
  value: string;
  onPress: () => void;
  labelVariant?: "titleSm" | "bodySm";
}

/** Tappable list row: label left, highlighted value right ("Boca · 12"). */
export const StatRow: React.FC<StatRowProps> = ({
  label,
  value,
  onPress,
  labelVariant = "titleSm",
}) => {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, { backgroundColor: colors.surfaceContainer }]}
    >
      <AppText variant={labelVariant} numberOfLines={1} style={styles.label}>
        {label}
      </AppText>
      <AppText variant="titleSm" color={colors.tertiary}>
        {value}
      </AppText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  label: { flex: 1 },
});

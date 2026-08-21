import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

interface ExpandToggleProps {
  expanded: boolean;
  onToggle: () => void;
  showAllLabel: string;
  showLessLabel: string;
}

/** "Show all / show less" footer for capped home-screen sections. */
export const ExpandToggle: React.FC<ExpandToggleProps> = ({
  expanded,
  onToggle,
  showAllLabel,
  showLessLabel,
}) => {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      style={styles.row}
    >
      <AppText variant="labelSm" color={colors.secondary}>
        {expanded ? showLessLabel : showAllLabel}
      </AppText>
      <Ionicons
        name={expanded ? "chevron-up" : "chevron-down"}
        size={14}
        color={colors.secondary}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 2,
  },
});

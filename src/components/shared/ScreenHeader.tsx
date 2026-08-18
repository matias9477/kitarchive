import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

interface ScreenHeaderProps {
  title: string;
  /** Trailing icon buttons. */
  children?: React.ReactNode;
}

/** Tab-screen title row with trailing actions. */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  children,
}) => {
  const { spacing } = useTheme();
  return (
    <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
      <AppText variant="headline">{title}</AppText>
      <View style={styles.actions}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  actions: { flexDirection: "row", gap: 16 },
});

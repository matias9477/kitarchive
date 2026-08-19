import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

interface GroupRowProps {
  title: string;
  subtitle: string;
  /** Rendered before the title (flag, icon…). */
  leading?: React.ReactNode;
  onPress: () => void;
}

/** Drill-down list row for Explore groups (countries, confederations). */
export const GroupRow: React.FC<GroupRowProps> = ({
  title,
  subtitle,
  leading,
  onPress,
}) => {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.surfaceContainer,
          borderRadius: radius.md,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.text}>
        <AppText variant="titleSm" numberOfLines={1}>
          {title}
        </AppText>
        <AppText variant="labelSm" color={colors.onSurfaceVariant}>
          {subtitle}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.outline} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  leading: { alignItems: "center", justifyContent: "center", minWidth: 28 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  text: { flex: 1, gap: 2 },
});

import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

interface StatTileProps {
  value: string | number;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Featured tile: deep-navy container with gold icon/label (DESIGN.md). */
  highlight?: boolean;
  onPress?: () => void;
}

/** Dashboard stat: icon, big Sora numeral, technical-spec label. */
export const StatTile: React.FC<StatTileProps> = ({
  value,
  label,
  icon,
  highlight = false,
  onPress,
}) => {
  const { colors, radius, spacing } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: highlight
            ? colors.primaryContainer
            : colors.surfaceContainer,
          borderRadius: radius.lg,
          padding: spacing.md,
          opacity: pressed ? 0.85 : 1,
        },
        highlight
          ? { borderWidth: 1, borderColor: colors.onPrimaryContainer }
          : null,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={20}
          color={highlight ? colors.tertiary : colors.onSurfaceVariant}
        />
      ) : null}
      <AppText variant="display" style={styles.value}>
        {String(value)}
      </AppText>
      <AppText
        variant="label"
        color={highlight ? colors.tertiary : colors.onSurfaceVariant}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tile: { flex: 1, gap: 4 },
  value: { marginTop: 8 },
});

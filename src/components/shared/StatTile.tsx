import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

interface StatTileProps {
  value: string | number;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Featured tile: deep-navy container with gold icon/label (DESIGN.md). */
  highlight?: boolean;
}

/** Dashboard stat: icon, big Sora numeral, technical-spec label. */
export const StatTile: React.FC<StatTileProps> = ({
  value,
  label,
  icon,
  highlight = false,
}) => {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: highlight
            ? colors.primaryContainer
            : colors.surfaceContainer,
          borderRadius: radius.lg,
          padding: spacing.md,
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
    </View>
  );
};

const styles = StyleSheet.create({
  tile: { flex: 1, gap: 4 },
  value: { marginTop: 8 },
});

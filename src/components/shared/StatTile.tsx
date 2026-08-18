import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

interface StatTileProps {
  value: string | number;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Featured tile: navy gradient, gold accents, ambient glow (DESIGN.md). */
  highlight?: boolean;
  onPress?: () => void;
}

/**
 * Dashboard stat: compact row — tinted icon chip beside a Sora numeral and
 * its technical-spec label — on a subtle tonal gradient that lifts the tile
 * off the near-black background.
 */
export const StatTile: React.FC<StatTileProps> = ({
  value,
  label,
  icon,
  highlight = false,
  onPress,
}) => {
  const { colors, radius, spacing } = useTheme();

  const accent = highlight ? colors.tertiary : colors.secondary;
  const gradient: [string, string] = highlight
    ? [colors.primaryContainer, colors.surfaceContainerLowest]
    : [colors.surfaceContainerHigh, colors.surfaceContainerLow];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={({ pressed }) => [
        styles.tile,
        {
          borderRadius: radius.lg,
          borderColor: highlight
            ? `${colors.tertiary}3d`
            : `${colors.outlineVariant}66`,
          opacity: pressed ? 0.85 : 1,
        },
        // Ambient glow — stadium-light blue, diffused (DESIGN.md shadows).
        highlight
          ? {
              shadowColor: colors.secondary,
              shadowOpacity: 0.15,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 8 },
              elevation: 6,
            }
          : null,
      ]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radius.lg }]}
      />
      <View style={[styles.content, { padding: spacing.gutter }]}>
        {icon ? (
          <View
            style={[
              styles.iconChip,
              {
                backgroundColor: `${accent}1a`,
                borderRadius: radius.md - 2,
              },
            ]}
          >
            <Ionicons name={icon} size={16} color={accent} />
          </View>
        ) : null}
        <View style={styles.text}>
          <AppText variant="headline" numberOfLines={1}>
            {String(value)}
          </AppText>
          <AppText
            variant="labelSm"
            color={highlight ? colors.tertiary : colors.onSurfaceVariant}
            numberOfLines={1}
          >
            {label}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tile: { flex: 1, borderWidth: 1, overflow: "hidden" },
  content: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconChip: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1 },
});

import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

interface StatTileProps {
  value: string | number;
  label: string;
  accent?: boolean;
}

/** Dashboard stat: big Sora numeral over a technical-spec label. */
export const StatTile: React.FC<StatTileProps> = ({
  value,
  label,
  accent = false,
}) => {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: colors.surfaceContainer,
          borderRadius: radius.lg,
          padding: spacing.md,
        },
      ]}
    >
      <AppText
        variant="display"
        color={accent ? colors.tertiary : colors.onSurface}
      >
        {String(value)}
      </AppText>
      <AppText variant="labelSm" color={colors.onSurfaceVariant}>
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: { flex: 1, gap: 4 },
});

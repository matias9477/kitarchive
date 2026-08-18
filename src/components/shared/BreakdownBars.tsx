import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

interface Bucket {
  key: string;
  label: string;
  count: number;
}

interface BreakdownBarsProps {
  title: string;
  buckets: Bucket[];
}

/**
 * Alpha steps over the dark surface turn one hue into a lightness ramp —
 * buckets are ordered (by count or chronology), so sequential shades of a
 * single hue encode them without a categorical palette.
 */
const ALPHAS = ["ff", "c9", "99", "70", "4d", "33"];

/**
 * Minimal one-line breakdown: a single stacked bar split proportionally per
 * bucket, with a dot legend underneath. Identity lives in the legend text;
 * the bar only shows shares.
 */
export const BreakdownBars: React.FC<BreakdownBarsProps> = ({
  title,
  buckets,
}) => {
  const { colors, radius } = useTheme();
  const shade = (index: number) =>
    `${colors.secondary}${ALPHAS[Math.min(index, ALPHAS.length - 1)]}`;

  return (
    <View style={{ gap: 6 }}>
      <AppText variant="labelSm" color={colors.onSurfaceVariant}>
        {title}
      </AppText>
      <View style={[styles.bar, { borderRadius: radius.full }]}>
        {buckets.map((bucket, index) => (
          <View
            key={bucket.key}
            style={{ flexGrow: bucket.count, backgroundColor: shade(index) }}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {buckets.map((bucket, index) => (
          <View key={bucket.key} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: shade(index) }]} />
            <AppText variant="labelSm" color={colors.onSurfaceVariant}>
              {bucket.label}
            </AppText>
            <AppText variant="labelSm" color={colors.onSurface}>
              {bucket.count}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // 2px surface gaps between segments; outer corners rounded by the wrap.
  bar: { flexDirection: "row", height: 8, overflow: "hidden", gap: 2 },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 12,
    rowGap: 4,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});

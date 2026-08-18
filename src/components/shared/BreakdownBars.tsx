import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";
import { ProgressBar } from "./ProgressBar";

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
 * Bar-list breakdown ("By type"…): one thin bar per bucket scaled to the
 * group max, label left, count right. Single hue — identity lives in the
 * label, magnitude in the bar.
 */
export const BreakdownBars: React.FC<BreakdownBarsProps> = ({
  title,
  buckets,
}) => {
  const { colors, spacing } = useTheme();
  const max = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <View style={{ gap: spacing.xs }}>
      <AppText variant="labelSm" color={colors.onSurfaceVariant}>
        {title}
      </AppText>
      <View style={{ gap: spacing.xs }}>
        {buckets.map((bucket) => (
          <View key={bucket.key} style={styles.row}>
            <AppText
              variant="bodySm"
              numberOfLines={1}
              style={styles.label}
              color={colors.onSurface}
            >
              {bucket.label}
            </AppText>
            <View style={styles.bar}>
              <ProgressBar
                value={bucket.count}
                total={max}
                color={colors.secondaryContainer}
              />
            </View>
            <AppText variant="titleSm" style={styles.count}>
              {bucket.count}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  // Fixed label column so every bar shares the same baseline.
  label: { width: 92 },
  bar: { flex: 1 },
  count: { minWidth: 28, textAlign: "right" },
});

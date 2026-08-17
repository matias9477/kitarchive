import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/index";

interface ProgressBarProps {
  value: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, total }) => {
  const { colors, radius } = useTheme();
  const ratio = total > 0 ? Math.min(1, value / total) : 0;
  return (
    <View
      style={[
        styles.track,
        {
          backgroundColor: colors.surfaceContainerHighest,
          borderRadius: radius.full,
        },
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            backgroundColor:
              ratio >= 1 ? colors.tertiary : colors.secondaryContainer,
            borderRadius: radius.full,
            width: `${ratio * 100}%`,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: { height: 6, overflow: "hidden" },
  fill: { height: "100%" },
});

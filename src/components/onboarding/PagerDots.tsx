import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/index";

interface PagerDotsProps {
  count: number;
  activeIndex: number;
}

/** Page indicator for the onboarding pager. */
export const PagerDots: React.FC<PagerDotsProps> = ({ count, activeIndex }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === activeIndex
              ? { backgroundColor: colors.secondary, width: 20 }
              : { backgroundColor: colors.outlineVariant },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});

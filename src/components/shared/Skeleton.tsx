import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "@/theme/index";

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Pulsing placeholder block shown while a screen's data loads. */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 16,
  borderRadius,
  style,
}) => {
  const { colors, radius } = useTheme();
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: borderRadius ?? radius.sm + 4,
          backgroundColor: colors.surfaceContainerHigh,
          opacity,
        },
        style,
      ]}
    />
  );
};

interface SkeletonListProps {
  rows?: number;
}

/** Stack of list-row placeholders (thumbnail + two lines), like a KitTile row. */
export const SkeletonList: React.FC<SkeletonListProps> = ({ rows = 6 }) => {
  const { colors, spacing, radius } = useTheme();
  return (
    <View style={{ gap: spacing.xs }}>
      {Array.from({ length: rows }, (_, index) => (
        <View
          key={index}
          style={[
            styles.row,
            {
              backgroundColor: colors.surfaceContainer,
              borderRadius: radius.md,
            },
          ]}
        >
          <Skeleton width={44} height={56} borderRadius={radius.sm} />
          <View style={styles.lines}>
            <Skeleton width="55%" height={14} />
            <Skeleton width="35%" height={10} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  lines: { flex: 1, gap: 6 },
});

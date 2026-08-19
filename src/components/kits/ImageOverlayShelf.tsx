import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";

interface ImageOverlayShelfProps {
  /** Small pills above the title (era, kit type, manufacturer…). */
  labels: string[];
  title: string;
  titleVariant?: "title" | "headline";
  /** Makes the title a link (chevron affordance) — e.g. to the team page. */
  onTitlePress?: (() => void) | undefined;
}

/**
 * Bottom vignette + metadata shelf laid over kit imagery (DESIGN.md image
 * treatment). Render inside a rounded `overflow: "hidden"` container, after
 * the image; it ignores touches so taps reach the image below — except the
 * title when onTitlePress is set.
 */
export const ImageOverlayShelf: React.FC<ImageOverlayShelfProps> = ({
  labels,
  title,
  titleVariant = "title",
  onTitlePress,
}) => {
  const { colors, radius } = useTheme();

  const pills = (
    <View style={styles.pills}>
      {labels.map((label) => (
        <View key={label} style={[styles.pill, { borderRadius: radius.sm + 2 }]}>
          <AppText variant="labelSm">{label}</AppText>
        </View>
      ))}
    </View>
  );

  if (!onTitlePress) {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["transparent", "rgba(11,15,16,0.55)", "rgba(11,15,16,0.92)"]}
          locations={[0.45, 0.75, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.shelf}>
          {pills}
          <AppText variant={titleVariant} numberOfLines={1}>
            {title}
          </AppText>
        </View>
      </View>
    );
  }

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        pointerEvents="none"
        colors={["transparent", "rgba(11,15,16,0.55)", "rgba(11,15,16,0.92)"]}
        locations={[0.45, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="box-none" style={styles.shelf}>
        <View pointerEvents="none">{pills}</View>
        <Pressable
          onPress={onTitlePress}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [
            styles.titleRow,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <AppText
            variant={titleVariant}
            numberOfLines={1}
            style={styles.titleText}
          >
            {title}
          </AppText>
          <Ionicons name="chevron-forward" size={16} color={colors.onSurface} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shelf: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    gap: 6,
  },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pill: {
    backgroundColor: "rgba(11,15,16,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  // Hug the title so taps beside it still reach the image below.
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
  },
  titleText: { flexShrink: 1 },
});

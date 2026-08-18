import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";

interface ImageOverlayShelfProps {
  /** Small pills above the title (era, kit type, manufacturer…). */
  labels: string[];
  title: string;
  titleVariant?: "title" | "headline";
}

/**
 * Bottom vignette + metadata shelf laid over kit imagery (DESIGN.md image
 * treatment). Render inside a rounded `overflow: "hidden"` container, after
 * the image; it ignores touches so taps reach the image below.
 */
export const ImageOverlayShelf: React.FC<ImageOverlayShelfProps> = ({
  labels,
  title,
  titleVariant = "title",
}) => {
  const { radius } = useTheme();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={["transparent", "rgba(11,15,16,0.55)", "rgba(11,15,16,0.92)"]}
        locations={[0.45, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.shelf}>
        <View style={styles.pills}>
          {labels.map((label) => (
            <View
              key={label}
              style={[styles.pill, { borderRadius: radius.sm + 2 }]}
            >
              <AppText variant="labelSm">{label}</AppText>
            </View>
          ))}
        </View>
        <AppText variant={titleVariant} numberOfLines={1}>
          {title}
        </AppText>
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
});

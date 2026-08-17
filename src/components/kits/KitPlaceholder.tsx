import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface KitPlaceholderProps {
  primaryColor: string;
  secondaryColor?: string | null;
}

/**
 * Generated placeholder art for kits without a reference image: team colors
 * as a shirt-like center-band composition, so the catalogue still reads
 * visually (DESIGN.md is image-first; the seed ships no photos).
 */
export const KitPlaceholder: React.FC<KitPlaceholderProps> = ({
  primaryColor,
  secondaryColor,
}) => (
  <View style={[styles.container, { backgroundColor: primaryColor }]}>
    {secondaryColor ? (
      <View style={[styles.band, { backgroundColor: secondaryColor }]} />
    ) : null}
    <View style={styles.icon}>
      <Ionicons name="shirt" size={40} color="rgba(255,255,255,0.28)" />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  band: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "34%",
    opacity: 0.9,
  },
  icon: {
    position: "absolute",
  },
});

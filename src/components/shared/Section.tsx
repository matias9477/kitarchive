import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

interface SectionProps extends ViewProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  trailing?: React.ReactNode;
}

/** Section with the all-caps "technical spec" label header (DESIGN.md). */
export const Section: React.FC<SectionProps> = ({
  title,
  icon,
  trailing,
  children,
  style,
  ...rest
}) => {
  const { colors, spacing } = useTheme();
  return (
    <View {...rest} style={[{ gap: spacing.sm }, style]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {icon ? (
            <Ionicons name={icon} size={14} color={colors.onPrimaryContainer} />
          ) : null}
          <AppText variant="label" color={colors.onPrimaryContainer}>
            {title}
          </AppText>
        </View>
        {trailing}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
});

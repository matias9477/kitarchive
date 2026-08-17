import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

interface SectionProps extends ViewProps {
  title: string;
  trailing?: React.ReactNode;
}

/** Section with the all-caps "technical spec" label header (DESIGN.md). */
export const Section: React.FC<SectionProps> = ({
  title,
  trailing,
  children,
  style,
  ...rest
}) => {
  const { colors, spacing } = useTheme();
  return (
    <View {...rest} style={[{ gap: spacing.sm }, style]}>
      <View style={styles.header}>
        <AppText variant="label" color={colors.onPrimaryContainer}>
          {title}
        </AppText>
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
});

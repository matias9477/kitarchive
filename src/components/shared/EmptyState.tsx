import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string | undefined;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "shirt-outline",
  title,
  message,
}) => {
  const { colors, spacing } = useTheme();
  return (
    <View style={[styles.container, { padding: spacing.xl }]}>
      <Ionicons name={icon} size={40} color={colors.outlineVariant} />
      <AppText variant="title" align="center" color={colors.onSurfaceVariant}>
        {title}
      </AppText>
      {message ? (
        <AppText variant="bodySm" align="center" color={colors.outline}>
          {message}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 12 },
});

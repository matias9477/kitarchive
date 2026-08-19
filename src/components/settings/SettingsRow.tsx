import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";

interface SettingsRowProps {
  label: string;
  labelColor?: string;
  trailing?: React.ReactNode;
  trailingIcon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/** One surface-container row of a settings section. */
export const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  labelColor,
  trailing,
  trailingIcon,
  onPress,
  loading = false,
  disabled = false,
}) => {
  const { colors, radius } = useTheme();

  const content = (
    <>
      <AppText color={labelColor ?? colors.onSurfaceVariant}>{label}</AppText>
      {loading ? (
        <ActivityIndicator size="small" color={colors.secondary} />
      ) : (
        (trailing ??
        (trailingIcon ? (
          <Ionicons name={trailingIcon} size={18} color={colors.outline} />
        ) : null))
      )}
    </>
  );

  const rowStyle = [
    styles.row,
    {
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.md,
      opacity: disabled ? 0.5 : 1,
    },
  ];

  if (!onPress) return <View style={rowStyle}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [...rowStyle, pressed ? { opacity: 0.85 } : null]}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
});

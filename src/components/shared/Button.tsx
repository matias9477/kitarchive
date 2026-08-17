import React from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
}

/** Primary = solid vibrant blue; ghost = 1px-border on deep navy (DESIGN.md). */
export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}) => {
  const { colors, radius } = useTheme();
  const isDisabled = disabled || loading;

  const background =
    variant === "primary"
      ? colors.secondaryContainer
      : variant === "danger"
        ? colors.errorContainer
        : "transparent";
  const foreground =
    variant === "primary"
      ? "#ffffff"
      : variant === "danger"
        ? colors.onErrorContainer
        : colors.onSurface;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderRadius: radius.md,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        variant === "ghost"
          ? { borderWidth: 1, borderColor: colors.outlineVariant }
          : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <AppText variant="titleSm" color={foreground}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

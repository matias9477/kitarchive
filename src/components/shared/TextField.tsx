import React from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

interface TextFieldProps extends TextInputProps {
  label: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  style,
  ...rest
}) => {
  const { colors, radius, spacing, typography } = useTheme();
  return (
    <View style={{ gap: spacing.xs }}>
      <AppText variant="labelSm" color={colors.onSurfaceVariant}>
        {label}
      </AppText>
      <TextInput
        placeholderTextColor={colors.outline}
        keyboardAppearance="dark"
        {...rest}
        style={[
          styles.input,
          typography.body,
          {
            backgroundColor: colors.surfaceContainer,
            borderRadius: radius.md,
            borderColor: colors.outlineVariant,
            color: colors.onSurface,
          },
          style,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});

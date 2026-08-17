import React from "react";
import { Text, type TextProps, type TextStyle } from "react-native";
import { useTheme } from "@/theme/index";
import type { Typography } from "@/theme/typography";

interface AppTextProps extends TextProps {
  variant?: keyof Typography;
  color?: string;
  align?: TextStyle["textAlign"];
}

/** Themed text — always use this instead of the bare RN Text. */
export const AppText: React.FC<AppTextProps> = ({
  variant = "body",
  color,
  align,
  style,
  ...rest
}) => {
  const { colors, typography } = useTheme();
  return (
    <Text
      {...rest}
      style={[
        typography[variant],
        { color: color ?? colors.onSurface },
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
};

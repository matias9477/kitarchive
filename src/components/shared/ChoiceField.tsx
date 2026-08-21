import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

interface ChoiceFieldProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
  /** Tapping the active choice clears it back to unset. */
  optional?: boolean;
}

/**
 * Radio-style form field for enums with only a few values (fan/player,
 * short/long): all choices side by side as equal-width buttons, exactly one
 * selectable. Use PickerField instead when the list warrants a modal.
 */
export const ChoiceField = <T extends string>({
  label,
  options,
  value,
  onChange,
  optional = false,
}: ChoiceFieldProps<T>) => {
  const { colors, radius, spacing } = useTheme();

  return (
    <View style={{ gap: spacing.xs }}>
      <AppText variant="labelSm" color={colors.onSurfaceVariant}>
        {label}
      </AppText>
      <View accessibilityRole="radiogroup" style={styles.row}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() =>
                onChange(active ? (optional ? null : option.value) : option.value)
              }
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              style={[
                styles.choice,
                {
                  borderRadius: radius.md,
                  backgroundColor: active
                    ? colors.surfaceContainerHighest
                    : colors.surfaceContainer,
                  borderColor: active ? colors.secondary : colors.outlineVariant,
                },
              ]}
            >
              <AppText
                variant="bodySm"
                color={active ? colors.onSurface : colors.onSurfaceVariant}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  choice: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderWidth: 1,
  },
});

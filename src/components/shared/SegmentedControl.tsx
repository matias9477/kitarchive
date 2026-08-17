import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
  /** When true, tapping the active segment clears the selection (filter mode). */
  clearable?: boolean;
}

/** Archival filter control — horizontal segments, sliding-feel active state. */
export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  clearable = false,
}: SegmentedControlProps<T>) => {
  const { colors, radius } = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View
        style={[
          styles.track,
          { backgroundColor: colors.surfaceContainer, borderRadius: radius.md },
        ]}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() =>
                onChange(active && clearable ? null : option.value)
              }
              style={[
                styles.segment,
                { borderRadius: radius.md - 4 },
                active
                  ? { backgroundColor: colors.surfaceContainerHighest }
                  : null,
              ]}
            >
              <AppText
                variant="labelSm"
                color={active ? colors.onSurface : colors.onSurfaceVariant}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  track: { flexDirection: "row", padding: 4, gap: 2 },
  segment: { paddingHorizontal: 12, paddingVertical: 6 },
});

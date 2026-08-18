import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

interface FilterSelectorProps<T extends string> {
  /** Pill text while nothing is selected, and the sheet title ("Type"…). */
  label: string;
  /** Clear-selection row at the top of the sheet ("All types"…). */
  allLabel: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
}

/**
 * Compact filter control: a dropdown pill that opens a bottom-sheet option
 * list. Unset = outline pill with the filter name; set = blue pill showing
 * the value, with an in-place ✕ to clear. Several of these side by side
 * replace stacked filter rows.
 */
export const FilterSelector = <T extends string>({
  label,
  allLabel,
  options,
  value,
  onChange,
}: FilterSelectorProps<T>) => {
  const { colors, spacing, radius } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value) ?? null;
  const active = selected != null;

  const pick = (next: T | null) => {
    onChange(next);
    setOpen(false);
  };

  const optionRow = (rowLabel: string, rowValue: T | null) => {
    const current = rowValue === value;
    return (
      <Pressable
        onPress={() => pick(rowValue)}
        style={[styles.option, { borderBottomColor: colors.outlineVariant }]}
      >
        <AppText color={current ? colors.secondary : colors.onSurface}>
          {rowLabel}
        </AppText>
        {current ? (
          <Ionicons name="checkmark" size={18} color={colors.secondary} />
        ) : null}
      </Pressable>
    );
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open, selected: active }}
        accessibilityLabel={label}
        style={[
          styles.pill,
          { borderRadius: radius.full },
          active
            ? {
                backgroundColor: colors.secondaryContainer,
                borderColor: colors.secondaryContainer,
              }
            : { borderColor: colors.outlineVariant },
        ]}
      >
        <AppText
          variant="labelSm"
          color={active ? "#ffffff" : colors.onSurfaceVariant}
          numberOfLines={1}
          style={styles.pillLabel}
        >
          {selected?.label ?? label}
        </AppText>
        {active ? (
          <Pressable
            onPress={() => onChange(null)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={allLabel}
          >
            <Ionicons name="close-circle" size={14} color="#ffffff" />
          </Pressable>
        ) : (
          <Ionicons
            name="chevron-down"
            size={12}
            color={colors.onSurfaceVariant}
          />
        )}
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.backdrop]}
            onPress={() => setOpen(false)}
          />
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surfaceContainer,
                borderTopLeftRadius: radius.xl,
                borderTopRightRadius: radius.xl,
                paddingBottom: spacing.xl,
              },
            ]}
          >
            <View
              style={[
                styles.sheetHeader,
                { paddingHorizontal: spacing.screen },
              ]}
            >
              <AppText variant="title">{label}</AppText>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.onSurface} />
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              contentContainerStyle={{ paddingHorizontal: spacing.screen }}
              ListHeaderComponent={optionRow(allLabel, null)}
              renderItem={({ item }) => optionRow(item.label, item.value)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    flexShrink: 1,
  },
  pillLabel: { flexShrink: 1 },
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { maxHeight: "60%" },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
});

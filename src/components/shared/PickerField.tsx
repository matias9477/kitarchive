import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

export interface PickerOption<T extends string> {
  value: T;
  label: string;
  detail?: string;
}

interface PickerFieldProps<T extends string> {
  label: string;
  placeholder: string;
  options: PickerOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  /** Show a "clear" row so optional fields can go back to unset. */
  optional?: boolean;
  disabled?: boolean;
}

/**
 * Labeled row that opens a full-screen option list — the workhorse for every
 * enum/entity selection in the add/edit flows.
 */
export const PickerField = <T extends string>({
  label,
  placeholder,
  options,
  value,
  onChange,
  optional = false,
  disabled = false,
}: PickerFieldProps<T>) => {
  const { colors, radius, spacing } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ gap: spacing.xs }}>
      <AppText variant="labelSm" color={colors.onSurfaceVariant}>
        {label}
      </AppText>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          {
            backgroundColor: colors.surfaceContainer,
            borderRadius: radius.md,
            borderColor: colors.outlineVariant,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <AppText
          color={selected ? colors.onSurface : colors.outline}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </AppText>
        <Ionicons name="chevron-down" size={16} color={colors.outline} />
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView
          style={[styles.modal, { backgroundColor: colors.background }]}
        >
          <View
            style={[styles.modalHeader, { paddingHorizontal: spacing.screen }]}
          >
            <AppText variant="headline">{label}</AppText>
            <Pressable onPress={() => setOpen(false)} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.onSurface} />
            </Pressable>
          </View>
          <FlatList
            data={options}
            keyExtractor={(o) => o.value}
            contentContainerStyle={{
              paddingHorizontal: spacing.screen,
              paddingBottom: spacing.xl,
            }}
            ListHeaderComponent={
              optional ? (
                <Pressable
                  onPress={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                  style={[
                    styles.option,
                    { borderBottomColor: colors.outlineVariant },
                  ]}
                >
                  <AppText color={colors.outline}>—</AppText>
                </Pressable>
              ) : null
            }
            renderItem={({ item }) => {
              const active = item.value === value;
              return (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  style={[
                    styles.option,
                    { borderBottomColor: colors.outlineVariant },
                  ]}
                >
                  <View style={styles.optionText}>
                    <AppText
                      color={active ? colors.secondary : colors.onSurface}
                    >
                      {item.label}
                    </AppText>
                    {item.detail ? (
                      <AppText variant="labelSm" color={colors.outline}>
                        {item.detail}
                      </AppText>
                    ) : null}
                  </View>
                  {active ? (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={colors.secondary}
                    />
                  ) : null}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: { flex: 1, gap: 2 },
});

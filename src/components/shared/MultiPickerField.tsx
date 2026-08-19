import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { Chip } from "./Chip";
import type { PickerOption } from "./PickerField";

interface MultiPickerFieldProps<T extends string> {
  label: string;
  placeholder: string;
  options: PickerOption<T>[];
  values: T[];
  onChange: (values: T[]) => void;
}

/**
 * Multi-select sibling of PickerField: a labeled row that opens a full-screen
 * checklist, with the current selection summarized as chips under the field.
 */
export const MultiPickerField = <T extends string>({
  label,
  placeholder,
  options,
  values,
  onChange,
}: MultiPickerFieldProps<T>) => {
  const { colors, radius, spacing } = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const selected = options.filter((o) => values.includes(o.value));

  const toggle = (value: T) =>
    onChange(
      values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value],
    );

  return (
    <View style={{ gap: spacing.xs }}>
      <AppText variant="labelSm" color={colors.onSurfaceVariant}>
        {label}
      </AppText>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          {
            backgroundColor: colors.surfaceContainer,
            borderRadius: radius.md,
            borderColor: colors.outlineVariant,
          },
        ]}
      >
        <AppText
          color={selected.length > 0 ? colors.onSurface : colors.outline}
          numberOfLines={1}
          style={styles.fieldText}
        >
          {selected.length > 0
            ? t("common.selectedCount", { count: selected.length })
            : placeholder}
        </AppText>
        <Ionicons name="chevron-down" size={16} color={colors.outline} />
      </Pressable>

      {selected.length > 0 ? (
        <View style={styles.chips}>
          {selected.map((option) => (
            <Pressable key={option.value} onPress={() => toggle(option.value)}>
              <Chip label={`${option.label}  ✕`} tone="gold" />
            </Pressable>
          ))}
        </View>
      ) : null}

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
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
            contentContainerStyle={{ paddingHorizontal: spacing.screen }}
            renderItem={({ item }) => {
              const active = values.includes(item.value);
              return (
                <Pressable
                  onPress={() => toggle(item.value)}
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
                  <Ionicons
                    name={active ? "checkbox" : "square-outline"}
                    size={20}
                    color={active ? colors.secondary : colors.outlineVariant}
                  />
                </Pressable>
              );
            }}
          />
          <View style={{ padding: spacing.screen }}>
            <Button label={t("common.done")} onPress={() => setOpen(false)} />
          </View>
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
  fieldText: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
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
    gap: 12,
  },
  optionText: { flex: 1, gap: 2 },
});

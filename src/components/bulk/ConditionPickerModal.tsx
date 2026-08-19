import React from "react";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { CONDITIONS } from "@/config/constants";
import type { Condition } from "@/config/types";

interface ConditionPickerModalProps {
  visible: boolean;
  value: Condition | null;
  onSelect: (condition: Condition) => void;
  onClose: () => void;
}

/** Condition list for a queued bulk-add row (PickerField's modal, standalone). */
export const ConditionPickerModal: React.FC<ConditionPickerModalProps> = ({
  visible,
  value,
  onSelect,
  onClose,
}) => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.modal, { backgroundColor: colors.background }]}
      >
        <View
          style={[styles.modalHeader, { paddingHorizontal: spacing.screen }]}
        >
          <AppText variant="headline">{t("bulkAdd.condition")}</AppText>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.onSurface} />
          </Pressable>
        </View>
        <FlatList
          data={CONDITIONS}
          keyExtractor={(condition) => condition}
          contentContainerStyle={{
            paddingHorizontal: spacing.screen,
            paddingBottom: spacing.xl,
          }}
          renderItem={({ item }) => {
            const active = item === value;
            return (
              <Pressable
                onPress={() => onSelect(item)}
                style={[
                  styles.option,
                  { borderBottomColor: colors.outlineVariant },
                ]}
              >
                <AppText color={active ? colors.secondary : colors.onSurface}>
                  {t(`enums.condition.${item}`)}
                </AppText>
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
  );
};

const styles = StyleSheet.create({
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
});

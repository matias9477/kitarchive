import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { Chip } from "@/components/shared/Chip";
import { KitListRow } from "@/components/kits/KitListRow";
import type { KitSummary } from "@/features/catalogue/types";
import type { Condition } from "@/config/types";

interface BulkQueueRowProps {
  summary: KitSummary;
  condition: Condition;
  onEditCondition: () => void;
  onRemove: () => void;
}

/**
 * One queued shirt in the bulk-add flow — same card anatomy as the kit
 * picker rows (team omitted; it's chosen at the top). Tapping the row edits
 * the condition; the icon removes it from the queue.
 */
export const BulkQueueRow: React.FC<BulkQueueRowProps> = ({
  summary,
  condition,
  onEditCondition,
  onRemove,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <KitListRow
      summary={summary}
      showTeam={false}
      onPress={onEditCondition}
      trailing={
        <View style={styles.trailing}>
          <Chip label={t(`enums.condition.${condition}`)} />
          <Pressable
            onPress={onRemove}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("common.remove")}
          >
            <Ionicons name="close-circle" size={20} color={colors.outline} />
          </Pressable>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  trailing: { flexDirection: "row", alignItems: "center", gap: 8 },
});

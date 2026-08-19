import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button";
import { Chip } from "@/components/shared/Chip";
import { PickerField } from "@/components/shared/PickerField";
import { KitListRow } from "@/components/kits/KitListRow";
import { useCatalogueStore } from "@/features/catalogue/catalogueStore";
import { KIT_TYPES } from "@/config/constants";
import type { KitType } from "@/config/types";
import type { KitSummary } from "@/features/catalogue/types";

interface BulkKitPickerProps {
  teamId: string;
  eraId: string;
  /** How many of each kit are already queued, to mark rows as selected. */
  queuedCounts: Record<string, number>;
  onQueue: (summary: KitSummary) => void;
}

/**
 * Bulk-add step 3: every tap on a kit queues one shirt (tap twice for two
 * copies). Inline "new kit" needs only the type — team and season are given.
 */
export const BulkKitPicker: React.FC<BulkKitPickerProps> = ({
  teamId,
  eraId,
  queuedCounts,
  onQueue,
}) => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const teamKits = useCatalogueStore((s) => s.kitsByTeam[teamId]);
  const kits = useMemo(
    () => teamKits?.filter((k) => k.kit.eraId === eraId) ?? [],
    [teamKits, eraId],
  );
  const manufacturers = useCatalogueStore((s) => s.manufacturers);
  const createKit = useCatalogueStore((s) => s.createKit);

  const [creating, setCreating] = useState(false);
  const [kitType, setKitType] = useState<KitType>("home");
  const [manufacturerId, setManufacturerId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    try {
      const kit = await createKit({
        teamId,
        eraId,
        type: kitType,
        ...(manufacturerId ? { manufacturerId } : {}),
      });
      // createKit refetched the team catalogue; queue the fresh summary.
      const summary = useCatalogueStore
        .getState()
        .kitsByTeam[teamId]?.find((k) => k.kit.id === kit.id);
      if (summary) onQueue(summary);
      setCreating(false);
      setManufacturerId(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: spacing.xs }}>
      {kits.length === 0 && !creating ? (
        <AppText variant="bodySm" color={colors.onSurfaceVariant}>
          {t("bulkAdd.noKits")}
        </AppText>
      ) : null}
      {kits.map((summary) => {
        const queued = queuedCounts[summary.kit.id] ?? 0;
        return (
          <KitListRow
            key={summary.kit.id}
            summary={summary}
            showTeam={false}
            onPress={() => onQueue(summary)}
            {...(queued > 0
              ? {
                  trailing: (
                    <Chip
                      label={queued > 1 ? `×${queued}` : t("bulkAdd.queued")}
                      icon="checkmark-circle"
                      tone="blue"
                    />
                  ),
                }
              : {})}
          />
        );
      })}

      {creating ? (
        <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
          <PickerField
            label={t("bulkAdd.kitType")}
            placeholder={t("common.select")}
            options={KIT_TYPES.map((type) => ({
              value: type,
              label: t(`enums.kitType.${type}`),
            }))}
            value={kitType}
            onChange={(value) => value && setKitType(value)}
          />
          <PickerField
            label={t("bulkAdd.manufacturer")}
            placeholder={t("common.optional")}
            options={manufacturers.map((m) => ({ value: m.id, label: m.name }))}
            value={manufacturerId}
            onChange={setManufacturerId}
            optional
          />
          <Button
            label={t("bulkAdd.createKit")}
            icon="add-outline"
            variant="ghost"
            onPress={() => void create()}
            disabled={busy}
            loading={busy}
          />
        </View>
      ) : (
        <Pressable onPress={() => setCreating(true)} style={styles.newLink}>
          <Ionicons name="add" size={16} color={colors.secondary} />
          <AppText variant="bodySm" color={colors.secondary}>
            {t("bulkAdd.newKit")}
          </AppText>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  newLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
  },
});

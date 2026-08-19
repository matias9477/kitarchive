import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button";
import { Section } from "@/components/shared/Section";
import { BulkTeamPicker } from "@/components/bulk/BulkTeamPicker";
import { BulkEraPicker } from "@/components/bulk/BulkEraPicker";
import { BulkKitPicker } from "@/components/bulk/BulkKitPicker";
import { BulkQueueRow } from "@/components/bulk/BulkQueueRow";
import { ConditionPickerModal } from "@/components/bulk/ConditionPickerModal";
import { useCatalogueStore } from "@/features/catalogue/catalogueStore";
import { useCollectionStore } from "@/features/collection/collectionStore";
import { generateId } from "@/lib/id";
import type { Condition } from "@/config/types";
import type { KitSummary, TeamWithCountry } from "@/features/catalogue/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "BulkAdd">;

/** One queued shirt; its own key so the same kit can be queued twice. */
interface QueuedShirt {
  key: string;
  summary: KitSummary;
  condition: Condition;
}

/**
 * Bulk add: cascade team → season → kits, every kit tap queues a shirt with
 * only the mandatory fields (condition, editable per row). One Save commits
 * the whole queue; everything else is backfilled later via item edit.
 */
export const BulkAddScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const loadTeams = useCatalogueStore((s) => s.loadTeams);
  const loadLookups = useCatalogueStore((s) => s.loadLookups);
  const loadTeamCatalogue = useCatalogueStore((s) => s.loadTeamCatalogue);
  const addMany = useCollectionStore((s) => s.addMany);

  const [team, setTeam] = useState<TeamWithCountry | null>(null);
  const [eraId, setEraId] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueuedShirt[]>([]);
  const [conditionEditKey, setConditionEditKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const savedRef = useRef(false);

  useEffect(() => {
    void loadTeams();
    void loadLookups();
  }, [loadTeams, loadLookups]);

  useEffect(() => {
    if (team) void loadTeamCatalogue(team.id);
  }, [team, loadTeamCatalogue]);

  useEffect(() => {
    return navigation.addListener("beforeRemove", (e) => {
      if (queue.length === 0 || savedRef.current || saving) return;
      e.preventDefault();
      Alert.alert(t("bulkAdd.discardTitle"), t("bulkAdd.discardMessage"), [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("bulkAdd.discard"),
          style: "destructive",
          onPress: () => navigation.dispatch(e.data.action),
        },
      ]);
    });
  }, [navigation, queue.length, saving, t]);

  const selectTeam = (next: TeamWithCountry) => {
    setTeam(next);
    setEraId(null);
  };

  const enqueue = (summary: KitSummary) => {
    setQueue((q) => [
      ...q,
      { key: generateId(), summary, condition: "very_good" },
    ]);
  };

  const save = async () => {
    setSaving(true);
    try {
      await addMany(
        queue.map((q) => ({
          kitId: q.summary.kit.id,
          condition: q.condition,
        })),
      );
      savedRef.current = true;
      // Pop both modals back to the root MainTabs, then switch tab. A plain
      // navigate() would PUSH a second MainTabs on top of the modal stack
      // (v7 navigate no longer pops to existing screens).
      navigation.popToTop();
      navigation.navigate("MainTabs", { screen: "Collection" });
    } finally {
      setSaving(false);
    }
  };

  const queuedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of queue) {
      counts[entry.summary.kit.id] = (counts[entry.summary.kit.id] ?? 0) + 1;
    }
    return counts;
  }, [queue]);

  const editing = conditionEditKey
    ? (queue.find((q) => q.key === conditionEditKey) ?? null)
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={queue}
        keyExtractor={(q) => q.key}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: spacing.screen,
          paddingBottom: spacing.xl,
          gap: spacing.xs,
        }}
        ListHeaderComponent={
          <View style={{ gap: spacing.lg, marginBottom: spacing.md }}>
            <Section title={t("bulkAdd.teamSection")} icon="shield-outline">
              <BulkTeamPicker selected={team} onSelect={selectTeam} />
            </Section>
            {team ? (
              <Section
                title={t("bulkAdd.seasonSection")}
                icon="calendar-outline"
              >
                <BulkEraPicker
                  teamId={team.id}
                  selectedEraId={eraId}
                  onSelect={setEraId}
                />
              </Section>
            ) : null}
            {team && eraId ? (
              <Section title={t("bulkAdd.kitsSection")} icon="shirt-outline">
                <BulkKitPicker
                  teamId={team.id}
                  eraId={eraId}
                  queuedCounts={queuedCounts}
                  onQueue={enqueue}
                />
              </Section>
            ) : null}
            {queue.length > 0 ? (
              <AppText variant="label" color={colors.onPrimaryContainer}>
                {t("bulkAdd.queueTitle", { count: queue.length })}
              </AppText>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <BulkQueueRow
            summary={item.summary}
            condition={item.condition}
            onEditCondition={() => setConditionEditKey(item.key)}
            onRemove={() =>
              setQueue((q) => q.filter((entry) => entry.key !== item.key))
            }
          />
        )}
      />

      <View
        style={[
          styles.footer,
          {
            padding: spacing.screen,
            paddingBottom: spacing.lg,
            backgroundColor: colors.background,
            borderTopColor: colors.outlineVariant,
          },
        ]}
      >
        <Button
          label={t("bulkAdd.save", { count: queue.length })}
          icon="checkmark-outline"
          onPress={() => void save()}
          disabled={queue.length === 0 || saving}
          loading={saving}
        />
      </View>

      <ConditionPickerModal
        visible={editing != null}
        value={editing?.condition ?? null}
        onSelect={(condition) => {
          setQueue((q) =>
            q.map((entry) =>
              entry.key === conditionEditKey ? { ...entry, condition } : entry,
            ),
          );
          setConditionEditKey(null);
        }}
        onClose={() => setConditionEditKey(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth },
});

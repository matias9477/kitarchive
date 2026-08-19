import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { usePreferencesStore } from "@/store/preferencesStore";
import { AppText } from "@/components/shared/AppText";
import { Chip } from "@/components/shared/Chip";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { KitCard } from "@/components/kits/KitCard";
import { KitListRow } from "@/components/kits/KitListRow";
import { useStatsStore } from "@/features/stats/statsStore";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "TeamDetail">;

/** Team page: per-era kit grid with owned/missing progress (spec §33.7). */
export const TeamDetailScreen: React.FC<Props> = ({ route }) => {
  const { teamId } = route.params;
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const progress = useStatsStore((s) => s.progressByTeam[teamId]);
  const loadTeamProgress = useStatsStore((s) => s.loadTeamProgress);
  const favoriteTeamIds = usePreferencesStore((s) => s.favoriteTeamIds);
  const toggleFavoriteTeam = usePreferencesStore((s) => s.toggleFavoriteTeam);
  const isFavorite = favoriteTeamIds.includes(teamId);
  const viewMode = usePreferencesStore((s) => s.viewMode);
  const setViewMode = usePreferencesStore((s) => s.setViewMode);
  const isGrid = viewMode === "grid";
  const [ownedOnly, setOwnedOnly] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void loadTeamProgress(teamId);
    }, [loadTeamProgress, teamId]),
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      ...(progress?.teamName ? { title: progress.teamName } : {}),
      headerRight: () => (
        <Pressable
          onPress={() => toggleFavoriteTeam(teamId)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t("team.favorite")}
        >
          <Ionicons
            name={isFavorite ? "star" : "star-outline"}
            size={22}
            color={isFavorite ? colors.tertiary : colors.onSurface}
          />
        </Pressable>
      ),
    });
  }, [
    navigation,
    progress?.teamName,
    isFavorite,
    teamId,
    toggleFavoriteTeam,
    colors,
    t,
  ]);

  if (!progress)
    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
      />
    );

  const erasWithKits = progress.eras
    .map((e) =>
      ownedOnly ? { ...e, kits: e.kits.filter((k) => k.ownedCount > 0) } : e,
    )
    .filter((e) => e.kits.length > 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        padding: spacing.screen,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
      }}
    >
      <View style={{ gap: spacing.sm }}>
        <View style={styles.progressHeader}>
          <AppText variant="headline">
            {progress.ownedKits}
            <AppText variant="title" color={colors.onSurfaceVariant}>
              {" "}
              / {progress.totalKits} {t("team.kits")}
            </AppText>
          </AppText>
          <AppText variant="titleSm" color={colors.tertiary}>
            {t("team.shirts", { count: progress.ownedItems })}
          </AppText>
        </View>
        <ProgressBar value={progress.ownedKits} total={progress.totalKits} />
        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setOwnedOnly((v) => !v)}
            hitSlop={8}
            accessibilityRole="switch"
            accessibilityState={{ checked: ownedOnly }}
          >
            <Chip
              label={t("team.ownedOnly")}
              icon={ownedOnly ? "checkmark-circle" : "checkmark-circle-outline"}
              tone={ownedOnly ? "blue" : "outline"}
            />
          </Pressable>
          <Pressable
            onPress={() => setViewMode(isGrid ? "list" : "grid")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("common.toggleView")}
          >
            <Ionicons
              name={isGrid ? "list-outline" : "grid-outline"}
              size={20}
              color={colors.onSurfaceVariant}
            />
          </Pressable>
        </View>
      </View>

      {erasWithKits.length === 0 ? (
        ownedOnly ? (
          <EmptyState title={t("team.noOwned")} />
        ) : (
          <EmptyState
            title={t("team.empty")}
            message={t("team.emptyMessage")}
          />
        )
      ) : (
        erasWithKits.map(({ era, kits, ownedKits, totalKits }) => (
          <View key={era.id} style={{ gap: spacing.sm }}>
            <View style={styles.eraHeader}>
              <AppText variant="title">{era.label}</AppText>
              <View style={styles.eraActions}>
                <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                  {ownedKits} / {totalKits}
                </AppText>
                {/* The season exists but its kit may not (third, special,
                    cup…) — extend the catalogue right here. */}
                <Pressable
                  onPress={() =>
                    navigation.navigate("CreateKit", { teamId, eraId: era.id })
                  }
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t("team.addKitToEra")}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color={colors.secondary}
                  />
                </Pressable>
              </View>
            </View>
            <View style={isGrid ? styles.grid : styles.list}>
              {kits.map((summary) => {
                const onPress = () =>
                  navigation.navigate("KitDetail", { kitId: summary.kit.id });
                return isGrid ? (
                  <View key={summary.kit.id} style={styles.gridCell}>
                    <KitCard summary={summary} onPress={onPress} />
                  </View>
                ) : (
                  <KitListRow
                    key={summary.kit.id}
                    summary={summary}
                    onPress={onPress}
                    showTeam={false}
                  />
                );
              })}
            </View>
          </View>
        ))
      )}

      {!ownedOnly ? (
        <Pressable
          onPress={() => navigation.navigate("CreateKit", { teamId })}
          style={[styles.extendRow, { borderColor: colors.outlineVariant }]}
        >
          <Ionicons name="add" size={16} color={colors.secondary} />
          <AppText variant="bodySm" color={colors.secondary}>
            {t("team.extendCatalogue")}
          </AppText>
        </Pressable>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  eraHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eraActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  extendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridCell: { width: "47.5%" },
  list: { gap: 8 },
});

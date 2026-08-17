import React, { useCallback } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { usePreferencesStore } from "@/store/preferencesStore";
import { AppText } from "@/components/shared/AppText";
import { StatTile } from "@/components/shared/StatTile";
import { Section } from "@/components/shared/Section";
import { EmptyState } from "@/components/shared/EmptyState";
import { RecentItemCard } from "@/components/kits/RecentItemCard";
import { ArchiveProgressCard } from "@/components/kits/ArchiveProgressCard";
import { useStatsStore } from "@/features/stats/statsStore";
import type { TeamProgress } from "@/features/stats/types";

/** Dashboard — favorite-team stats, recently added, archive progress. */
export const HomeScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dashboard = useStatsStore((s) => s.dashboard);
  const progressByTeam = useStatsStore((s) => s.progressByTeam);
  const loadDashboard = useStatsStore((s) => s.loadDashboard);
  const loadTeamProgress = useStatsStore((s) => s.loadTeamProgress);
  const favoriteTeamIds = usePreferencesStore((s) => s.favoriteTeamIds);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
      for (const teamId of favoriteTeamIds) void loadTeamProgress(teamId);
    }, [loadDashboard, loadTeamProgress, favoriteTeamIds]),
  );

  const shirtsFor = (teamId: string) =>
    dashboard?.byTeam.find((bucket) => bucket.key === teamId)?.count ?? 0;

  const favoriteProgress = favoriteTeamIds
    .map((teamId) => progressByTeam[teamId])
    .filter((p): p is TeamProgress => p != null && p.totalKits > 0);

  // Tile grid: total shirts, one tile per favorite team, wishlist — in rows
  // of two, with the first favorite featured.
  const tiles = [
    {
      key: "total",
      value: dashboard?.totalOwned ?? 0,
      label: t("home.totalShirts"),
      icon: "file-tray-full-outline" as const,
      highlight: false,
      onPress: () => navigation.navigate("MainTabs", { screen: "Collection" }),
    },
    ...favoriteTeamIds.map((teamId, index) => ({
      key: teamId,
      value: shirtsFor(teamId),
      label: progressByTeam[teamId]?.teamName ?? "…",
      icon: "star" as const,
      highlight: index === 0,
      onPress: () => navigation.navigate("TeamDetail", { teamId }),
    })),
    {
      key: "wishlist",
      value: dashboard?.wishlistCount ?? 0,
      label: t("home.wishlist"),
      icon: "heart-outline" as const,
      highlight: false,
      onPress: () => navigation.navigate("MainTabs", { screen: "Wishlist" }),
    },
  ];
  const tileRows: (typeof tiles)[] = [];
  for (let i = 0; i < tiles.length; i += 2)
    tileRows.push(tiles.slice(i, i + 2));

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
        <AppText variant="headline">{t("home.title")}</AppText>
        <View style={styles.headerActions}>
          <Pressable onPress={() => navigation.navigate("Search")} hitSlop={8}>
            <Ionicons name="search" size={22} color={colors.onSurface} />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("Settings")}
            hitSlop={8}
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color={colors.onSurface}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.screen,
          paddingBottom: spacing.xl,
          gap: spacing.lg,
        }}
      >
        {/* Favorite-team stat grid */}
        <View style={{ gap: spacing.gutter }}>
          {tileRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.tileRow}>
              {row.map((tile) => (
                <StatTile
                  key={tile.key}
                  value={tile.value}
                  label={tile.label}
                  icon={tile.icon}
                  highlight={tile.highlight}
                  onPress={tile.onPress}
                />
              ))}
              {row.length === 1 ? <View style={styles.tileSpacer} /> : null}
            </View>
          ))}
          {favoriteTeamIds.length === 0 ? (
            <Pressable
              onPress={() =>
                navigation.navigate("MainTabs", { screen: "Explore" })
              }
              style={[styles.hintRow, { borderColor: colors.outlineVariant }]}
            >
              <Ionicons name="star-outline" size={16} color={colors.tertiary} />
              <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                {t("home.noFavorites")}
              </AppText>
            </Pressable>
          ) : null}
        </View>

        {dashboard && dashboard.totalOwned === 0 ? (
          <EmptyState
            title={t("home.emptyTitle")}
            message={t("home.emptyMessage")}
          />
        ) : null}

        {/* Recently added */}
        {dashboard && dashboard.recentItems.length > 0 ? (
          <View style={{ gap: spacing.sm }}>
            <View style={styles.sectionHeader}>
              <AppText variant="headline">{t("home.recentlyAdded")}</AppText>
              <Pressable
                onPress={() =>
                  navigation.navigate("MainTabs", { screen: "Collection" })
                }
                hitSlop={8}
              >
                <AppText variant="titleSm" color={colors.secondary}>
                  {t("home.viewAll")}
                </AppText>
              </Pressable>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={dashboard.recentItems}
              keyExtractor={(s) => s.item.id}
              style={{ marginHorizontal: -spacing.screen }}
              contentContainerStyle={{
                paddingHorizontal: spacing.screen,
                gap: spacing.gutter,
              }}
              renderItem={({ item: summary }) => (
                <RecentItemCard
                  summary={summary}
                  onPress={() =>
                    navigation.navigate("ItemDetail", {
                      itemId: summary.item.id,
                    })
                  }
                />
              )}
            />
          </View>
        ) : null}

        {/* Archive completion for favorite teams */}
        {favoriteProgress.length > 0 ? (
          <View style={{ gap: spacing.gutter }}>
            {favoriteProgress.map((progress) => (
              <ArchiveProgressCard
                key={progress.teamId}
                title={t("home.archive", { team: progress.teamName })}
                subtitle={t("home.trackingAll")}
                owned={progress.ownedKits}
                total={progress.totalKits}
                onPress={() =>
                  navigation.navigate("TeamDetail", { teamId: progress.teamId })
                }
              />
            ))}
          </View>
        ) : null}

        {/* Other teams */}
        {dashboard && dashboard.byTeam.length > 0 ? (
          <Section title={t("home.byTeam")} icon="shield-outline">
            <View style={{ gap: spacing.xs }}>
              {dashboard.byTeam.slice(0, 6).map((bucket) => (
                <Pressable
                  key={bucket.key}
                  onPress={() =>
                    navigation.navigate("TeamDetail", { teamId: bucket.key })
                  }
                  style={[
                    styles.teamRow,
                    { backgroundColor: colors.surfaceContainer },
                  ]}
                >
                  <AppText variant="titleSm">{bucket.label}</AppText>
                  <AppText variant="titleSm" color={colors.tertiary}>
                    {bucket.count}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </Section>
        ) : null}

        {dashboard && dashboard.duplicates.length > 0 ? (
          <Section title={t("home.duplicates")} icon="copy-outline">
            <View style={{ gap: spacing.xs }}>
              {dashboard.duplicates.map(({ kit, count }) => (
                <Pressable
                  key={kit.kit.id}
                  onPress={() =>
                    navigation.navigate("KitDetail", { kitId: kit.kit.id })
                  }
                  style={[
                    styles.teamRow,
                    { backgroundColor: colors.surfaceContainer },
                  ]}
                >
                  <AppText
                    variant="bodySm"
                    numberOfLines={1}
                    style={styles.rowLabel}
                  >
                    {kit.teamName} · {kit.eraLabel} ·{" "}
                    {t(`enums.kitType.${kit.kit.type}`)}
                  </AppText>
                  <AppText variant="titleSm" color={colors.tertiary}>
                    ×{count}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </Section>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  headerActions: { flexDirection: "row", gap: 16 },
  tileRow: { flexDirection: "row", gap: 12 },
  tileSpacer: { flex: 1 },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  rowLabel: { flex: 1 },
});

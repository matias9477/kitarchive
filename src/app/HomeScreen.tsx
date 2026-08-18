import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { usePreferencesStore } from "@/store/preferencesStore";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatTileGrid } from "@/components/home/StatTileGrid";
import { RecentlyAddedRail } from "@/components/home/RecentlyAddedRail";
import { ArchiveProgressList } from "@/components/home/ArchiveProgressList";
import { TeamCountList } from "@/components/home/TeamCountList";
import { StatsBreakdownSection } from "@/components/home/StatsBreakdownSection";
import { DuplicatesSection } from "@/components/home/DuplicatesSection";
import { useStatsStore } from "@/features/stats/statsStore";
import type { TeamProgress } from "@/features/stats/types";

/** Dashboard — one component per section (see src/components/home/). */
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

  const favoriteProgress = favoriteTeamIds
    .map((teamId) => progressByTeam[teamId])
    .filter((p): p is TeamProgress => p != null && p.totalKits > 0);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScreenHeader title={t("home.title")}>
        <Pressable onPress={() => navigation.navigate("Search")} hitSlop={8}>
          <Ionicons name="search" size={22} color={colors.onSurface} />
        </Pressable>
        <Pressable onPress={() => navigation.navigate("Settings")} hitSlop={8}>
          <Ionicons
            name="settings-outline"
            size={22}
            color={colors.onSurface}
          />
        </Pressable>
      </ScreenHeader>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.screen,
          paddingBottom: spacing.xl,
          gap: spacing.lg,
        }}
      >
        <StatTileGrid
          dashboard={dashboard}
          favoriteTeamIds={favoriteTeamIds}
          progressByTeam={progressByTeam}
        />

        {dashboard && dashboard.totalOwned === 0 ? (
          <EmptyState
            title={t("home.emptyTitle")}
            message={t("home.emptyMessage")}
          />
        ) : null}

        <RecentlyAddedRail items={dashboard?.recentItems ?? []} />
        <ArchiveProgressList progress={favoriteProgress} />
        <TeamCountList buckets={dashboard?.byTeam ?? []} />
        <StatsBreakdownSection
          byType={dashboard?.byType ?? []}
          byDecade={dashboard?.byDecade ?? []}
          byCondition={dashboard?.byCondition ?? []}
        />
        <DuplicatesSection duplicates={dashboard?.duplicates ?? []} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

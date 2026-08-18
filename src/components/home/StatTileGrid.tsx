import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { StatTile } from "@/components/shared/StatTile";
import type { DashboardStats, TeamProgress } from "@/features/stats/types";

interface StatTileGridProps {
  dashboard: DashboardStats | null;
  favoriteTeamIds: string[];
  progressByTeam: Record<string, TeamProgress>;
}

/**
 * Favorite tiles shown while collapsed; with the total + wishlist tiles the
 * collapsed grid tops out at 4 tiles (2 rows), the rest behind "show all".
 */
const MAX_COLLAPSED_FAVORITES = 2;

/**
 * Home tile grid: total shirts, one tile per favorite team (first one
 * featured), wishlist — in rows of two, plus an Explore hint when no
 * favorites are set.
 */
export const StatTileGrid: React.FC<StatTileGridProps> = ({
  dashboard,
  favoriteTeamIds,
  progressByTeam,
}) => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);
  const hiddenCount = favoriteTeamIds.length - MAX_COLLAPSED_FAVORITES;
  const visibleFavorites = expanded
    ? favoriteTeamIds
    : favoriteTeamIds.slice(0, MAX_COLLAPSED_FAVORITES);

  const shirtsFor = (teamId: string) =>
    dashboard?.byTeam.find((bucket) => bucket.key === teamId)?.count ?? 0;

  const tiles = [
    {
      key: "total",
      value: dashboard?.totalOwned ?? 0,
      label: t("home.totalShirts"),
      icon: "file-tray-full-outline" as const,
      highlight: false,
      onPress: () => navigation.navigate("MainTabs", { screen: "Collection" }),
    },
    ...visibleFavorites.map((teamId, index) => ({
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
      {hiddenCount > 0 ? (
        <Pressable
          onPress={() => setExpanded((v) => !v)}
          hitSlop={8}
          accessibilityRole="button"
          style={styles.toggleRow}
        >
          <AppText variant="labelSm" color={colors.secondary}>
            {expanded
              ? t("home.showLessTeams")
              : t("home.showAllTeams", { count: favoriteTeamIds.length })}
          </AppText>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={14}
            color={colors.secondary}
          />
        </Pressable>
      ) : null}
      {favoriteTeamIds.length === 0 ? (
        <Pressable
          onPress={() => navigation.navigate("MainTabs", { screen: "Explore" })}
          style={[styles.hintRow, { borderColor: colors.outlineVariant }]}
        >
          <Ionicons name="star-outline" size={16} color={colors.tertiary} />
          <AppText variant="bodySm" color={colors.onSurfaceVariant}>
            {t("home.noFavorites")}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  tileRow: { flexDirection: "row", gap: 12 },
  tileSpacer: { flex: 1 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 2,
  },
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
});

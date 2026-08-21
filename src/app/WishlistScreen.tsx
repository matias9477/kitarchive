import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { KIT_TYPES } from "@/config/constants";
import type { KitType } from "@/config/types";
import { AppText } from "@/components/shared/AppText";
import { FilterSelector } from "@/components/shared/FilterSelector";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonList } from "@/components/shared/Skeleton";
import { KitTile } from "@/components/kits/KitTile";
import { useWishlistStore } from "@/features/wishlist/wishlistStore";
import {
  nextViewMode,
  usePreferencesStore,
  viewModeIcon,
} from "@/store/preferencesStore";
import type { WishlistEntry } from "@/features/wishlist/types";

/** Desired catalogue kits, with optional desired configuration (§33.6). */
export const WishlistScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const entries = useWishlistStore((s) => s.entries);
  const hasLoaded = useWishlistStore((s) => s.hasLoaded);
  const load = useWishlistStore((s) => s.load);
  const viewMode = usePreferencesStore((s) => s.viewMode);
  const setViewMode = usePreferencesStore((s) => s.setViewMode);
  const isGrid = viewMode === "grid";
  const isCompact = viewMode === "compact";
  const [kitType, setKitType] = useState<KitType | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const typeOptions = useMemo(
    () =>
      KIT_TYPES.map((type) => ({
        value: type,
        label: t(`enums.kitType.${type}`),
      })),
    [t],
  );

  const teamOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const { kit } of entries) byId.set(kit.kit.teamId, kit.teamName);
    return [...byId]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [entries]);

  const filtered = useMemo(
    () =>
      entries.filter(
        ({ kit }) =>
          (!kitType || kit.kit.type === kitType) &&
          (!teamId || kit.kit.teamId === teamId),
      ),
    [entries, kitType, teamId],
  );

  // Pad odd counts with a spacer cell so the last card keeps half-row width.
  const listData = useMemo(
    () =>
      isGrid && filtered.length % 2 === 1 ? [...filtered, null] : filtered,
    [filtered, isGrid],
  );

  const desiredLine = ({ entry, playerName }: WishlistEntry): string | null => {
    const parts: string[] = [];
    if (entry.productVersion)
      parts.push(t(`enums.productVersion.${entry.productVersion}`));
    if (entry.edition) parts.push(t(`enums.edition.${entry.edition}`));
    if (playerName)
      parts.push(
        entry.number != null ? `${playerName} #${entry.number}` : playerName,
      );
    else if (entry.customName)
      parts.push(
        entry.number != null
          ? `${entry.customName} #${entry.number}`
          : entry.customName,
      );
    else if (entry.number != null) parts.push(`#${entry.number}`);
    return parts.length > 0 ? parts.join(" · ") : null;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
        <AppText variant="headline">{t("wishlist.title")}</AppText>
        <Pressable
          onPress={() => setViewMode(nextViewMode(viewMode))}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("common.toggleView")}
        >
          <Ionicons
            name={viewModeIcon(viewMode)}
            size={22}
            color={colors.onSurface}
          />
        </Pressable>
      </View>

      {entries.length > 0 ? (
        <View
          style={[
            styles.filterBar,
            {
              paddingHorizontal: spacing.screen,
              paddingBottom: spacing.sm,
              gap: spacing.xs,
            },
          ]}
        >
          <FilterSelector
            label={t("collection.filterType")}
            allLabel={t("collection.allTypes")}
            options={typeOptions}
            value={kitType}
            onChange={setKitType}
          />
          <FilterSelector
            label={t("collection.filterTeam")}
            allLabel={t("collection.allTeams")}
            options={teamOptions}
            value={teamId}
            onChange={setTeamId}
          />
        </View>
      ) : null}

      <FlatList
        key={viewMode}
        data={listData}
        keyExtractor={(e) => e?.entry.id ?? "spacer"}
        numColumns={isGrid ? 2 : 1}
        {...(isGrid ? { columnWrapperStyle: { gap: spacing.gutter } } : null)}
        contentContainerStyle={{
          paddingHorizontal: spacing.screen,
          paddingBottom: spacing.xl,
          gap: isGrid ? spacing.gutter : spacing.xs,
        }}
        ListEmptyComponent={
          !hasLoaded ? (
            // Skeleton until the first load settles — never flash "empty".
            <SkeletonList rows={6} />
          ) : entries.length > 0 ? (
            <EmptyState icon="star-outline" title={t("addShirt.noResults")} />
          ) : (
            <EmptyState
              icon="star-outline"
              title={t("wishlist.emptyTitle")}
              message={t("wishlist.emptyMessage")}
            />
          )
        }
        renderItem={({ item: entry }) => {
          if (!entry) return <View style={styles.cell} />;
          const desired = desiredLine(entry);
          const onPress = () =>
            navigation.navigate("KitDetail", { kitId: entry.entry.kitId });
          if (!isGrid) {
            return (
              <KitTile
                summary={entry.kit}
                onPress={onPress}
                detail={desired}
                variant={isCompact ? "compact" : "row"}
              />
            );
          }
          return (
            <View style={styles.cell}>
              <KitTile summary={entry.kit} onPress={onPress} detail={desired} />
            </View>
          );
        }}
      />
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
  // Wraps if a long selected value doesn't fit next to the other pills.
  filterBar: { flexDirection: "row", flexWrap: "wrap" },
  cell: { flex: 1, gap: 4 },
});

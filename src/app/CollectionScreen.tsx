import React, { useCallback, useMemo } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SectionList,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { CONDITIONS, KIT_TYPES } from "@/config/constants";
import { AppText } from "@/components/shared/AppText";
import { FilterSelector } from "@/components/shared/FilterSelector";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonList } from "@/components/shared/Skeleton";
import { KitTile } from "@/components/kits/KitTile";
import { useCollectionStore } from "@/features/collection/collectionStore";
import {
  nextViewMode,
  usePreferencesStore,
  viewModeIcon,
} from "@/store/preferencesStore";
import type { CollectionItemSummary } from "@/features/collection/types";

/** Rows of 1 (list) or 2 (grid) items, sectioned per team. */
interface TeamSection {
  title: string;
  count: number;
  data: CollectionItemSummary[][];
}

/** Visual grid of the user's physical shirts, with filters (spec §33.2). */
export const CollectionScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const items = useCollectionStore((s) => s.items);
  const hasLoaded = useCollectionStore((s) => s.hasLoaded);
  const teams = useCollectionStore((s) => s.teams);
  const filters = useCollectionStore((s) => s.filters);
  const load = useCollectionStore((s) => s.load);
  const setFilters = useCollectionStore((s) => s.setFilters);
  const viewMode = usePreferencesStore((s) => s.viewMode);
  const setViewMode = usePreferencesStore((s) => s.setViewMode);
  const groupByTeam = usePreferencesStore((s) => s.groupByTeam);
  const toggleGroupByTeam = usePreferencesStore((s) => s.toggleGroupByTeam);
  const sortOption = usePreferencesStore((s) => s.sortOption);
  const setSortOption = usePreferencesStore((s) => s.setSortOption);
  const isGrid = viewMode === "grid";
  const isCompact = viewMode === "compact";

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

  const showingSold = filters.status === "sold";

  const sortedItems = useMemo(() => {
    if (sortOption === "dateDescending") return items; // service default order
    const copy = [...items];
    if (sortOption === "dateAscending")
      copy.sort(
        (a, b) => a.item.createdAt.getTime() - b.item.createdAt.getTime(),
      );
    else
      copy.sort(
        (a, b) =>
          a.teamName.localeCompare(b.teamName) ||
          a.eraLabel.localeCompare(b.eraLabel),
      );
    return copy;
  }, [items, sortOption]);

  const chooseSort = () => {
    const mark = (option: typeof sortOption, label: string) =>
      sortOption === option ? `✓ ${label}` : label;
    Alert.alert(t("collection.sortTitle"), undefined, [
      {
        text: mark("dateDescending", t("collection.sortNewest")),
        onPress: () => setSortOption("dateDescending"),
      },
      {
        text: mark("dateAscending", t("collection.sortOldest")),
        onPress: () => setSortOption("dateAscending"),
      },
      {
        text: mark("alphabetical", t("collection.sortAlpha")),
        onPress: () => setSortOption("alphabetical"),
      },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  // Pad odd counts with a spacer cell so the last card keeps half-row width.
  const listData = useMemo(
    () =>
      isGrid && sortedItems.length % 2 === 1
        ? [...sortedItems, null]
        : sortedItems,
    [sortedItems, isGrid],
  );

  const sections = useMemo<TeamSection[] | null>(() => {
    if (!groupByTeam) return null;
    const groups = new Map<
      string,
      { title: string; items: CollectionItemSummary[] }
    >();
    for (const summary of sortedItems) {
      const group = groups.get(summary.teamId);
      if (group) group.items.push(summary);
      else
        groups.set(summary.teamId, {
          title: summary.teamName,
          items: [summary],
        });
    }
    const rowSize = isGrid ? 2 : 1;
    return [...groups.values()]
      .sort((a, b) => a.title.localeCompare(b.title))
      .map(({ title, items: teamItems }) => {
        const rows: CollectionItemSummary[][] = [];
        for (let i = 0; i < teamItems.length; i += rowSize)
          rows.push(teamItems.slice(i, i + rowSize));
        return { title, count: teamItems.length, data: rows };
      });
  }, [sortedItems, groupByTeam, isGrid]);

  const renderSummary = (summary: CollectionItemSummary) => {
    const onPress = () =>
      navigation.navigate("ItemDetail", { itemId: summary.item.id });
    return (
      <KitTile
        summary={summary}
        onPress={onPress}
        variant={isGrid ? "card" : isCompact ? "compact" : "row"}
      />
    );
  };

  // Skeleton until the first load settles, so the list never flashes "empty".
  const emptyState = hasLoaded ? (
    <EmptyState
      title={
        showingSold ? t("collection.emptySold") : t("collection.emptyTitle")
      }
      message={showingSold ? undefined : t("collection.emptyMessage")}
    />
  ) : (
    <SkeletonList rows={8} />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
        <AppText variant="headline">{t("collection.title")}</AppText>
        <View style={styles.headerActions}>
          <Pressable
            onPress={chooseSort}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("collection.sortTitle")}
          >
            <Ionicons
              name="swap-vertical-outline"
              size={22}
              color={
                sortOption === "dateDescending"
                  ? colors.onSurface
                  : colors.secondary
              }
            />
          </Pressable>
          <Pressable
            onPress={toggleGroupByTeam}
            hitSlop={8}
            accessibilityRole="switch"
            accessibilityState={{ checked: groupByTeam }}
            accessibilityLabel={t("collection.groupByTeam")}
          >
            <Ionicons
              name={groupByTeam ? "albums" : "albums-outline"}
              size={22}
              color={groupByTeam ? colors.secondary : colors.onSurface}
            />
          </Pressable>
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
          <Pressable
            onPress={() =>
              setFilters({ ...filters, status: showingSold ? "owned" : "sold" })
            }
            hitSlop={8}
          >
            <Ionicons
              name={showingSold ? "archive" : "archive-outline"}
              size={22}
              color={showingSold ? colors.secondary : colors.onSurface}
            />
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Search")} hitSlop={8}>
            <Ionicons name="search" size={22} color={colors.onSurface} />
          </Pressable>
        </View>
      </View>

      {items.length > 0 ||
      filters.kitType ||
      filters.teamId ||
      filters.condition ? (
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
            value={filters.kitType ?? null}
            onChange={(kitType) =>
              setFilters({ ...filters, kitType: kitType ?? undefined })
            }
          />
          <FilterSelector
            label={t("collection.filterTeam")}
            allLabel={t("collection.allTeams")}
            options={teams.map((team) => ({
              value: team.id,
              label: team.name,
            }))}
            value={filters.teamId ?? null}
            onChange={(teamId) =>
              setFilters({ ...filters, teamId: teamId ?? undefined })
            }
          />
          <FilterSelector
            label={t("collection.filterCondition")}
            allLabel={t("collection.allConditions")}
            options={CONDITIONS.map((condition) => ({
              value: condition,
              label: t(`enums.condition.${condition}`),
            }))}
            value={filters.condition ?? null}
            onChange={(condition) =>
              setFilters({ ...filters, condition: condition ?? undefined })
            }
          />
        </View>
      ) : null}

      {showingSold ? (
        <View
          style={{
            paddingHorizontal: spacing.screen,
            paddingBottom: spacing.sm,
          }}
        >
          <AppText variant="labelSm" color={colors.tertiary}>
            {t("collection.showingSold")}
          </AppText>
        </View>
      ) : null}

      {sections ? (
        <SectionList<CollectionItemSummary[], TeamSection>
          key={`grouped-${viewMode}`}
          sections={sections}
          keyExtractor={(row) => row[0]?.item.id ?? "row"}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.screen,
            paddingBottom: spacing.xl,
          }}
          ListEmptyComponent={emptyState}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { marginBottom: spacing.sm }]}>
              <AppText variant="title">{section.title}</AppText>
              <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                {t("team.shirts", { count: section.count })}
              </AppText>
            </View>
          )}
          renderSectionFooter={() => <View style={{ height: spacing.md }} />}
          renderItem={({ item: row }) => (
            <View
              style={[
                isGrid ? styles.gridRow : null,
                {
                  gap: spacing.gutter,
                  marginBottom: isGrid ? spacing.gutter : spacing.xs,
                },
              ]}
            >
              {row.map((summary) => (
                <React.Fragment key={summary.item.id}>
                  {renderSummary(summary)}
                </React.Fragment>
              ))}
              {isGrid && row.length === 1 ? (
                <View style={styles.spacerCell} />
              ) : null}
            </View>
          )}
        />
      ) : (
        <FlatList
          key={viewMode}
          data={listData}
          keyExtractor={(s) => s?.item.id ?? "spacer"}
          numColumns={isGrid ? 2 : 1}
          {...(isGrid ? { columnWrapperStyle: { gap: spacing.gutter } } : null)}
          contentContainerStyle={{
            paddingHorizontal: spacing.screen,
            paddingBottom: spacing.xl,
            gap: isGrid ? spacing.gutter : spacing.xs,
          }}
          ListEmptyComponent={emptyState}
          renderItem={({ item: summary }) =>
            summary ? (
              renderSummary(summary)
            ) : (
              <View style={styles.spacerCell} />
            )
          }
        />
      )}
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
  // Wraps if a long selected value doesn't fit next to the other pills.
  filterBar: { flexDirection: "row", flexWrap: "wrap" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  gridRow: { flexDirection: "row" },
  spacerCell: { flex: 1 },
});

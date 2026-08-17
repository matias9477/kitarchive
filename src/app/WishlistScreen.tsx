import React, { useCallback, useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { EmptyState } from "@/components/shared/EmptyState";
import { KitCard } from "@/components/kits/KitCard";
import { KitListRow } from "@/components/kits/KitListRow";
import { useWishlistStore } from "@/features/wishlist/wishlistStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import type { WishlistEntry } from "@/features/wishlist/types";

/** Desired catalogue kits, with optional desired configuration (§33.6). */
export const WishlistScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const entries = useWishlistStore((s) => s.entries);
  const load = useWishlistStore((s) => s.load);
  const viewMode = usePreferencesStore((s) => s.viewMode);
  const setViewMode = usePreferencesStore((s) => s.setViewMode);
  const isGrid = viewMode === "grid";

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  // Pad odd counts with a spacer cell so the last card keeps half-row width.
  const listData = useMemo(
    () => (isGrid && entries.length % 2 === 1 ? [...entries, null] : entries),
    [entries, isGrid],
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
          onPress={() => setViewMode(isGrid ? "list" : "grid")}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("common.toggleView")}
        >
          <Ionicons
            name={isGrid ? "list-outline" : "grid-outline"}
            size={22}
            color={colors.onSurface}
          />
        </Pressable>
      </View>
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
          <EmptyState
            icon="star-outline"
            title={t("wishlist.emptyTitle")}
            message={t("wishlist.emptyMessage")}
          />
        }
        renderItem={({ item: entry }) => {
          if (!entry) return <View style={styles.cell} />;
          const desired = desiredLine(entry);
          const onPress = () =>
            navigation.navigate("KitDetail", { kitId: entry.entry.kitId });
          if (!isGrid) {
            return (
              <KitListRow
                summary={entry.kit}
                onPress={onPress}
                detail={desired}
              />
            );
          }
          return (
            <View style={styles.cell}>
              <KitCard summary={entry.kit} onPress={onPress} detail={desired} />
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
  cell: { flex: 1, gap: 4 },
});

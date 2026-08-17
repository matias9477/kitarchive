import React, { useCallback, useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { KIT_TYPES } from "@/config/constants";
import { AppText } from "@/components/shared/AppText";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { EmptyState } from "@/components/shared/EmptyState";
import { ItemCard } from "@/components/kits/ItemCard";
import { useCollectionStore } from "@/features/collection/collectionStore";

/** Visual grid of the user's physical shirts, with filters (spec §33.2). */
export const CollectionScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const items = useCollectionStore((s) => s.items);
  const filters = useCollectionStore((s) => s.filters);
  const load = useCollectionStore((s) => s.load);
  const setFilters = useCollectionStore((s) => s.setFilters);

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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
        <AppText variant="headline">{t("collection.title")}</AppText>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() =>
              setFilters({ ...filters, status: showingSold ? "owned" : "sold" })
            }
            hitSlop={8}
          >
            <Ionicons
              name={showingSold ? "archive" : "archive-outline"}
              size={22}
              color={showingSold ? colors.tertiary : colors.onSurface}
            />
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Search")} hitSlop={8}>
            <Ionicons name="search" size={22} color={colors.onSurface} />
          </Pressable>
        </View>
      </View>

      <View
        style={{ paddingHorizontal: spacing.screen, paddingBottom: spacing.sm }}
      >
        <SegmentedControl
          options={typeOptions}
          value={filters.kitType ?? null}
          onChange={(kitType) =>
            setFilters({ ...filters, kitType: kitType ?? undefined })
          }
          clearable
        />
      </View>

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

      <FlatList
        data={items}
        keyExtractor={(s) => s.item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.gutter }}
        contentContainerStyle={{
          paddingHorizontal: spacing.screen,
          paddingBottom: spacing.xl,
          gap: spacing.gutter,
        }}
        ListEmptyComponent={
          <EmptyState
            title={
              showingSold
                ? t("collection.emptySold")
                : t("collection.emptyTitle")
            }
            message={showingSold ? undefined : t("collection.emptyMessage")}
          />
        }
        renderItem={({ item: summary }) => (
          <ItemCard
            summary={summary}
            onPress={() =>
              navigation.navigate("ItemDetail", { itemId: summary.item.id })
            }
          />
        )}
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
  headerActions: { flexDirection: "row", gap: 16 },
});

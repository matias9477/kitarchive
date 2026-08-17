import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { Chip } from "@/components/shared/Chip";
import { EmptyState } from "@/components/shared/EmptyState";
import { KitPlaceholder } from "@/components/kits/KitPlaceholder";
import { useSearchStore } from "@/features/search/searchStore";
import type { KitSummary } from "@/features/catalogue/types";

/** Global search grouped by My Collection / Wishlist / Catalogue (§33.9). */
export const SearchScreen: React.FC = () => {
  const { colors, spacing, radius, typography } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const results = useSearchStore((s) => s.results);
  const search = useSearchStore((s) => s.search);
  const clear = useSearchStore((s) => s.clear);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (query.trim().length < 2) return;
    const handle = setTimeout(() => void search(query), 200);
    return () => clearTimeout(handle);
  }, [query, search]);

  useEffect(() => () => clear(), [clear]);

  const renderGroup = (title: string, kits: KitSummary[]) => {
    if (kits.length === 0) return null;
    return (
      <View key={title} style={{ gap: spacing.xs }}>
        <AppText
          variant="label"
          color={colors.onPrimaryContainer}
          style={{ marginTop: spacing.md }}
        >
          {title}
        </AppText>
        {kits.map((summary) => (
          <Pressable
            key={summary.kit.id}
            onPress={() =>
              navigation.navigate("KitDetail", { kitId: summary.kit.id })
            }
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: colors.surfaceContainer,
                borderRadius: radius.md,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <View style={[styles.thumb, { borderRadius: radius.sm + 4 }]}>
              <KitPlaceholder
                primaryColor={summary.teamPrimaryColor}
                secondaryColor={summary.teamSecondaryColor}
              />
            </View>
            <View style={styles.rowText}>
              <AppText variant="titleSm" numberOfLines={1}>
                {summary.teamName} · {t(`enums.kitType.${summary.kit.type}`)}
              </AppText>
              <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                {summary.eraLabel}
                {summary.manufacturerName
                  ? ` · ${summary.manufacturerName}`
                  : ""}
              </AppText>
            </View>
            {summary.ownedCount > 0 ? (
              <Chip
                label={
                  summary.ownedCount > 1
                    ? `×${summary.ownedCount}`
                    : t("enums.status.owned")
                }
                icon="checkmark-circle"
                tone="goldSoft"
              />
            ) : summary.wishlisted ? (
              <Ionicons name="star" size={16} color={colors.tertiary} />
            ) : null}
          </Pressable>
        ))}
      </View>
    );
  };

  const hasResults =
    results != null &&
    results.collection.length +
      results.wishlist.length +
      results.catalogue.length >
      0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: spacing.screen }}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.surfaceContainer,
              borderRadius: radius.md,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.outline} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t("search.placeholder")}
            placeholderTextColor={colors.outline}
            autoFocus
            keyboardAppearance="dark"
            style={[
              styles.searchInput,
              typography.body,
              { color: colors.onSurface },
            ]}
          />
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.screen,
          paddingBottom: spacing.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {results && !hasResults && results.query ? (
          <EmptyState icon="search-outline" title={t("search.noResults")} />
        ) : null}
        {results ? (
          <>
            {renderGroup(t("search.myCollection"), results.collection)}
            {renderGroup(t("search.wishlist"), results.wishlist)}
            {renderGroup(t("search.catalogue"), results.catalogue)}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, paddingVertical: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowText: { flex: 1, gap: 2 },
  thumb: { width: 40, height: 52, overflow: "hidden" },
});

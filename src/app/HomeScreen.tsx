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
import { AppText } from "@/components/shared/AppText";
import { StatTile } from "@/components/shared/StatTile";
import { Section } from "@/components/shared/Section";
import { EmptyState } from "@/components/shared/EmptyState";
import { ItemCard } from "@/components/kits/ItemCard";
import { useStatsStore } from "@/features/stats/statsStore";

/** Dashboard — collection overview, recently added, team breakdown. */
export const HomeScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dashboard = useStatsStore((s) => s.dashboard);
  const loadDashboard = useStatsStore((s) => s.loadDashboard);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard]),
  );

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
        <View style={styles.tiles}>
          <StatTile
            value={dashboard?.totalOwned ?? 0}
            label={t("home.totalShirts")}
            accent
          />
          <StatTile
            value={dashboard?.wishlistCount ?? 0}
            label={t("home.wishlist")}
          />
          <StatTile value={dashboard?.teamCount ?? 0} label={t("home.teams")} />
        </View>

        {dashboard && dashboard.totalOwned === 0 ? (
          <EmptyState
            title={t("home.emptyTitle")}
            message={t("home.emptyMessage")}
          />
        ) : null}

        {dashboard && dashboard.recentItems.length > 0 ? (
          <Section title={t("home.recentlyAdded")}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={dashboard.recentItems}
              keyExtractor={(s) => s.item.id}
              contentContainerStyle={{ gap: spacing.gutter }}
              renderItem={({ item: summary }) => (
                <View style={styles.recentCard}>
                  <ItemCard
                    summary={summary}
                    onPress={() =>
                      navigation.navigate("ItemDetail", {
                        itemId: summary.item.id,
                      })
                    }
                  />
                </View>
              )}
            />
          </Section>
        ) : null}

        {dashboard && dashboard.byTeam.length > 0 ? (
          <Section title={t("home.byTeam")}>
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
          <Section title={t("home.duplicates")}>
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
  tiles: { flexDirection: "row", gap: 12 },
  recentCard: { width: 150 },
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

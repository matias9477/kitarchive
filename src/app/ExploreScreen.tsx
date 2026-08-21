import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { CountryFlag } from "@/components/shared/CountryFlag";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonList } from "@/components/shared/Skeleton";
import { GroupRow } from "@/components/shared/GroupRow";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { useCatalogueStore } from "@/features/catalogue/catalogueStore";
import { Image } from "expo-image";
import { CONFEDERATION_LOGOS } from "@/config/confederationLogos";
import { confederationByCountry } from "@/db/seed/world";
import type { Confederation } from "@/db/seed/world";

type Mode = "clubs" | "national";

/** Grouping order: the collector's confederation first, then the rest. */
const CONFEDERATIONS: (Confederation | "other")[] = [
  "conmebol",
  "uefa",
  "concacaf",
  "caf",
  "afc",
  "ofc",
  "other",
];

interface Group {
  key: string;
  title: string;
  count: number;
  leading: React.ReactNode;
  onPress: () => void;
}

/**
 * Browse the catalogue: teams → eras → kits (spec §33.8). With the world
 * seed a flat team list stopped scaling, so the first level is groups —
 * countries for clubs, confederations for national teams — and ExploreGroup
 * shows one group's teams.
 */
export const ExploreScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const teams = useCatalogueStore((s) => s.teams);
  const hasLoadedTeams = useCatalogueStore((s) => s.hasLoadedTeams);
  const loadTeams = useCatalogueStore((s) => s.loadTeams);
  const [mode, setMode] = useState<Mode>("clubs");

  useFocusEffect(
    useCallback(() => {
      void loadTeams();
    }, [loadTeams]),
  );

  const groups = useMemo<Group[]>(() => {
    if (mode === "national") {
      const counts = new Map<string, number>();
      for (const team of teams) {
        if (team.type !== "national") continue;
        const key = confederationByCountry[team.countryId] ?? "other";
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      return CONFEDERATIONS.filter((key) => (counts.get(key) ?? 0) > 0).map(
        (key) => ({
          key,
          title:
            key === "other"
              ? t("explore.otherRegion")
              : t(`enums.confederation.${key}`),
          count: counts.get(key) ?? 0,
          leading:
            key === "other" ? (
              <Ionicons name="globe-outline" size={20} color={colors.outline} />
            ) : (
              <View
                style={[
                  styles.confedChip,
                  { backgroundColor: colors.inverseSurface },
                ]}
              >
                <Image
                  source={CONFEDERATION_LOGOS[key]}
                  style={styles.confedLogo}
                  contentFit="contain"
                />
              </View>
            ),
          onPress: () =>
            navigation.navigate("ExploreGroup", {
              kind: "confederation",
              confederation: key,
            }),
        }),
      );
    }

    const byCountry = new Map<string, { name: string; count: number }>();
    for (const team of teams) {
      if (team.type === "national") continue;
      const entry = byCountry.get(team.countryId) ?? {
        name: team.countryName,
        count: 0,
      };
      entry.count += 1;
      byCountry.set(team.countryId, entry);
    }
    return [...byCountry.entries()]
      .sort(([, a], [, b]) => a.name.localeCompare(b.name))
      .map(([countryId, { name, count }]) => ({
        key: countryId,
        title: name,
        count,
        leading: (
          <CountryFlag countryId={countryId} countryName={name} size={16} />
        ),
        onPress: () =>
          navigation.navigate("ExploreGroup", { kind: "country", countryId }),
      }));
  }, [teams, mode, t, colors, navigation]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
        <AppText variant="headline">{t("explore.title")}</AppText>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => navigation.navigate("CreateKit")}
            hitSlop={8}
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={colors.onSurface}
            />
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Search")} hitSlop={8}>
            <Ionicons name="search" size={22} color={colors.onSurface} />
          </Pressable>
        </View>
      </View>

      <View
        style={{ paddingHorizontal: spacing.screen, marginBottom: spacing.sm }}
      >
        <SegmentedControl<Mode>
          options={[
            { value: "clubs", label: t("explore.clubs") },
            { value: "national", label: t("explore.nationalTeams") },
          ]}
          value={mode}
          onChange={(value) => {
            if (value) setMode(value);
          }}
        />
      </View>

      <FlatList
        data={groups}
        keyExtractor={(group) => group.key}
        contentContainerStyle={{
          paddingHorizontal: spacing.screen,
          paddingBottom: spacing.xl,
          gap: spacing.xs,
        }}
        ListEmptyComponent={
          hasLoadedTeams ? (
            <EmptyState title={t("explore.empty")} />
          ) : (
            <SkeletonList rows={8} />
          )
        }
        renderItem={({ item }) => (
          <GroupRow
            title={item.title}
            subtitle={t("explore.teamCount", { count: item.count })}
            leading={item.leading}
            onPress={item.onPress}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  confedChip: {
    width: 30,
    height: 30,
    borderRadius: 8,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  confedLogo: { width: "100%", height: "100%" },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  headerActions: { flexDirection: "row", gap: 16, alignItems: "center" },
});

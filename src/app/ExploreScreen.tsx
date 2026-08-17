import React, { useCallback, useMemo } from "react";
import { Pressable, SectionList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { CountryFlag } from "@/components/shared/CountryFlag";
import { EmptyState } from "@/components/shared/EmptyState";
import { useCatalogueStore } from "@/features/catalogue/catalogueStore";
import type { TeamWithCountry } from "@/features/catalogue/types";

/** Browse the catalogue: teams → eras → kits (spec §33.8). */
export const ExploreScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const teams = useCatalogueStore((s) => s.teams);
  const loadTeams = useCatalogueStore((s) => s.loadTeams);

  useFocusEffect(
    useCallback(() => {
      void loadTeams();
    }, [loadTeams]),
  );

  const sections = useMemo(() => {
    const clubs = teams.filter((team) => team.type === "club");
    const nationals = teams.filter((team) => team.type === "national");
    return [
      { title: t("explore.nationalTeams"), data: nationals },
      { title: t("explore.clubs"), data: clubs },
    ].filter((s) => s.data.length > 0);
  }, [teams, t]);

  const renderTeam = (team: TeamWithCountry) => (
    <Pressable
      onPress={() => navigation.navigate("TeamDetail", { teamId: team.id })}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.surfaceContainer,
          borderRadius: radius.md,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.swatch,
          {
            backgroundColor: team.primaryColor,
            borderColor: colors.outlineVariant,
          },
        ]}
      >
        {team.secondaryColor ? (
          <View
            style={[
              styles.swatchBand,
              { backgroundColor: team.secondaryColor },
            ]}
          />
        ) : null}
      </View>
      <View style={styles.rowText}>
        <AppText variant="titleSm">{team.name}</AppText>
        <View style={styles.countryRow}>
          <CountryFlag
            countryId={team.countryId}
            countryName={team.countryName}
            size={12}
          />
          <AppText variant="labelSm" color={colors.onSurfaceVariant}>
            {team.countryName}
          </AppText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.outline} />
    </Pressable>
  );

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

      <SectionList
        sections={sections}
        keyExtractor={(team) => team.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.screen,
          paddingBottom: spacing.xl,
          gap: spacing.xs,
        }}
        ListEmptyComponent={<EmptyState title={t("explore.empty")} />}
        renderSectionHeader={({ section }) => (
          <AppText
            variant="label"
            color={colors.onPrimaryContainer}
            style={{ marginTop: spacing.md, marginBottom: spacing.xs }}
          >
            {section.title}
          </AppText>
        )}
        renderItem={({ item }) => renderTeam(item)}
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
  headerActions: { flexDirection: "row", gap: 16, alignItems: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowText: { flex: 1, gap: 2 },
  countryRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  swatchBand: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "33%",
    width: "34%",
  },
});

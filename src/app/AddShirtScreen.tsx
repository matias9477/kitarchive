import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { Chip } from "@/components/shared/Chip";
import { EmptyState } from "@/components/shared/EmptyState";
import { KitPlaceholder } from "@/components/kits/KitPlaceholder";
import { TeamRow } from "@/components/kits/TeamRow";
import { useCatalogueStore } from "@/features/catalogue/catalogueStore";
import {
  getSuggestedTeams,
  searchKitSummaries,
} from "@/features/catalogue/catalogueService";
import type { KitSummary, TeamWithCountry } from "@/features/catalogue/types";

/**
 * Add-shirt wizard, step 1: identify the catalogue kit — search first,
 * browse by team as fallback, extend the catalogue as a last resort (§33.5).
 */
export const AddShirtScreen: React.FC = () => {
  const { colors, spacing, radius, typography } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const teams = useCatalogueStore((s) => s.teams);
  const loadTeams = useCatalogueStore((s) => s.loadTeams);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KitSummary[]>([]);
  const [suggestions, setSuggestions] = useState<TeamWithCountry[]>([]);

  useFocusEffect(
    useCallback(() => {
      void loadTeams();
      void getSuggestedTeams().then(setSuggestions);
    }, [loadTeams]),
  );

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      void searchKitSummaries(query).then(setResults);
    }, 200);
    return () => clearTimeout(handle);
  }, [query]);

  const renderKitRow = (summary: KitSummary) => (
    <Pressable
      onPress={() => navigation.navigate("ItemForm", { kitId: summary.kit.id })}
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
          {summary.manufacturerName ? ` · ${summary.manufacturerName}` : ""}
        </AppText>
      </View>
      {summary.ownedCount > 0 ? (
        <Chip
          label={t("addShirt.owned", { count: summary.ownedCount })}
          tone="gold"
        />
      ) : null}
    </Pressable>
  );

  const renderTeamRow = (team: TeamWithCountry) => (
    <TeamRow
      team={team}
      onPress={() => navigation.navigate("TeamDetail", { teamId: team.id })}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: spacing.screen, gap: spacing.sm }}>
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
            placeholder={t("addShirt.searchPlaceholder")}
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

      {query.trim().length >= 2 ? (
        <FlatList
          data={results}
          keyExtractor={(s) => s.kit.id}
          contentContainerStyle={{
            paddingHorizontal: spacing.screen,
            paddingBottom: spacing.xl,
            gap: spacing.xs,
          }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<EmptyState title={t("addShirt.noResults")} />}
          ListFooterComponent={
            <Pressable
              onPress={() => navigation.navigate("CreateKit")}
              style={styles.footerLink}
            >
              <AppText variant="bodySm" color={colors.secondary}>
                {t("addShirt.cantFind")}
              </AppText>
            </Pressable>
          }
          renderItem={({ item }) => renderKitRow(item)}
        />
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(team) => team.id}
          contentContainerStyle={{
            paddingHorizontal: spacing.screen,
            paddingBottom: spacing.xl,
            gap: spacing.xs,
          }}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View>
              {suggestions.length > 0 ? (
                <View style={{ gap: spacing.xs, marginBottom: spacing.md }}>
                  <AppText variant="label" color={colors.onPrimaryContainer}>
                    {t("addShirt.suggestions")}
                  </AppText>
                  {suggestions.map((team) => (
                    <React.Fragment key={team.id}>
                      {renderTeamRow(team)}
                    </React.Fragment>
                  ))}
                </View>
              ) : null}
              <AppText
                variant="label"
                color={colors.onPrimaryContainer}
                style={{ marginBottom: spacing.xs }}
              >
                {t("addShirt.browseTeams")}
              </AppText>
            </View>
          }
          renderItem={({ item: team }) => renderTeamRow(team)}
        />
      )}
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
  footerLink: { paddingVertical: 16, alignItems: "center" },
});

import React, { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { EmptyState } from "@/components/shared/EmptyState";
import { TeamRow } from "@/components/kits/TeamRow";
import { useCatalogueStore } from "@/features/catalogue/catalogueStore";
import { confederationByCountry } from "@/db/seed/world";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "ExploreGroup">;

/** Second Explore level: one country's clubs, or one confederation's nations. */
export const ExploreGroupScreen: React.FC<Props> = ({ route, navigation }) => {
  const params = route.params;
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const teams = useCatalogueStore((s) => s.teams);
  const loadTeams = useCatalogueStore((s) => s.loadTeams);

  useFocusEffect(
    useCallback(() => {
      void loadTeams();
    }, [loadTeams]),
  );

  const data = useMemo(
    () =>
      params.kind === "country"
        ? teams.filter(
            (team) =>
              team.type !== "national" && team.countryId === params.countryId,
          )
        : teams.filter(
            (team) =>
              team.type === "national" &&
              (confederationByCountry[team.countryId] ?? "other") ===
                params.confederation,
          ),
    [teams, params],
  );

  React.useLayoutEffect(() => {
    const title =
      params.kind === "country"
        ? (data[0]?.countryName ?? "")
        : params.confederation === "other"
          ? t("explore.otherRegion")
          : t(`enums.confederation.${params.confederation}`);
    if (title) navigation.setOptions({ title });
  }, [navigation, params, data, t]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={data}
        keyExtractor={(team) => team.id}
        contentContainerStyle={{
          padding: spacing.screen,
          paddingBottom: spacing.xl,
          gap: spacing.xs,
        }}
        ListEmptyComponent={<EmptyState title={t("explore.empty")} />}
        renderItem={({ item: team }) => (
          <TeamRow
            team={team}
            onPress={() =>
              navigation.navigate("TeamDetail", { teamId: team.id })
            }
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

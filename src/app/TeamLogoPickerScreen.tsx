import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { TextField } from "@/components/shared/TextField";
import { useCatalogueStore } from "@/features/catalogue/catalogueStore";
import { persistPickedImage } from "@/lib/images";
import { TEAM_LOGOS } from "@/config/teamLogos";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "TeamLogoPicker">;

interface LogoEntry {
  key: string;
  name: string;
  source: number;
}

const ALL_LOGOS: LogoEntry[] = Object.entries(TEAM_LOGOS)
  .map(([key, entry]) => ({ key, ...entry }))
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * Team-logo picker (modal): the bundled national-team crest library, plus a
 * custom photo from the library, plus reverting to the default art. Bundled
 * crests are trademarked federation art — fine for a personal archive, not
 * for resale.
 */
export const TeamLogoPickerScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { teamId } = route.params;
  const { colors, radius, spacing } = useTheme();
  const { t } = useTranslation();
  const team = useCatalogueStore((s) =>
    s.teams.find((candidate) => candidate.id === teamId),
  );
  const loadTeams = useCatalogueStore((s) => s.loadTeams);
  const setTeamLogo = useCatalogueStore((s) => s.setTeamLogo);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (!team) void loadTeams();
  }, [team, loadTeams]);

  const logos = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_LOGOS;
    return ALL_LOGOS.filter(
      (entry) => entry.name.toLowerCase().includes(q) || entry.key.includes(q),
    );
  }, [query]);

  const finish = useCallback(
    async (logo: { logoAsset?: string; logoUri?: string }) => {
      if (saving) return;
      setSaving(true);
      try {
        await setTeamLogo(teamId, logo);
        navigation.goBack();
      } finally {
        setSaving(false);
      }
    },
    [saving, setTeamLogo, teamId, navigation],
  );

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });
    const asset = result.assets?.[0];
    if (!asset) return;
    const uri = await persistPickedImage(asset.uri);
    await finish({ logoUri: uri });
  };

  /** The key currently shown, whether stored or the id-matched default. */
  const activeKey = team?.logoUri
    ? null
    : (team?.logoAsset ?? (team && TEAM_LOGOS[team.id] ? team.id : null));
  const hasStoredLogo = Boolean(team?.logoAsset || team?.logoUri);

  const actionRow = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    onPress: () => void,
  ) => (
    <Pressable
      onPress={onPress}
      disabled={saving}
      style={({ pressed }) => [
        styles.actionRow,
        {
          backgroundColor: colors.surfaceContainer,
          borderRadius: radius.md,
          opacity: pressed || saving ? 0.7 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={18} color={colors.secondary} />
      <AppText variant="titleSm">{label}</AppText>
    </Pressable>
  );

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.screen, gap: 10 }}
      data={logos}
      numColumns={4}
      columnWrapperStyle={{ gap: 10 }}
      keyExtractor={(entry) => entry.key}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={{ gap: spacing.sm, marginBottom: spacing.sm }}>
          {actionRow("images-outline", t("teamLogo.fromLibrary"), () => {
            void pickPhoto();
          })}
          {hasStoredLogo
            ? actionRow("refresh-outline", t("teamLogo.remove"), () => {
                void finish({});
              })
            : null}
          <TextField
            label={t("teamLogo.search")}
            placeholder={t("teamLogo.searchPlaceholder")}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      }
      ListEmptyComponent={
        <AppText
          variant="bodySm"
          color={colors.onSurfaceVariant}
          style={styles.empty}
        >
          {t("teamLogo.empty")}
        </AppText>
      }
      renderItem={({ item }) => {
        const selected = item.key === activeKey;
        return (
          <Pressable
            onPress={() => {
              void finish({ logoAsset: item.key });
            }}
            disabled={saving}
            style={({ pressed }) => [
              styles.cell,
              { opacity: pressed || saving ? 0.7 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={item.name}
          >
            <View
              style={[
                styles.logoChip,
                {
                  borderRadius: radius.md,
                  borderWidth: 2,
                  borderColor: selected ? colors.secondary : "transparent",
                },
              ]}
            >
              <Image
                source={item.source}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
            <AppText
              variant="labelSm"
              numberOfLines={1}
              color={selected ? colors.secondary : colors.onSurfaceVariant}
            >
              {item.name}
            </AppText>
          </Pressable>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cell: {
    flex: 1,
    maxWidth: "25%",
    alignItems: "center",
    gap: 4,
  },
  empty: { textAlign: "center", paddingVertical: 24 },
  logo: { width: "100%", height: "100%" },
  logoChip: {
    alignSelf: "stretch",
    aspectRatio: 1,
    padding: 6,
  },
});

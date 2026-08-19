import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { CountryFlag } from "@/components/shared/CountryFlag";
import { TeamLogo } from "@/components/shared/TeamLogo";
import type { TeamWithCountry } from "@/features/catalogue/types";

interface TeamRowProps {
  team: TeamWithCountry;
  onPress: () => void;
}

/**
 * Catalogue team list row: team logo, name, flag + subtitle, chevron.
 * National teams would repeat their name as the country ("Argentina /
 * Argentina"), so there the subtitle shows the team type instead.
 */
export const TeamRow: React.FC<TeamRowProps> = ({ team, onPress }) => {
  const { colors, radius } = useTheme();
  const { t } = useTranslation();

  const subtitle =
    team.name === team.countryName
      ? t(`enums.teamType.${team.type}`)
      : team.countryName;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.surfaceContainer,
          borderRadius: radius.md,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <TeamLogo team={team} size={40} />
      <View style={styles.rowText}>
        <AppText variant="titleSm" numberOfLines={1}>
          {team.name}
        </AppText>
        <View style={styles.subtitleRow}>
          <CountryFlag
            countryId={team.countryId}
            countryName={team.countryName}
            size={12}
          />
          <AppText variant="labelSm" color={colors.onSurfaceVariant}>
            {subtitle}
          </AppText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.outline} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowText: { flex: 1, gap: 2 },
  subtitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
});

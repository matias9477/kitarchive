import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/theme/index";
import { TEAM_LOGOS } from "@/config/teamLogos";
import type { Team } from "@/features/catalogue/types";

type TeamLogoTeam = Pick<
  Team,
  "id" | "primaryColor" | "secondaryColor" | "logoAsset" | "logoUri"
>;

interface TeamLogoProps {
  team: TeamLogoTeam;
  size?: number;
}

/**
 * Team art with a resolution ladder: custom photo → chosen bundled logo →
 * bundled logo whose key matches the team id → color-swatch placeholder.
 * Seed team ids equal the logo keys (e.g. "argentina", "boca-juniors"), so
 * seeded teams show their crest without any stored value. Crests render
 * full-bleed with no backing shape.
 */
export const TeamLogo: React.FC<TeamLogoProps> = ({ team, size = 36 }) => {
  const { colors } = useTheme();
  const frame = {
    width: size,
    height: size,
    borderRadius: size * 0.28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
  };

  if (team.logoUri) {
    return (
      <Image
        source={{ uri: team.logoUri }}
        style={[
          frame,
          styles.clip,
          { backgroundColor: colors.surfaceContainerHighest },
        ]}
        contentFit="cover"
      />
    );
  }

  const logo = TEAM_LOGOS[team.logoAsset ?? team.id];
  if (logo) {
    return (
      <Image
        source={logo.source}
        style={{ width: size, height: size }}
        contentFit="contain"
      />
    );
  }

  return (
    <View style={[styles.clip, frame, { backgroundColor: team.primaryColor }]}>
      {team.secondaryColor ? (
        <View style={[styles.band, { backgroundColor: team.secondaryColor }]} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  band: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "33%",
    width: "34%",
  },
  clip: { overflow: "hidden" },
});

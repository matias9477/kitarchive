import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { KitPlaceholder } from "./KitPlaceholder";
import type { CollectionItemSummary } from "@/features/collection/types";

interface RecentItemCardProps {
  summary: CollectionItemSummary;
  onPress: () => void;
}

/**
 * Large image-first card for the Home "Recently added" rail: badge top-left
 * (match-worn/-issued in gold, otherwise condition), era + kit-type pills and
 * the team name over a bottom vignette so text stays legible on photos.
 */
export const RecentItemCard: React.FC<RecentItemCardProps> = ({
  summary,
  onPress,
}) => {
  const { colors, radius } = useTheme();
  const { t } = useTranslation();
  const { item, teamName, eraLabel, kitType, imageUri } = summary;

  const isMatchWorn =
    item.productVersion === "match_worn" ||
    item.productVersion === "match_issued";
  const badgeLabel = isMatchWorn
    ? t(`enums.productVersion.${item.productVersion}`)
    : t(`enums.condition.${item.condition}`);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surfaceContainer,
          borderRadius: radius.xl,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : (
        <View style={StyleSheet.absoluteFill}>
          <KitPlaceholder
            primaryColor={summary.teamPrimaryColor}
            secondaryColor={summary.teamSecondaryColor}
          />
        </View>
      )}

      {/* Bottom vignette (DESIGN.md image treatment) */}
      <LinearGradient
        colors={["transparent", "rgba(11,15,16,0.55)", "rgba(11,15,16,0.92)"]}
        locations={[0.45, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top-left badge */}
      <View
        style={[
          styles.badge,
          isMatchWorn
            ? {
                backgroundColor: "rgba(11,15,16,0.7)",
                borderColor: colors.tertiary,
              }
            : {
                backgroundColor: "rgba(11,15,16,0.7)",
                borderColor: "rgba(255,255,255,0.14)",
              },
          { borderRadius: radius.md },
        ]}
      >
        <AppText
          variant="label"
          color={isMatchWorn ? colors.tertiary : colors.onSurface}
        >
          {badgeLabel}
        </AppText>
      </View>

      {/* Bottom shelf */}
      <View style={styles.shelf}>
        <View style={styles.pills}>
          <View style={[styles.pill, { borderRadius: radius.sm + 2 }]}>
            <AppText variant="labelSm" color={colors.onSurface}>
              {eraLabel}
            </AppText>
          </View>
          <View style={[styles.pill, { borderRadius: radius.sm + 2 }]}>
            <AppText variant="labelSm" color={colors.onSurface}>
              {t(`enums.kitType.${kitType}`).toUpperCase()}
            </AppText>
          </View>
        </View>
        <AppText variant="title" numberOfLines={1}>
          {teamName}
        </AppText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 210,
    aspectRatio: 4 / 5,
    overflow: "hidden",
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  shelf: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    gap: 6,
  },
  pills: { flexDirection: "row", gap: 6 },
  pill: {
    backgroundColor: "rgba(11,15,16,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { ImageOverlayShelf } from "./ImageOverlayShelf";
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

      <ImageOverlayShelf
        labels={[eraLabel, t(`enums.kitType.${kitType}`).toUpperCase()]}
        title={teamName}
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
});

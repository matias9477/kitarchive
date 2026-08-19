import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { Chip } from "@/components/shared/Chip";
import { KitImageView } from "./KitImageView";
import type { CollectionItemSummary } from "@/features/collection/types";

interface ItemCardProps {
  summary: CollectionItemSummary;
  onPress: () => void;
}

/** Collection-grid card for one physical shirt. */
export const ItemCard: React.FC<ItemCardProps> = ({ summary, onPress }) => {
  const { colors, radius, spacing } = useTheme();
  const { t } = useTranslation();
  const { item, teamName, eraLabel, kitType, playerName, imageUri } = summary;

  const backLine =
    item.backType === "player" && playerName
      ? `${playerName}${item.number != null ? ` #${item.number}` : ""}`
      : item.backType === "custom" && item.customName
        ? `${item.customName}${item.number != null ? ` #${item.number}` : ""}`
        : item.backType === "number_only" && item.number != null
          ? `#${item.number}`
          : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surfaceContainer,
          borderRadius: radius.lg,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={[styles.imageArea, { borderRadius: radius.lg - 4 }]}>
        <KitImageView
          uri={imageUri}
          primaryColor={summary.teamPrimaryColor}
          secondaryColor={summary.teamSecondaryColor}
          style={styles.image}
        />
        {item.status === "sold" ? (
          <View style={[styles.soldOverlay, { borderRadius: radius.lg - 4 }]}>
            <Chip label={t("enums.status.sold")} tone="error" />
          </View>
        ) : null}
      </View>
      <View style={[styles.shelf, { padding: spacing.sm + 2 }]}>
        <AppText variant="titleSm" numberOfLines={1}>
          {teamName}
        </AppText>
        <AppText
          variant="labelSm"
          color={colors.onSurfaceVariant}
          numberOfLines={1}
        >
          {eraLabel} · {t(`enums.kitType.${kitType}`)}
        </AppText>
        <View style={styles.chips}>
          <Chip label={t(`enums.condition.${item.condition}`)} tone="outline" />
          {backLine ? <Chip label={backLine} tone="neutral" /> : null}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { flex: 1, overflow: "hidden" },
  imageArea: { aspectRatio: 3 / 4, overflow: "hidden" },
  image: { width: "100%", height: "100%" },
  soldOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(11,15,16,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  shelf: { gap: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 2 },
});

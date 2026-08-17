import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { Chip } from "@/components/shared/Chip";
import { KitPlaceholder } from "./KitPlaceholder";
import type { CollectionItemSummary } from "@/features/collection/types";

interface ItemListRowProps {
  summary: CollectionItemSummary;
  onPress: () => void;
}

/** Compact list alternative to ItemCard for one physical shirt. */
export const ItemListRow: React.FC<ItemListRowProps> = ({
  summary,
  onPress,
}) => {
  const { colors, radius } = useTheme();
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

  const subtitle = [eraLabel, t(`enums.kitType.${kitType}`), backLine]
    .filter(Boolean)
    .join(" · ");

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
      <View style={[styles.thumb, { borderRadius: radius.sm }]}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <KitPlaceholder
            primaryColor={summary.teamPrimaryColor}
            secondaryColor={summary.teamSecondaryColor}
          />
        )}
      </View>
      <View style={styles.text}>
        <AppText variant="titleSm" numberOfLines={1}>
          {teamName}
        </AppText>
        <AppText
          variant="labelSm"
          color={colors.onSurfaceVariant}
          numberOfLines={1}
        >
          {subtitle}
        </AppText>
      </View>
      {item.status === "sold" ? (
        <Chip label={t("enums.status.sold")} tone="error" />
      ) : (
        <Chip label={t(`enums.condition.${item.condition}`)} tone="outline" />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  thumb: { width: 44, height: 56, overflow: "hidden" },
  image: { width: "100%", height: "100%" },
  text: { flex: 1, gap: 2 },
});

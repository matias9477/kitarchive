import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { Chip } from "@/components/shared/Chip";
import { KitImageView } from "./KitImageView";
import type { KitSummary } from "@/features/catalogue/types";
import type { CollectionItemSummary } from "@/features/collection/types";

type KitTileSummary = KitSummary | CollectionItemSummary;

const isItem = (s: KitTileSummary): s is CollectionItemSummary => "item" in s;

interface KitTileProps {
  summary: KitTileSummary;
  onPress: () => void;
  /** card = poster (grids/rails), row = thumbnail list row, compact = dense
   * text-only line. Defaults to card. */
  variant?: "card" | "row" | "compact";
  /** Fixed card width for horizontal rails; omit to fill a grid cell. */
  width?: number;
  /** Hide the team name when the surrounding list is already per-team. */
  showTeam?: boolean;
  /** Extra gold context line (e.g. wishlist desired config). */
  detail?: string | null;
  /** Replaces the default trailing on rows (e.g. bulk-add queue state). */
  trailing?: React.ReactNode;
}

/**
 * The one renderer for a kit/shirt anywhere in the app — catalogue kits and
 * physical collection items alike. Poster card: full-bleed photo, bottom
 * vignette, era + kit type in gold over the team name; kits show ownership
 * state, items show condition/back print, a gold seal for match-worn/-issued
 * and a "sold" overlay.
 */
export const KitTile: React.FC<KitTileProps> = ({
  summary,
  onPress,
  variant = "card",
  width,
  showTeam = true,
  detail,
  trailing,
}) => {
  const { colors, radius, spacing } = useTheme();
  const { t } = useTranslation();

  const itemSummary = isItem(summary) ? summary : null;
  const item = itemSummary?.item ?? null;
  const kitType = isItem(summary) ? summary.kitType : summary.kit.type;
  const typeLabel = t(`enums.kitType.${kitType}`);
  const { teamName, eraLabel, imageUri } = summary;

  const backLine =
    item &&
    itemSummary &&
    (item.backType === "player" && itemSummary.playerName
      ? `${itemSummary.playerName}${item.number != null ? ` #${item.number}` : ""}`
      : item.backType === "custom" && item.customName
        ? `${item.customName}${item.number != null ? ` #${item.number}` : ""}`
        : item.backType === "number_only" && item.number != null
          ? `#${item.number}`
          : null);

  // Muted metadata: condition + back print for items, manufacturer for kits.
  const metaLine = item
    ? [t(`enums.condition.${item.condition}`), backLine]
        .filter(Boolean)
        .join(" • ")
    : ((isItem(summary) ? null : summary.manufacturerName) ?? "");

  const sold = item?.status === "sold";
  const sealed =
    item?.productVersion === "match_worn" ||
    item?.productVersion === "match_issued";
  const ownedCount = isItem(summary) ? 0 : summary.ownedCount;
  const wishlisted = !isItem(summary) && summary.wishlisted;

  const image = (style: object) => (
    <KitImageView
      uri={imageUri}
      primaryColor={summary.teamPrimaryColor}
      secondaryColor={summary.teamSecondaryColor}
      style={style}
    />
  );

  const defaultTrailing = item ? (
    sold ? (
      <Chip label={t("enums.status.sold")} tone="error" />
    ) : (
      <Chip label={t(`enums.condition.${item.condition}`)} tone="outline" />
    )
  ) : ownedCount > 0 ? (
    <Chip
      label={ownedCount > 1 ? `×${ownedCount}` : t("enums.status.owned")}
      icon="checkmark-circle"
      tone="goldSoft"
    />
  ) : wishlisted ? (
    <Ionicons name="star" size={16} color={colors.tertiary} />
  ) : null;

  if (variant === "compact") {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.compactRow,
          {
            backgroundColor: colors.surfaceContainer,
            borderRadius: radius.sm + 4,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <AppText variant="titleSm" numberOfLines={1} style={styles.text}>
          {showTeam ? teamName : typeLabel}
        </AppText>
        <AppText
          variant="labelSm"
          color={colors.onSurfaceVariant}
          numberOfLines={1}
          style={styles.compactDetail}
        >
          {detail ??
            [showTeam ? typeLabel : null, eraLabel, backLine || metaLine]
              .filter(Boolean)
              .join(" · ")}
        </AppText>
        {trailing !== undefined ? (
          trailing
        ) : sold ? (
          <AppText variant="labelSm" color={colors.error}>
            {t("enums.status.sold")}
          </AppText>
        ) : ownedCount > 0 ? (
          <View style={styles.compactTrailing}>
            {ownedCount > 1 ? (
              <AppText variant="labelSm" color={colors.tertiary}>
                ×{ownedCount}
              </AppText>
            ) : null}
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={colors.tertiary}
            />
          </View>
        ) : wishlisted ? (
          <Ionicons name="star" size={12} color={colors.tertiary} />
        ) : null}
      </Pressable>
    );
  }

  if (variant === "row") {
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
          {image(styles.thumbImage)}
        </View>
        <View style={styles.text}>
          <AppText variant="titleSm" numberOfLines={1}>
            {showTeam ? `${teamName} · ${typeLabel}` : typeLabel}
          </AppText>
          <AppText
            variant="labelSm"
            color={colors.onSurfaceVariant}
            numberOfLines={1}
          >
            {[eraLabel, item ? backLine : metaLine].filter(Boolean).join(" · ")}
          </AppText>
          {detail ? (
            <AppText
              variant="labelSm"
              color={colors.tertiary}
              numberOfLines={1}
            >
              {detail}
            </AppText>
          ) : null}
        </View>
        {trailing !== undefined ? trailing : defaultTrailing}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        width != null ? { width } : styles.gridCell,
        {
          backgroundColor: colors.surfaceContainer,
          borderRadius: radius.lg,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      {image(StyleSheet.absoluteFill)}
      <LinearGradient
        pointerEvents="none"
        colors={["transparent", "rgba(11,15,16,0.55)", "rgba(11,15,16,0.92)"]}
        locations={[0.4, 0.68, 1]}
        style={StyleSheet.absoluteFill}
      />
      {sealed || ownedCount > 0 || wishlisted ? (
        <View style={[styles.topRight, { top: spacing.sm, right: spacing.sm }]}>
          {sealed ? (
            <View style={styles.sealCircle}>
              <Ionicons name="ribbon" size={16} color={colors.tertiary} />
            </View>
          ) : ownedCount > 0 ? (
            <Chip
              label={
                ownedCount > 1
                  ? `${t("enums.status.owned")} ×${ownedCount}`
                  : t("enums.status.owned")
              }
              icon="checkmark-circle"
              tone="goldSoft"
            />
          ) : (
            <View style={styles.sealCircle}>
              <Ionicons name="star" size={16} color={colors.tertiary} />
            </View>
          )}
        </View>
      ) : null}
      <View style={[styles.shelf, { padding: spacing.sm + 2 }]}>
        <AppText variant="label" color={colors.tertiary} numberOfLines={1}>
          {eraLabel} {typeLabel}
        </AppText>
        <AppText variant="title" numberOfLines={1}>
          {teamName}
        </AppText>
        {metaLine ? (
          <AppText
            variant="labelSm"
            color={colors.onSurfaceVariant}
            numberOfLines={1}
          >
            {metaLine}
          </AppText>
        ) : null}
        {detail ? (
          <AppText variant="labelSm" color={colors.tertiary} numberOfLines={1}>
            {detail}
          </AppText>
        ) : null}
      </View>
      {sold ? (
        <View style={[StyleSheet.absoluteFill, styles.soldOverlay]}>
          <Chip label={t("enums.status.sold")} tone="error" />
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { aspectRatio: 0.72, overflow: "hidden" },
  gridCell: { flex: 1 },
  topRight: { position: "absolute" },
  sealCircle: {
    backgroundColor: "rgba(11,15,16,0.7)",
    borderRadius: 999,
    padding: 6,
  },
  shelf: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    gap: 2,
  },
  soldOverlay: {
    backgroundColor: "rgba(11,15,16,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  compactDetail: { flexShrink: 1 },
  compactTrailing: { flexDirection: "row", alignItems: "center", gap: 3 },
  thumb: { width: 44, height: 56, overflow: "hidden" },
  thumbImage: { width: "100%", height: "100%" },
  text: { flex: 1, gap: 2 },
});

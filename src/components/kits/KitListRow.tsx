import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { Chip } from "@/components/shared/Chip";
import { KitImageView } from "./KitImageView";
import type { KitSummary } from "@/features/catalogue/types";

interface KitListRowProps {
  summary: KitSummary;
  onPress: () => void;
  /** Hide the team name when the surrounding list is already per-team. */
  showTeam?: boolean;
  /** Extra context line inside the row (e.g. wishlist desired config). */
  detail?: string | null;
  /** Replaces the default ownership/wishlist trailing (e.g. bulk-add queue). */
  trailing?: React.ReactNode;
}

/** Compact list alternative to KitCard: thumbnail, names, ownership state. */
export const KitListRow: React.FC<KitListRowProps> = ({
  summary,
  onPress,
  showTeam = true,
  detail,
  trailing,
}) => {
  const { colors, radius } = useTheme();
  const { t } = useTranslation();
  const { kit, teamName, eraLabel, manufacturerName, imageUri, ownedCount } =
    summary;

  const typeLabel = t(`enums.kitType.${kit.type}`);
  const title = showTeam ? `${teamName} · ${typeLabel}` : typeLabel;
  const subtitle = manufacturerName
    ? `${eraLabel} · ${manufacturerName}`
    : eraLabel;

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
        <KitImageView
          uri={imageUri}
          primaryColor={summary.teamPrimaryColor}
          secondaryColor={summary.teamSecondaryColor}
          style={styles.image}
        />
      </View>
      <View style={styles.text}>
        <AppText variant="titleSm" numberOfLines={1}>
          {title}
        </AppText>
        <AppText
          variant="labelSm"
          color={colors.onSurfaceVariant}
          numberOfLines={1}
        >
          {subtitle}
        </AppText>
        {detail ? (
          <AppText variant="labelSm" color={colors.tertiary} numberOfLines={1}>
            {detail}
          </AppText>
        ) : null}
      </View>
      {trailing !== undefined ? (
        trailing
      ) : ownedCount > 0 ? (
        <Chip
          label={ownedCount > 1 ? `×${ownedCount}` : t("enums.status.owned")}
          icon="checkmark-circle"
          tone="goldSoft"
        />
      ) : summary.wishlisted ? (
        <Ionicons name="star" size={16} color={colors.tertiary} />
      ) : null}
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

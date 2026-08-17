import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { KitPlaceholder } from "./KitPlaceholder";
import type { KitSummary } from "@/features/catalogue/types";

interface KitCardProps {
  summary: KitSummary;
  onPress: () => void;
}

/**
 * The centerpiece catalogue card: tall image container with a metadata shelf,
 * plus the user's ownership state (owned / wishlist / missing).
 */
export const KitCard: React.FC<KitCardProps> = ({ summary, onPress }) => {
  const { colors, radius, spacing } = useTheme();
  const { t } = useTranslation();
  const { kit, teamName, eraLabel, imageUri, ownedCount, wishlisted } = summary;

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
        {ownedCount > 0 ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.tertiary, borderRadius: radius.full },
            ]}
          >
            <AppText variant="labelSm" color={colors.onTertiary}>
              {ownedCount > 1 ? `×${ownedCount}` : "✓"}
            </AppText>
          </View>
        ) : wishlisted ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.surfaceContainerHighest,
                borderRadius: radius.full,
              },
            ]}
          >
            <Ionicons name="star" size={12} color={colors.tertiary} />
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
          {eraLabel} · {t(`enums.kitType.${kit.type}`)}
        </AppText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { flex: 1, overflow: "hidden" },
  imageArea: { aspectRatio: 3 / 4, overflow: "hidden" },
  image: { width: "100%", height: "100%" },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
  },
  shelf: { gap: 2 },
});

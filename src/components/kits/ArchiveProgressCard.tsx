import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { ProgressBar } from "@/components/shared/ProgressBar";

interface ArchiveProgressCardProps {
  title: string;
  subtitle: string;
  owned: number;
  total: number;
  onPress: () => void;
}

/** Collection-completion card ("23 / 45 kits collected · 51%") for a team. */
export const ArchiveProgressCard: React.FC<ArchiveProgressCardProps> = ({
  title,
  subtitle,
  owned,
  total,
  onPress,
}) => {
  const { colors, radius, spacing } = useTheme();
  const { t } = useTranslation();
  const percent = total > 0 ? Math.round((owned / total) * 100) : 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surfaceContainer,
          borderRadius: radius.lg,
          padding: spacing.md,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <AppText variant="title">{title}</AppText>
      <AppText variant="bodySm" color={colors.onSurfaceVariant}>
        {subtitle}
      </AppText>
      <View style={styles.countRow}>
        <AppText variant="titleSm">
          {t("home.kitsCollected", { owned, total })}
        </AppText>
        <AppText variant="titleSm" color={colors.tertiary}>
          {percent}%
        </AppText>
      </View>
      <ProgressBar value={owned} total={total} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { gap: 6 },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
});

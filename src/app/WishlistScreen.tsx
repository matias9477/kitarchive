import React, { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { EmptyState } from "@/components/shared/EmptyState";
import { KitCard } from "@/components/kits/KitCard";
import { useWishlistStore } from "@/features/wishlist/wishlistStore";
import type { WishlistEntry } from "@/features/wishlist/types";

/** Desired catalogue kits, with optional desired configuration (§33.6). */
export const WishlistScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const entries = useWishlistStore((s) => s.entries);
  const load = useWishlistStore((s) => s.load);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const desiredLine = ({ entry, playerName }: WishlistEntry): string | null => {
    const parts: string[] = [];
    if (entry.productVersion)
      parts.push(t(`enums.productVersion.${entry.productVersion}`));
    if (entry.edition) parts.push(t(`enums.edition.${entry.edition}`));
    if (playerName)
      parts.push(
        entry.number != null ? `${playerName} #${entry.number}` : playerName,
      );
    else if (entry.customName)
      parts.push(
        entry.number != null
          ? `${entry.customName} #${entry.number}`
          : entry.customName,
      );
    else if (entry.number != null) parts.push(`#${entry.number}`);
    return parts.length > 0 ? parts.join(" · ") : null;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
        <AppText variant="headline">{t("wishlist.title")}</AppText>
      </View>
      <FlatList
        data={entries}
        keyExtractor={(e) => e.entry.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.gutter }}
        contentContainerStyle={{
          paddingHorizontal: spacing.screen,
          paddingBottom: spacing.xl,
          gap: spacing.gutter,
        }}
        ListEmptyComponent={
          <EmptyState
            icon="star-outline"
            title={t("wishlist.emptyTitle")}
            message={t("wishlist.emptyMessage")}
          />
        }
        renderItem={({ item: entry }) => {
          const desired = desiredLine(entry);
          return (
            <View style={styles.cell}>
              <KitCard
                summary={entry.kit}
                onPress={() =>
                  navigation.navigate("KitDetail", { kitId: entry.entry.kitId })
                }
              />
              {desired ? (
                <AppText
                  variant="labelSm"
                  color={colors.tertiary}
                  numberOfLines={1}
                >
                  {desired}
                </AppText>
              ) : null}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: 12 },
  cell: { flex: 1, gap: 4 },
});

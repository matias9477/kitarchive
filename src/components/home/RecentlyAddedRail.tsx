import React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { KitTile } from "@/components/kits/KitTile";
import type { CollectionItemSummary } from "@/features/collection/types";

interface RecentlyAddedRailProps {
  items: CollectionItemSummary[];
}

/** Horizontal rail of the latest additions, with a "view all" jump. */
export const RecentlyAddedRail: React.FC<RecentlyAddedRailProps> = ({
  items,
}) => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  if (items.length === 0) return null;

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={styles.sectionHeader}>
        <AppText variant="headline">{t("home.recentlyAdded")}</AppText>
        <Pressable
          onPress={() =>
            navigation.navigate("MainTabs", { screen: "Collection" })
          }
          hitSlop={8}
        >
          <AppText variant="titleSm" color={colors.secondary}>
            {t("home.viewAll")}
          </AppText>
        </Pressable>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={items}
        keyExtractor={(s) => s.item.id}
        style={{ marginHorizontal: -spacing.screen }}
        contentContainerStyle={{
          paddingHorizontal: spacing.screen,
          gap: spacing.gutter,
        }}
        renderItem={({ item: summary }) => (
          <KitTile
            summary={summary}
            width={180}
            onPress={() =>
              navigation.navigate("ItemDetail", { itemId: summary.item.id })
            }
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

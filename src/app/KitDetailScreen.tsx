import React, { useCallback } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { persistPickedImage } from "@/lib/images";
import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button";
import { Chip } from "@/components/shared/Chip";
import { Section } from "@/components/shared/Section";
import { KitPlaceholder } from "@/components/kits/KitPlaceholder";
import { useCatalogueStore } from "@/features/catalogue/catalogueStore";
import { useWishlistStore } from "@/features/wishlist/wishlistStore";
import { getItemsByKit } from "@/features/collection/collectionService";
import type { CollectionItemSummary } from "@/features/collection/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "KitDetail">;

/**
 * Catalogue kit page — the "do I own this?" screen: reference imagery, spec
 * chips, owned count, individual items, wishlist toggle (spec §33.3).
 */
export const KitDetailScreen: React.FC<Props> = ({ route }) => {
  const { kitId } = route.params;
  const { colors, spacing, radius } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const detail = useCatalogueStore((s) => s.kitDetail);
  const loadKitDetail = useCatalogueStore((s) => s.loadKitDetail);
  const addKitImage = useCatalogueStore((s) => s.addKitImage);
  const removeKitImage = useCatalogueStore((s) => s.removeKitImage);
  const wishlistLoad = useWishlistStore((s) => s.load);
  const wishlistAdd = useWishlistStore((s) => s.add);
  const wishlistRemove = useWishlistStore((s) => s.removeByKit);
  const [items, setItems] = React.useState<CollectionItemSummary[]>([]);

  const refresh = useCallback(() => {
    void loadKitDetail(kitId);
    void wishlistLoad();
    void getItemsByKit(kitId).then(setItems);
  }, [kitId, loadKitDetail, wishlistLoad]);

  useFocusEffect(refresh);

  React.useLayoutEffect(() => {
    if (detail && detail.kit.id === kitId) {
      navigation.setOptions({ title: `${detail.teamName} ${detail.eraLabel}` });
    }
  }, [navigation, detail, kitId]);

  if (!detail || detail.kit.id !== kitId) {
    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
      />
    );
  }

  const pickReferenceImage = async (fromCamera: boolean) => {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.85 });
    const asset = result.assets?.[0];
    if (!asset) return;
    const uri = await persistPickedImage(asset.uri);
    await addKitImage(kitId, uri);
  };

  const chooseImageSource = () =>
    Alert.alert(t("kitDetail.addImage"), undefined, [
      {
        text: t("kitDetail.imageFromCamera"),
        onPress: () => void pickReferenceImage(true),
      },
      {
        text: t("kitDetail.imageFromLibrary"),
        onPress: () => void pickReferenceImage(false),
      },
      {
        text: t("kitDetail.imageFromWeb"),
        onPress: () =>
          navigation.navigate("WebImagePicker", {
            kitId,
            query: `${detail.teamName} ${detail.eraLabel} ${t(
              `enums.kitType.${detail.kit.type}`,
            )} ${t("kitDetail.imageSearchSuffix")}`,
          }),
      },
      { text: t("common.cancel"), style: "cancel" },
    ]);

  const toggleWishlist = async () => {
    if (detail.wishlisted) await wishlistRemove(kitId);
    else await wishlistAdd(kitId);
    refresh();
  };

  const ownedItems = items.filter((s) => s.item.status === "owned");

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        padding: spacing.screen,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
      }}
    >
      {/* Hero: reference images or placeholder */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -spacing.screen }}
        contentContainerStyle={{
          paddingHorizontal: spacing.screen,
          gap: spacing.sm,
        }}
      >
        {detail.images.length > 0 ? (
          detail.images.map((image) => (
            <Pressable
              key={image.id}
              onLongPress={() =>
                Alert.alert(t("kitDetail.removeImage"), undefined, [
                  { text: t("common.cancel"), style: "cancel" },
                  {
                    text: t("common.remove"),
                    style: "destructive",
                    onPress: () => void removeKitImage(image.id, kitId),
                  },
                ])
              }
            >
              <Image
                source={{ uri: image.uri }}
                style={[styles.hero, { borderRadius: radius.xl }]}
                resizeMode="cover"
              />
            </Pressable>
          ))
        ) : (
          <View
            style={[
              styles.hero,
              { borderRadius: radius.xl, overflow: "hidden" },
            ]}
          >
            <KitPlaceholder
              primaryColor={detail.teamPrimaryColor}
              secondaryColor={detail.teamSecondaryColor}
            />
          </View>
        )}
        <Pressable
          onPress={chooseImageSource}
          style={[
            styles.addImage,
            { borderColor: colors.outlineVariant, borderRadius: radius.xl },
          ]}
        >
          <Ionicons
            name="image-outline"
            size={22}
            color={colors.onSurfaceVariant}
          />
          <AppText
            variant="labelSm"
            color={colors.onSurfaceVariant}
            align="center"
          >
            {t("kitDetail.addImage")}
          </AppText>
        </Pressable>
      </ScrollView>

      {/* Title + spec chips */}
      <View style={{ gap: spacing.sm }}>
        <AppText variant="headline">
          {detail.teamName} · {t(`enums.kitType.${detail.kit.type}`)}
        </AppText>
        <View style={styles.chips}>
          {ownedItems.length > 0 ? (
            <Chip
              label={t("enums.status.owned")}
              icon="checkmark-circle"
              tone="goldSoft"
            />
          ) : null}
          <Chip label={detail.eraLabel} tone="neutral" />
          {detail.manufacturerName ? (
            <Chip label={detail.manufacturerName} tone="outline" />
          ) : null}
          {detail.competitions.map((c) => (
            <Chip key={c.id} label={c.name} tone="outline" />
          ))}
        </View>
        {detail.kit.description ? (
          <AppText variant="bodySm" color={colors.onSurfaceVariant}>
            {detail.kit.description}
          </AppText>
        ) : null}
      </View>

      {/* Ownership */}
      <Section
        title={
          ownedItems.length > 0
            ? t("kitDetail.youOwn", { count: ownedItems.length })
            : t("kitDetail.notOwned")
        }
        icon="shirt-outline"
      >
        <View style={{ gap: spacing.xs }}>
          {ownedItems.map((summary) => {
            const { item } = summary;
            const backLine =
              summary.playerName && item.number != null
                ? `${summary.playerName} #${item.number}`
                : item.customName && item.number != null
                  ? `${item.customName} #${item.number}`
                  : item.number != null
                    ? `#${item.number}`
                    : t("enums.backType.blank");
            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  navigation.navigate("ItemDetail", { itemId: item.id })
                }
                style={[
                  styles.itemRow,
                  {
                    backgroundColor: colors.surfaceContainer,
                    borderRadius: radius.md,
                  },
                ]}
              >
                <View style={styles.itemRowText}>
                  <AppText variant="titleSm">{backLine}</AppText>
                  <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                    {t(`enums.condition.${item.condition}`)}
                    {item.productVersion
                      ? ` · ${t(`enums.productVersion.${item.productVersion}`)}`
                      : ""}
                    {item.edition
                      ? ` · ${t(`enums.edition.${item.edition}`)}`
                      : ""}
                  </AppText>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.outline}
                />
              </Pressable>
            );
          })}
        </View>
      </Section>

      {/* Actions */}
      <View style={{ gap: spacing.sm }}>
        <Button
          label={
            ownedItems.length > 0
              ? t("kitDetail.addAnother")
              : t("kitDetail.addToCollection")
          }
          icon="add-circle-outline"
          onPress={() => navigation.navigate("ItemForm", { kitId })}
        />
        <Button
          label={
            detail.wishlisted
              ? t("kitDetail.removeWishlist")
              : t("kitDetail.addWishlist")
          }
          icon={detail.wishlisted ? "heart-dislike-outline" : "heart-outline"}
          variant="ghost"
          onPress={() => void toggleWishlist()}
        />
        {detail.wishlisted ? (
          <Button
            label={t("kitDetail.editWishlistConfig")}
            icon="options-outline"
            variant="ghost"
            onPress={() => navigation.navigate("WishlistConfig", { kitId })}
          />
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { width: 260, aspectRatio: 3 / 4 },
  addImage: {
    width: 120,
    aspectRatio: 3 / 4,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 8,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  itemRowText: { flex: 1, gap: 2 },
});

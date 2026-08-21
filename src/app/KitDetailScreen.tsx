import React, { useCallback } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { persistPickedImage } from "@/lib/images";
import { kitImageQuery } from "@/lib/webImagePicker";
import { AppText } from "@/components/shared/AppText";
import { Skeleton } from "@/components/shared/Skeleton";
import { Button } from "@/components/shared/Button";
import { Chip } from "@/components/shared/Chip";
import { Section } from "@/components/shared/Section";
import {
  HeroGallery,
  type HeroGalleryHandle,
} from "@/components/kits/HeroGallery";
import { PhotoViewer } from "@/components/kits/PhotoViewer";
import { useCatalogueStore } from "@/features/catalogue/catalogueStore";
import { useWishlistStore } from "@/features/wishlist/wishlistStore";
import { getItemsByKit } from "@/features/collection/collectionService";
import type { KitImage as KitImageRow } from "@/features/catalogue/types";
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
  const setDefaultKitImage = useCatalogueStore((s) => s.setDefaultKitImage);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const heroWidth = windowWidth - spacing.screen * 2;
  // Cap the hero so title/specs peek above the fold; the sticky action bar
  // below keeps add/wishlist reachable without scrolling.
  const heroHeight = Math.min((heroWidth * 4) / 3, windowHeight * 0.45);
  const heroRef = React.useRef<HeroGalleryHandle>(null);
  const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);
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
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            padding: spacing.screen,
            gap: spacing.lg,
          },
        ]}
      >
        <Skeleton height={heroHeight} borderRadius={radius.lg} />
        <View style={{ gap: spacing.sm }}>
          <Skeleton width="65%" height={20} />
          <Skeleton width="40%" height={14} />
        </View>
      </View>
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

  const imageQuery = kitImageQuery({
    teamName: detail.teamName,
    eraLabel: detail.eraLabel,
    kitTypeLabel: t(`enums.kitType.${detail.kit.type}`),
    manufacturerName: detail.manufacturerName,
    suffix: t("kitDetail.imageSearchSuffix"),
  });

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
          navigation.navigate("WebImagePicker", { kitId, query: imageQuery }),
      },
      {
        text: t("webImagePicker.autoSearch"),
        onPress: () =>
          navigation.navigate("WebImagePicker", {
            kitId,
            query: imageQuery,
            autoSelect: true,
          }),
      },
      { text: t("common.cancel"), style: "cancel" },
    ]);

  const imageOptions = (image: KitImageRow, index: number) =>
    Alert.alert(t("kitDetail.imageOptions"), undefined, [
      ...(index > 0
        ? [
            {
              text: t("kitDetail.setDefaultImage"),
              onPress: () => {
                void setDefaultKitImage(image.id, kitId).then(() => {
                  heroRef.current?.resetToFirst();
                });
              },
            },
          ]
        : []),
      {
        text: t("common.remove"),
        style: "destructive" as const,
        onPress: () => void removeKitImage(image.id, kitId),
      },
      { text: t("common.cancel"), style: "cancel" as const },
    ]);

  const toggleWishlist = async () => {
    if (detail.wishlisted) await wishlistRemove(kitId);
    else await wishlistAdd(kitId);
    refresh();
  };

  const ownedItems = items.filter((s) => s.item.status === "owned");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.screen,
          paddingBottom: spacing.xl,
          gap: spacing.lg,
        }}
      >
        {/* Hero: paged reference images with the kit metadata overlaid
          (tap an image to view it fullscreen) */}
        <View style={{ gap: spacing.sm }}>
          <HeroGallery
            ref={heroRef}
            images={detail.images}
            primaryColor={detail.teamPrimaryColor}
            secondaryColor={detail.teamSecondaryColor}
            width={heroWidth}
            height={heroHeight}
            overlayLabels={[
              detail.eraLabel,
              t(`enums.kitType.${detail.kit.type}`).toUpperCase(),
              ...(detail.manufacturerName ? [detail.manufacturerName] : []),
            ]}
            overlayTitle={detail.teamName}
            defaultBadgeLabel={t("kitDetail.defaultImage")}
            badge={
              ownedItems.length > 0 ? (
                <Chip
                  label={t("enums.status.owned")}
                  icon="checkmark-circle"
                  tone="goldSoft"
                />
              ) : null
            }
            onImagePress={(index) => setViewerIndex(index)}
            onTitlePress={() =>
              navigation.navigate("TeamDetail", { teamId: detail.kit.teamId })
            }
          />
          <PhotoViewer
            images={detail.images}
            index={viewerIndex}
            onClose={() => setViewerIndex(null)}
            onOptions={(index) => {
              setViewerIndex(null);
              const image = detail.images[index];
              if (image) imageOptions(image, index);
            }}
            optionsLabel={t("kitDetail.imageOptions")}
          />
          <Button
            label={t("kitDetail.addImage")}
            icon="images-outline"
            variant="ghost"
            onPress={chooseImageSource}
          />
        </View>

        {/* Competitions + story — identity lives on the image shelf now */}
        {detail.competitions.length > 0 || detail.kit.description ? (
          <View style={{ gap: spacing.sm }}>
            {detail.competitions.length > 0 ? (
              <View style={styles.chips}>
                {detail.competitions.map((c) => (
                  <Chip key={c.id} label={c.name} tone="outline" />
                ))}
              </View>
            ) : null}
            {detail.kit.description ? (
              <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                {detail.kit.description}
              </AppText>
            ) : null}
          </View>
        ) : null}

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
      </ScrollView>

      {/* Sticky decision bar — add/wishlist stay reachable without
          scrolling past the hero (the whole point of this screen). */}
      <View
        style={[
          styles.actionBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.outlineVariant,
            paddingHorizontal: spacing.screen,
            paddingTop: spacing.sm,
            paddingBottom: Math.max(insets.bottom, spacing.sm),
          },
        ]}
      >
        <View style={styles.actionPrimary}>
          <Button
            label={
              ownedItems.length > 0
                ? t("kitDetail.addAnother")
                : t("kitDetail.addToCollection")
            }
            icon="add-circle-outline"
            onPress={() => navigation.navigate("ItemForm", { kitId })}
          />
        </View>
        <Pressable
          onPress={() => void toggleWishlist()}
          accessibilityRole="button"
          accessibilityLabel={
            detail.wishlisted
              ? t("kitDetail.removeWishlist")
              : t("kitDetail.addWishlist")
          }
          style={[
            styles.iconButton,
            { borderColor: colors.outlineVariant, borderRadius: radius.md },
          ]}
        >
          <Ionicons
            name={detail.wishlisted ? "heart" : "heart-outline"}
            size={22}
            color={detail.wishlisted ? colors.tertiary : colors.onSurface}
          />
        </Pressable>
        {detail.wishlisted ? (
          <Pressable
            onPress={() => navigation.navigate("WishlistConfig", { kitId })}
            accessibilityRole="button"
            accessibilityLabel={t("kitDetail.editWishlistConfig")}
            style={[
              styles.iconButton,
              { borderColor: colors.outlineVariant, borderRadius: radius.md },
            ]}
          >
            <Ionicons
              name="options-outline"
              size={22}
              color={colors.onSurface}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  itemRowText: { flex: 1, gap: 2 },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionPrimary: { flex: 1 },
  iconButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

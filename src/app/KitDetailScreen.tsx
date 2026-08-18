import React, { useCallback } from "react";
import {
  Alert,
  Image,
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
import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button";
import { Chip } from "@/components/shared/Chip";
import { Section } from "@/components/shared/Section";
import { ImageOverlayShelf } from "@/components/kits/ImageOverlayShelf";
import { KitPlaceholder } from "@/components/kits/KitPlaceholder";
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
  const heroScrollRef = React.useRef<ScrollView>(null);
  const [heroPage, setHeroPage] = React.useState(0);
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

  const imageOptions = (image: KitImageRow, index: number) =>
    Alert.alert(t("kitDetail.imageOptions"), undefined, [
      ...(index > 0
        ? [
            {
              text: t("kitDetail.setDefaultImage"),
              onPress: () => {
                void setDefaultKitImage(image.id, kitId).then(() => {
                  heroScrollRef.current?.scrollTo({ x: 0, animated: false });
                  setHeroPage(0);
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
          (tap an image for options) */}
        <View style={{ gap: spacing.sm }}>
          <View style={{ borderRadius: radius.xl, overflow: "hidden" }}>
            {detail.images.length > 0 ? (
              <ScrollView
                ref={heroScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) =>
                  setHeroPage(
                    Math.round(event.nativeEvent.contentOffset.x / heroWidth),
                  )
                }
              >
                {detail.images.map((image, index) => (
                  <Pressable
                    key={image.id}
                    onPress={() => imageOptions(image, index)}
                  >
                    <Image
                      source={{ uri: image.uri }}
                      style={{ width: heroWidth, height: heroHeight }}
                      resizeMode="cover"
                    />
                    {index === 0 && detail.images.length > 1 ? (
                      <View style={styles.defaultBadge}>
                        <Chip
                          label={t("kitDetail.defaultImage")}
                          icon="image"
                          tone="goldSoft"
                        />
                      </View>
                    ) : null}
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <View style={{ width: heroWidth, height: heroHeight }}>
                <KitPlaceholder
                  primaryColor={detail.teamPrimaryColor}
                  secondaryColor={detail.teamSecondaryColor}
                />
              </View>
            )}
            <ImageOverlayShelf
              labels={[
                detail.eraLabel,
                t(`enums.kitType.${detail.kit.type}`).toUpperCase(),
                ...(detail.manufacturerName ? [detail.manufacturerName] : []),
              ]}
              title={detail.teamName}
              titleVariant="headline"
            />
            {ownedItems.length > 0 ? (
              <View pointerEvents="none" style={styles.ownedBadge}>
                <Chip
                  label={t("enums.status.owned")}
                  icon="checkmark-circle"
                  tone="goldSoft"
                />
              </View>
            ) : null}
          </View>
          {detail.images.length > 1 ? (
            <View style={styles.dots}>
              {detail.images.map((image, index) => (
                <View
                  key={image.id}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        index === Math.min(heroPage, detail.images.length - 1)
                          ? colors.onSurface
                          : colors.outlineVariant,
                    },
                  ]}
                />
              ))}
            </View>
          ) : null}
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
  defaultBadge: { position: "absolute", top: 10, left: 10 },
  ownedBadge: { position: "absolute", top: 10, right: 10 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
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

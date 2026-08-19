import React, { useCallback } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { persistPickedImage } from "@/lib/images";
import { kitImageQuery } from "@/lib/webImagePicker";
import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button";
import { Chip } from "@/components/shared/Chip";
import { Section } from "@/components/shared/Section";
import { KitImageView } from "@/components/kits/KitImageView";
import { KitPlaceholder } from "@/components/kits/KitPlaceholder";
import { useCollectionStore } from "@/features/collection/collectionStore";
import type { ItemPhoto } from "@/features/collection/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "ItemDetail">;

/** Physical-shirt page: photos, spec list, purchase info, actions (§33.4). */
export const ItemDetailScreen: React.FC<Props> = ({ route }) => {
  const { itemId } = route.params;
  const { colors, spacing, radius } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const detail = useCollectionStore((s) => s.itemDetail);
  const loadItemDetail = useCollectionStore((s) => s.loadItemDetail);
  const addPhoto = useCollectionStore((s) => s.addPhoto);
  const removePhoto = useCollectionStore((s) => s.removePhoto);
  const setDefaultPhoto = useCollectionStore((s) => s.setDefaultPhoto);
  const { width: windowWidth } = useWindowDimensions();
  const heroWidth = windowWidth - spacing.screen * 2;
  const heroScrollRef = React.useRef<ScrollView>(null);
  const [heroPage, setHeroPage] = React.useState(0);
  const markSold = useCollectionStore((s) => s.markSold);
  const markOwned = useCollectionStore((s) => s.markOwned);
  const remove = useCollectionStore((s) => s.remove);

  useFocusEffect(
    useCallback(() => {
      void loadItemDetail(itemId);
    }, [loadItemDetail, itemId]),
  );

  if (!detail || detail.item.id !== itemId) {
    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
      />
    );
  }

  const { item } = detail;

  const pickPhoto = async (fromCamera: boolean) => {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({
          quality: 0.85,
          allowsMultipleSelection: true,
        });
    if (!result.assets) return;
    for (const asset of result.assets) {
      const uri = await persistPickedImage(asset.uri);
      await addPhoto({ itemId, uri });
    }
  };

  const imageQuery = kitImageQuery({
    teamName: detail.teamName,
    eraLabel: detail.eraLabel,
    kitTypeLabel: t(`enums.kitType.${detail.kitType}`),
    manufacturerName: detail.manufacturerName,
    suffix: t("kitDetail.imageSearchSuffix"),
  });

  const choosePhotoSource = () =>
    Alert.alert(t("itemDetail.addPhotos"), undefined, [
      {
        text: t("itemDetail.takePhoto"),
        onPress: () => void pickPhoto(true),
      },
      {
        text: t("itemDetail.choosePhotos"),
        onPress: () => void pickPhoto(false),
      },
      {
        text: t("itemDetail.photoFromWeb"),
        onPress: () =>
          navigation.navigate("WebImagePicker", { itemId, query: imageQuery }),
      },
      {
        text: t("webImagePicker.autoSearch"),
        onPress: () =>
          navigation.navigate("WebImagePicker", {
            itemId,
            query: imageQuery,
            autoSelect: true,
          }),
      },
      { text: t("common.cancel"), style: "cancel" },
    ]);

  const photoOptions = (photo: ItemPhoto, index: number) =>
    Alert.alert(t("itemDetail.photoOptions"), undefined, [
      ...(index > 0
        ? [
            {
              text: t("itemDetail.setDefaultPhoto"),
              onPress: () => {
                void setDefaultPhoto(photo.id, itemId).then(() => {
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
        onPress: () => void removePhoto(photo.id, itemId),
      },
      { text: t("common.cancel"), style: "cancel" as const },
    ]);

  const confirmDelete = () =>
    Alert.alert(t("itemDetail.deleteTitle"), t("itemDetail.deleteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          void remove(itemId).then(() => navigation.goBack());
        },
      },
    ]);

  const confirmSold = () =>
    Alert.alert(t("itemDetail.soldTitle"), t("itemDetail.soldMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("itemDetail.markSold"), onPress: () => void markSold(itemId) },
    ]);

  const backLine =
    item.backType === "player" && detail.player
      ? `${detail.player.name}${item.number != null ? ` #${item.number}` : ""}`
      : item.backType === "custom" && item.customName
        ? `${item.customName}${item.number != null ? ` #${item.number}` : ""}`
        : item.backType === "number_only" && item.number != null
          ? `#${item.number}`
          : t("enums.backType.blank");

  const specRows: [string, string | null][] = [
    [t("itemForm.condition"), t(`enums.condition.${item.condition}`)],
    [
      t("itemForm.productVersion"),
      item.productVersion
        ? t(`enums.productVersion.${item.productVersion}`)
        : null,
    ],
    [
      t("itemForm.edition"),
      item.edition ? t(`enums.edition.${item.edition}`) : null,
    ],
    [
      t("itemForm.sleeve"),
      item.sleeve ? t(`enums.sleeve.${item.sleeve}`) : null,
    ],
    [t("itemForm.back"), backLine],
    [t("itemDetail.manufacturer"), detail.manufacturerName],
  ];

  const purchaseRows: [string, string | null][] = [
    [
      t("itemForm.purchaseDate"),
      item.purchaseDate ? format(item.purchaseDate, "d MMM yyyy") : null,
    ],
    [t("itemForm.seller"), item.seller],
    [
      t("itemForm.price"),
      item.purchasePrice != null
        ? `${item.purchasePrice} ${item.currency ?? ""}`.trim()
        : null,
    ],
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        padding: spacing.screen,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
      }}
    >
      {/* Photos: full-width paged carousel (tap a photo for options) */}
      <View style={{ gap: spacing.sm }}>
        {detail.photos.length > 0 ? (
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
            {detail.photos.map((photo, index) => (
              <Pressable
                key={photo.id}
                onPress={() => photoOptions(photo, index)}
              >
                <KitImageView
                  uri={photo.uri}
                  primaryColor={detail.teamPrimaryColor}
                  secondaryColor={detail.teamSecondaryColor}
                  style={[
                    styles.photo,
                    { width: heroWidth, borderRadius: radius.xl },
                  ]}
                />
                {index === 0 && detail.photos.length > 1 ? (
                  <View style={styles.defaultBadge}>
                    <Chip
                      label={t("itemDetail.defaultPhoto")}
                      icon="image"
                      tone="goldSoft"
                    />
                  </View>
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
        ) : detail.imageUri ? (
          // No photos of its own — show the kit's reference image, like the
          // collection/home cards do.
          <KitImageView
            uri={detail.imageUri}
            primaryColor={detail.teamPrimaryColor}
            secondaryColor={detail.teamSecondaryColor}
            style={[
              styles.photo,
              { width: heroWidth, borderRadius: radius.xl },
            ]}
          />
        ) : (
          <View
            style={[
              styles.photo,
              {
                width: heroWidth,
                borderRadius: radius.xl,
                overflow: "hidden",
              },
            ]}
          >
            <KitPlaceholder
              primaryColor={detail.teamPrimaryColor}
              secondaryColor={detail.teamSecondaryColor}
            />
          </View>
        )}
        {detail.photos.length > 1 ? (
          <View style={styles.dots}>
            {detail.photos.map((photo, index) => (
              <View
                key={photo.id}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === Math.min(heroPage, detail.photos.length - 1)
                        ? colors.onSurface
                        : colors.outlineVariant,
                  },
                ]}
              />
            ))}
          </View>
        ) : null}
        <Button
          label={t("itemDetail.addPhotos")}
          icon="camera-outline"
          variant="ghost"
          onPress={choosePhotoSource}
        />
      </View>

      {/* Kit reference */}
      <Pressable
        onPress={() => navigation.navigate("KitDetail", { kitId: item.kitId })}
      >
        <View style={styles.kitRef}>
          <View style={styles.kitRefText}>
            <AppText variant="title">{detail.teamName}</AppText>
            <AppText variant="labelSm" color={colors.onSurfaceVariant}>
              {detail.eraLabel} · {t(`enums.kitType.${detail.kitType}`)}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.outline} />
        </View>
      </Pressable>

      {item.status === "sold" ? (
        <Chip label={t("enums.status.sold")} tone="error" />
      ) : null}

      {/* Spec list */}
      <Section title={t("itemDetail.specs")} icon="shirt-outline">
        <View style={{ gap: spacing.xs }}>
          {specRows
            .filter(([, value]) => value != null)
            .map(([label, value]) => (
              <View key={label} style={styles.specRow}>
                <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                  {label}
                </AppText>
                <AppText variant="bodySm">{value}</AppText>
              </View>
            ))}
          {detail.addons.length > 0 ? (
            <View style={[styles.specRow, styles.addonRow]}>
              <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                {t("itemForm.addons")}
              </AppText>
              <View style={styles.chips}>
                {detail.addons.map((addon) => (
                  <Chip key={addon.id} label={addon.name} tone="gold" />
                ))}
              </View>
            </View>
          ) : null}
          {item.conditionNote ? (
            <AppText variant="bodySm" color={colors.onSurfaceVariant}>
              {item.conditionNote}
            </AppText>
          ) : null}
        </View>
      </Section>

      {/* Purchase */}
      {purchaseRows.some(([, value]) => value != null) ? (
        <Section title={t("itemDetail.purchase")} icon="receipt-outline">
          <View style={{ gap: spacing.xs }}>
            {purchaseRows
              .filter(([, value]) => value != null)
              .map(([label, value]) => (
                <View key={label} style={styles.specRow}>
                  <AppText variant="labelSm" color={colors.onSurfaceVariant}>
                    {label}
                  </AppText>
                  <AppText variant="bodySm">{value}</AppText>
                </View>
              ))}
          </View>
        </Section>
      ) : null}

      {/* Actions */}
      <View style={{ gap: spacing.sm }}>
        <Button
          label={t("common.edit")}
          icon="pencil-outline"
          onPress={() => navigation.navigate("ItemForm", { itemId })}
        />
        {item.status === "owned" ? (
          <Button
            label={t("itemDetail.markSold")}
            icon="pricetag-outline"
            variant="ghost"
            onPress={confirmSold}
          />
        ) : (
          <Button
            label={t("itemDetail.markOwned")}
            icon="arrow-undo-outline"
            variant="ghost"
            onPress={() => void markOwned(itemId)}
          />
        )}
        <Button
          label={t("common.delete")}
          icon="trash-outline"
          variant="danger"
          onPress={confirmDelete}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  photo: { aspectRatio: 3 / 4 },
  defaultBadge: { position: "absolute", top: 10, left: 10 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  kitRef: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  kitRefText: { gap: 2 },
  specRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  addonRow: { alignItems: "flex-start" },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    flexShrink: 1,
    justifyContent: "flex-end",
  },
});

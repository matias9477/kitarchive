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
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { persistPickedImage } from "@/lib/images";
import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button";
import { Chip } from "@/components/shared/Chip";
import { Section } from "@/components/shared/Section";
import { KitPlaceholder } from "@/components/kits/KitPlaceholder";
import { useCollectionStore } from "@/features/collection/collectionStore";
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
      {/* Photos */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -spacing.screen }}
        contentContainerStyle={{
          paddingHorizontal: spacing.screen,
          gap: spacing.sm,
        }}
      >
        {detail.photos.length > 0 ? (
          detail.photos.map((photo) => (
            <Pressable
              key={photo.id}
              onLongPress={() =>
                Alert.alert(t("itemDetail.removePhoto"), undefined, [
                  { text: t("common.cancel"), style: "cancel" },
                  {
                    text: t("common.remove"),
                    style: "destructive",
                    onPress: () => void removePhoto(photo.id, itemId),
                  },
                ])
              }
            >
              <Image
                source={{ uri: photo.uri }}
                style={[styles.photo, { borderRadius: radius.xl }]}
                resizeMode="cover"
              />
            </Pressable>
          ))
        ) : (
          <View
            style={[
              styles.photo,
              { borderRadius: radius.xl, overflow: "hidden" },
            ]}
          >
            <KitPlaceholder
              primaryColor={detail.teamPrimaryColor}
              secondaryColor={detail.teamSecondaryColor}
            />
          </View>
        )}
        <View style={{ gap: spacing.sm }}>
          <Pressable
            onPress={() => void pickPhoto(true)}
            style={[
              styles.addPhoto,
              { borderColor: colors.outlineVariant, borderRadius: radius.lg },
            ]}
          >
            <Ionicons
              name="camera-outline"
              size={20}
              color={colors.onSurfaceVariant}
            />
            <AppText variant="labelSm" color={colors.onSurfaceVariant}>
              {t("itemDetail.takePhoto")}
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => void pickPhoto(false)}
            style={[
              styles.addPhoto,
              { borderColor: colors.outlineVariant, borderRadius: radius.lg },
            ]}
          >
            <Ionicons
              name="images-outline"
              size={20}
              color={colors.onSurfaceVariant}
            />
            <AppText variant="labelSm" color={colors.onSurfaceVariant}>
              {t("itemDetail.choosePhotos")}
            </AppText>
          </Pressable>
        </View>
      </ScrollView>

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
      <Section title={t("itemDetail.specs")}>
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
        <Section title={t("itemDetail.purchase")}>
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
          onPress={() => navigation.navigate("ItemForm", { itemId })}
        />
        {item.status === "owned" ? (
          <Button
            label={t("itemDetail.markSold")}
            variant="ghost"
            onPress={confirmSold}
          />
        ) : (
          <Button
            label={t("itemDetail.markOwned")}
            variant="ghost"
            onPress={() => void markOwned(itemId)}
          />
        )}
        <Button
          label={t("common.delete")}
          variant="danger"
          onPress={confirmDelete}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  photo: { width: 260, aspectRatio: 3 / 4 },
  addPhoto: {
    flex: 1,
    width: 130,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 8,
  },
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

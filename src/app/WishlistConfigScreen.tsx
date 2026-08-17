import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { EDITIONS, PRODUCT_VERSIONS, SLEEVE_TYPES } from "@/config/constants";
import type { Edition, ProductVersion, SleeveType } from "@/config/types";
import { Button } from "@/components/shared/Button";
import { TextField } from "@/components/shared/TextField";
import { PickerField } from "@/components/shared/PickerField";
import { useCatalogueStore } from "@/features/catalogue/catalogueStore";
import { useWishlistStore } from "@/features/wishlist/wishlistStore";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "WishlistConfig">;

/** Optional desired configuration for a wishlisted kit (spec §24). */
export const WishlistConfigScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { kitId } = route.params;
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const players = useCatalogueStore((s) => s.players);
  const loadLookups = useCatalogueStore((s) => s.loadLookups);
  const entries = useWishlistStore((s) => s.entries);
  const load = useWishlistStore((s) => s.load);
  const add = useWishlistStore((s) => s.add);
  const updateConfig = useWishlistStore((s) => s.updateConfig);

  const [productVersion, setProductVersion] = useState<ProductVersion | null>(
    null,
  );
  const [edition, setEdition] = useState<Edition | null>(null);
  const [sleeve, setSleeve] = useState<SleeveType | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [numberText, setNumberText] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadLookups();
    void load();
  }, [loadLookups, load]);

  // Prefill from the existing entry, if any.
  useEffect(() => {
    const existing = entries.find((e) => e.entry.kitId === kitId);
    if (!existing) return;
    const { entry } = existing;
    setProductVersion(entry.productVersion);
    setEdition(entry.edition);
    setSleeve(entry.sleeve);
    setPlayerId(entry.playerId);
    setCustomName(entry.customName ?? "");
    setNumberText(entry.number != null ? String(entry.number) : "");
    setNotes(entry.notes ?? "");
  }, [entries, kitId]);

  const save = async () => {
    setSaving(true);
    try {
      const number = /^\d{1,3}$/.test(numberText.trim())
        ? Number(numberText.trim())
        : undefined;
      const config = {
        ...(productVersion ? { productVersion } : {}),
        ...(edition ? { edition } : {}),
        ...(sleeve ? { sleeve } : {}),
        ...(playerId ? { playerId } : {}),
        ...(customName.trim() ? { customName: customName.trim() } : {}),
        ...(number != null ? { number } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      };
      const exists = entries.some((e) => e.entry.kitId === kitId);
      if (exists) await updateConfig(kitId, config);
      else await add(kitId, config);
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const enumOptions = <T extends string>(values: T[], group: string) =>
    values.map((value) => ({ value, label: t(`enums.${group}.${value}`) }));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        padding: spacing.screen,
        paddingBottom: spacing.xl * 2,
        gap: spacing.md,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <PickerField
        label={t("itemForm.productVersion")}
        placeholder={t("common.optional")}
        options={enumOptions(PRODUCT_VERSIONS, "productVersion")}
        value={productVersion}
        onChange={setProductVersion}
        optional
      />
      <PickerField
        label={t("itemForm.edition")}
        placeholder={t("common.optional")}
        options={enumOptions(EDITIONS, "edition")}
        value={edition}
        onChange={setEdition}
        optional
      />
      <PickerField
        label={t("itemForm.sleeve")}
        placeholder={t("common.optional")}
        options={enumOptions(SLEEVE_TYPES, "sleeve")}
        value={sleeve}
        onChange={setSleeve}
        optional
      />
      <PickerField
        label={t("itemForm.player")}
        placeholder={t("common.optional")}
        options={players.map((p) => ({
          value: p.id,
          label: p.name,
          ...(p.fullName ? { detail: p.fullName } : {}),
        }))}
        value={playerId}
        onChange={setPlayerId}
        optional
      />
      <TextField
        label={t("itemForm.customName")}
        value={customName}
        onChangeText={setCustomName}
        placeholder={t("common.optional")}
        autoCapitalize="characters"
      />
      <TextField
        label={t("itemForm.number")}
        value={numberText}
        onChangeText={setNumberText}
        keyboardType="number-pad"
        maxLength={3}
        placeholder={t("common.optional")}
      />
      <TextField
        label={t("wishlistConfig.notes")}
        value={notes}
        onChangeText={setNotes}
        placeholder={t("common.optional")}
        multiline
      />
      <Button
        label={t("common.save")}
        onPress={() => void save()}
        loading={saving}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

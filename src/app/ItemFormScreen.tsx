import React, { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import {
  BACK_TYPES,
  CONDITIONS,
  CURRENCIES,
  EDITIONS,
  PRODUCT_VERSIONS,
  SLEEVE_TYPES,
} from "@/config/constants";
import type {
  BackType,
  Condition,
  Edition,
  ProductVersion,
  SleeveType,
} from "@/config/types";
import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button";
import { MultiPickerField } from "@/components/shared/MultiPickerField";
import { TextField } from "@/components/shared/TextField";
import { ChoiceField } from "@/components/shared/ChoiceField";
import { PickerField } from "@/components/shared/PickerField";
import { Section } from "@/components/shared/Section";
import { useCatalogueStore } from "@/features/catalogue/catalogueStore";
import { useCollectionStore } from "@/features/collection/collectionStore";
import { getItemDetail } from "@/features/collection/collectionService";
import { getKitSummariesByIds } from "@/features/catalogue/catalogueService";
import type { KitSummary } from "@/features/catalogue/types";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "ItemForm">;

/** Add/edit one physical shirt. Required: kit + condition; all else optional. */
export const ItemFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const params = route.params;
  const isEdit = params.itemId != null;
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const players = useCatalogueStore((s) => s.players);
  const addonsList = useCatalogueStore((s) => s.addons);
  const loadLookups = useCatalogueStore((s) => s.loadLookups);
  const createPlayer = useCatalogueStore((s) => s.createPlayer);
  const addItem = useCollectionStore((s) => s.add);
  const editItem = useCollectionStore((s) => s.edit);

  const [kitId, setKitId] = useState<string | null>(params.kitId ?? null);
  const [kitSummary, setKitSummary] = useState<KitSummary | null>(null);
  const [condition, setCondition] = useState<Condition>("very_good");
  const [conditionNote, setConditionNote] = useState("");
  const [productVersion, setProductVersion] = useState<ProductVersion | null>(
    null,
  );
  const [edition, setEdition] = useState<Edition | null>(null);
  const [sleeve, setSleeve] = useState<SleeveType | null>(null);
  const [backType, setBackType] = useState<BackType>("blank");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [numberText, setNumberText] = useState("");
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
  const [seller, setSeller] = useState("");
  const [priceText, setPriceText] = useState("");
  const [currency, setCurrency] = useState<string | null>(null);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadLookups();
  }, [loadLookups]);

  // Prefill when editing.
  useEffect(() => {
    if (!params.itemId) return;
    void getItemDetail(params.itemId).then((detail) => {
      if (!detail) return;
      const { item } = detail;
      setKitId(item.kitId);
      setCondition(item.condition);
      setConditionNote(item.conditionNote ?? "");
      setProductVersion(item.productVersion);
      setEdition(item.edition);
      setSleeve(item.sleeve);
      setBackType(item.backType);
      setPlayerId(item.playerId);
      setCustomName(item.customName ?? "");
      setNumberText(item.number != null ? String(item.number) : "");
      setPurchaseDate(item.purchaseDate);
      setSeller(item.seller ?? "");
      setPriceText(
        item.purchasePrice != null ? String(item.purchasePrice) : "",
      );
      setCurrency(item.currency);
      setAddonIds(detail.addons.map((a) => a.id));
    });
  }, [params.itemId]);

  useEffect(() => {
    if (!kitId) return;
    void getKitSummariesByIds([kitId]).then((rows) =>
      setKitSummary(rows[0] ?? null),
    );
  }, [kitId]);

  const promptNewPlayer = useCallback(() => {
    Alert.prompt(
      t("itemForm.newPlayerTitle"),
      t("itemForm.newPlayerMessage"),
      (name) => {
        const trimmed = name?.trim();
        if (!trimmed) return;
        void createPlayer(trimmed).then((player) => setPlayerId(player.id));
      },
    );
  }, [createPlayer, t]);

  const parsedNumber = /^\d{1,3}$/.test(numberText.trim())
    ? Number(numberText.trim())
    : null;
  const parsedPrice = (() => {
    const normalized = priceText.trim().replace(",", ".");
    if (!normalized) return null;
    const value = Number(normalized);
    return Number.isFinite(value) ? value : null;
  })();

  const save = async () => {
    if (!kitId) return;
    setSaving(true);
    try {
      const shared = {
        condition,
        conditionNote: conditionNote.trim() || null,
        productVersion,
        edition,
        sleeve,
        backType,
        playerId: backType === "player" ? playerId : null,
        customName: backType === "custom" ? customName.trim() || null : null,
        number: backType === "blank" ? null : parsedNumber,
        purchaseDate,
        seller: seller.trim() || null,
        purchasePrice: parsedPrice,
        currency: parsedPrice != null ? currency : null,
        addonIds,
      };
      if (isEdit && params.itemId) {
        await editItem(params.itemId, shared);
        navigation.goBack();
      } else {
        const item = await addItem({
          kitId,
          condition,
          ...(shared.conditionNote
            ? { conditionNote: shared.conditionNote }
            : {}),
          ...(productVersion ? { productVersion } : {}),
          ...(edition ? { edition } : {}),
          ...(sleeve ? { sleeve } : {}),
          backType,
          ...(shared.playerId ? { playerId: shared.playerId } : {}),
          ...(shared.customName ? { customName: shared.customName } : {}),
          ...(shared.number != null ? { number: shared.number } : {}),
          ...(purchaseDate ? { purchaseDate } : {}),
          ...(shared.seller ? { seller: shared.seller } : {}),
          ...(parsedPrice != null ? { purchasePrice: parsedPrice } : {}),
          ...(parsedPrice != null && currency ? { currency } : {}),
          addonIds,
        });
        // Land on the new item so photos can be added right away (Flow 1,
        // step 10), collapsing the add-flow screens underneath (AddShirt /
        // TeamDetail / KitDetail) so one back tap returns to the tabs.
        const rootRoute = navigation.getState()?.routes[0];
        // Plain RESET action: CommonActions.reset's return type clashes with
        // exactOptionalPropertyTypes (payload typed `| undefined`).
        navigation.dispatch({
          type: "RESET",
          payload: {
            index: rootRoute ? 1 : 0,
            routes: [
              ...(rootRoute
                ? [{ name: rootRoute.name, params: rootRoute.params }]
                : []),
              { name: "ItemDetail", params: { itemId: item.id } },
            ],
          },
        });
      }
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
        gap: spacing.lg,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {kitSummary ? (
        <View style={{ gap: 2 }}>
          <AppText variant="title">
            {kitSummary.teamName} · {t(`enums.kitType.${kitSummary.kit.type}`)}
          </AppText>
          <AppText variant="labelSm" color={colors.onSurfaceVariant}>
            {kitSummary.eraLabel}
            {kitSummary.manufacturerName
              ? ` · ${kitSummary.manufacturerName}`
              : ""}
          </AppText>
        </View>
      ) : null}

      <Section title={t("itemForm.conditionSection")} icon="ribbon-outline">
        <PickerField
          label={t("itemForm.condition")}
          placeholder={t("common.select")}
          options={enumOptions(CONDITIONS, "condition")}
          value={condition}
          onChange={(value) => value && setCondition(value)}
        />
        <TextField
          label={t("itemForm.conditionNote")}
          value={conditionNote}
          onChangeText={setConditionNote}
          placeholder={t("itemForm.conditionNotePlaceholder")}
          multiline
        />
      </Section>

      <Section
        title={t("itemForm.versionSection")}
        icon="shield-checkmark-outline"
      >
        <PickerField
          label={t("itemForm.productVersion")}
          placeholder={t("common.optional")}
          options={enumOptions(PRODUCT_VERSIONS, "productVersion")}
          value={productVersion}
          onChange={setProductVersion}
          optional
        />
        <ChoiceField
          label={t("itemForm.edition")}
          options={enumOptions(EDITIONS, "edition")}
          value={edition}
          onChange={setEdition}
          optional
        />
        <ChoiceField
          label={t("itemForm.sleeve")}
          options={enumOptions(SLEEVE_TYPES, "sleeve")}
          value={sleeve}
          onChange={setSleeve}
          optional
        />
      </Section>

      <Section title={t("itemForm.backSection")} icon="person-outline">
        <PickerField
          label={t("itemForm.back")}
          placeholder={t("common.select")}
          options={enumOptions(BACK_TYPES, "backType")}
          value={backType}
          onChange={(value) => value && setBackType(value)}
        />
        {backType === "player" ? (
          <PickerField
            label={t("itemForm.player")}
            placeholder={t("common.select")}
            options={[
              ...players.map((p) => ({
                value: p.id,
                label: p.name,
                ...(p.fullName ? { detail: p.fullName } : {}),
              })),
              { value: "__new__", label: t("itemForm.newPlayer") },
            ]}
            value={playerId}
            onChange={(value) => {
              if (value === "__new__") promptNewPlayer();
              else setPlayerId(value);
            }}
            optional
          />
        ) : null}
        {backType === "custom" ? (
          <TextField
            label={t("itemForm.customName")}
            value={customName}
            onChangeText={setCustomName}
            autoCapitalize="characters"
          />
        ) : null}
        {backType !== "blank" ? (
          <TextField
            label={t("itemForm.number")}
            value={numberText}
            onChangeText={setNumberText}
            keyboardType="number-pad"
            maxLength={3}
          />
        ) : null}
      </Section>

      <Section title={t("itemForm.addons")} icon="medal-outline">
        <MultiPickerField
          label={t("itemForm.addonsField")}
          placeholder={t("itemForm.addonsPlaceholder")}
          options={addonsList.map((addon) => ({
            value: addon.id,
            label: addon.name,
            detail: t(`enums.addonType.${addon.type}`),
          }))}
          values={addonIds}
          onChange={setAddonIds}
        />
      </Section>

      <Section title={t("itemForm.purchaseSection")} icon="receipt-outline">
        <View style={{ gap: spacing.xs }}>
          <AppText variant="labelSm" color={colors.onSurfaceVariant}>
            {t("itemForm.purchaseDate")}
          </AppText>
          <Pressable
            onPress={() => setDatePickerOpen(true)}
            style={[
              styles.dateField,
              {
                backgroundColor: colors.surfaceContainer,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <AppText color={purchaseDate ? colors.onSurface : colors.outline}>
              {purchaseDate
                ? format(purchaseDate, "d MMM yyyy")
                : t("common.optional")}
            </AppText>
            {purchaseDate ? (
              <Pressable onPress={() => setPurchaseDate(null)} hitSlop={8}>
                <AppText variant="labelSm" color={colors.outline}>
                  ✕
                </AppText>
              </Pressable>
            ) : null}
          </Pressable>
        </View>
        <TextField
          label={t("itemForm.seller")}
          value={seller}
          onChangeText={setSeller}
          placeholder={t("common.optional")}
        />
        <View style={styles.priceRow}>
          <View style={styles.priceField}>
            <TextField
              label={t("itemForm.price")}
              value={priceText}
              onChangeText={setPriceText}
              keyboardType="decimal-pad"
              placeholder={t("common.optional")}
            />
          </View>
          <View style={styles.currencyField}>
            <PickerField
              label={t("itemForm.currency")}
              placeholder="—"
              options={CURRENCIES.map((code) => ({ value: code, label: code }))}
              value={currency}
              onChange={setCurrency}
              optional
            />
          </View>
        </View>
      </Section>

      <Button
        label={isEdit ? t("common.save") : t("itemForm.addToCollection")}
        icon={isEdit ? "checkmark-outline" : "add-circle-outline"}
        onPress={() => void save()}
        disabled={!kitId}
        loading={saving}
      />

      <DateTimePickerModal
        isVisible={datePickerOpen}
        mode="date"
        date={purchaseDate ?? new Date()}
        maximumDate={new Date()}
        onConfirm={(date) => {
          setPurchaseDate(date);
          setDatePickerOpen(false);
        }}
        onCancel={() => setDatePickerOpen(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  dateField: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceRow: { flexDirection: "row", gap: 12 },
  priceField: { flex: 3 },
  currencyField: { flex: 2 },
});

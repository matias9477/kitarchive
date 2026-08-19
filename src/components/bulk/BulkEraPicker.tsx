import React, { useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { Button } from "@/components/shared/Button";
import { PickerField } from "@/components/shared/PickerField";
import { TextField } from "@/components/shared/TextField";
import { useCatalogueStore } from "@/features/catalogue/catalogueStore";
import { deriveStartYear } from "@/lib/years";

interface BulkEraPickerProps {
  teamId: string;
  selectedEraId: string | null;
  onSelect: (eraId: string) => void;
}

const NO_ERAS: never[] = [];

/**
 * Bulk-add step 2: the season via the standard picker field (recent first),
 * with an inline "new season" form whose start year derives from the label.
 */
export const BulkEraPicker: React.FC<BulkEraPickerProps> = ({
  teamId,
  selectedEraId,
  onSelect,
}) => {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const eras = useCatalogueStore((s) => s.erasByTeam[teamId] ?? NO_ERAS);
  const createEra = useCatalogueStore((s) => s.createEra);

  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [yearText, setYearText] = useState("");
  const [yearEdited, setYearEdited] = useState(false);
  const [busy, setBusy] = useState(false);

  const derivedYear = deriveStartYear(label);
  const effectiveYearText = yearEdited
    ? yearText
    : (derivedYear?.toString() ?? "");
  const startYear = /^\d{4}$/.test(effectiveYearText.trim())
    ? Number(effectiveYearText.trim())
    : null;

  const create = async () => {
    if (startYear == null) return;
    setBusy(true);
    try {
      const era = await createEra({ teamId, startYear, label: label.trim() });
      setCreating(false);
      setLabel("");
      setYearText("");
      setYearEdited(false);
      onSelect(era.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <PickerField
        label={t("bulkAdd.season")}
        placeholder={t("common.select")}
        options={[
          ...eras.map((era) => ({ value: era.id, label: era.label })),
          { value: "__new__", label: t("bulkAdd.newSeasonOption") },
        ]}
        value={selectedEraId}
        onChange={(value) => {
          if (value === "__new__") {
            setCreating(true);
            return;
          }
          if (value) {
            setCreating(false);
            onSelect(value);
          }
        }}
      />

      {creating ? (
        <View style={{ gap: spacing.sm }}>
          <TextField
            label={t("bulkAdd.seasonLabel")}
            value={label}
            onChangeText={setLabel}
            placeholder={t("createKit.eraLabelPlaceholder")}
            autoCapitalize="none"
            autoFocus
          />
          <TextField
            label={t("bulkAdd.startYear")}
            value={effectiveYearText}
            onChangeText={(text) => {
              setYearEdited(true);
              setYearText(text);
            }}
            keyboardType="number-pad"
            maxLength={4}
          />
          <Button
            label={t("bulkAdd.createSeason")}
            icon="add-outline"
            variant="ghost"
            onPress={() => void create()}
            disabled={label.trim().length === 0 || startYear == null || busy}
            loading={busy}
          />
        </View>
      ) : null}
    </View>
  );
};

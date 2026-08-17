import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Switch, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { KIT_TYPES } from "@/config/constants";
import type { KitType, TeamType } from "@/config/types";
import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button";
import { TextField } from "@/components/shared/TextField";
import { PickerField } from "@/components/shared/PickerField";
import { Section } from "@/components/shared/Section";
import { useCatalogueStore } from "@/features/catalogue/catalogueStore";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "CreateKit">;

/**
 * Extend the catalogue: add a kit under an existing or new team/era. Rows
 * created here are source='user' and never touched by seed upgrades.
 */
export const CreateKitScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const teams = useCatalogueStore((s) => s.teams);
  const countries = useCatalogueStore((s) => s.countries);
  const manufacturers = useCatalogueStore((s) => s.manufacturers);
  const erasByTeam = useCatalogueStore((s) => s.erasByTeam);
  const loadTeams = useCatalogueStore((s) => s.loadTeams);
  const loadLookups = useCatalogueStore((s) => s.loadLookups);
  const loadTeamCatalogue = useCatalogueStore((s) => s.loadTeamCatalogue);
  const createTeam = useCatalogueStore((s) => s.createTeam);
  const createEra = useCatalogueStore((s) => s.createEra);
  const createKit = useCatalogueStore((s) => s.createKit);

  const [teamId, setTeamId] = useState<string | null>(
    route.params?.teamId ?? null,
  );
  const [newTeam, setNewTeam] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamType, setTeamType] = useState<TeamType>("club");
  const [countryId, setCountryId] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#0d3b7d");
  const [secondaryColor, setSecondaryColor] = useState("");

  const [eraId, setEraId] = useState<string | null>(null);
  const [newEra, setNewEra] = useState(false);
  const [eraLabel, setEraLabel] = useState("");
  const [startYearText, setStartYearText] = useState("");
  const [endYearText, setEndYearText] = useState("");

  const [kitType, setKitType] = useState<KitType>("home");
  const [manufacturerId, setManufacturerId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadTeams();
    void loadLookups();
  }, [loadTeams, loadLookups]);

  useEffect(() => {
    if (teamId) void loadTeamCatalogue(teamId);
  }, [teamId, loadTeamCatalogue]);

  const eras = useMemo(
    () => (teamId ? (erasByTeam[teamId] ?? []) : []),
    [erasByTeam, teamId],
  );

  const startYear = /^\d{4}$/.test(startYearText.trim())
    ? Number(startYearText.trim())
    : null;
  const endYear = /^\d{4}$/.test(endYearText.trim())
    ? Number(endYearText.trim())
    : null;

  const teamReady = newTeam
    ? teamName.trim().length > 1 && countryId != null
    : teamId != null;
  const eraReady = newEra
    ? eraLabel.trim().length > 0 && startYear != null
    : eraId != null;
  const canSave = teamReady && eraReady && !saving;

  const save = async () => {
    setSaving(true);
    try {
      let resolvedTeamId = teamId;
      if (newTeam && countryId) {
        const team = await createTeam({
          name: teamName.trim(),
          countryId,
          type: teamType,
          primaryColor: primaryColor.trim() || "#1d2022",
          ...(secondaryColor.trim()
            ? { secondaryColor: secondaryColor.trim() }
            : {}),
        });
        resolvedTeamId = team.id;
      }
      if (!resolvedTeamId) return;

      let resolvedEraId = eraId;
      if (newEra && startYear != null) {
        const era = await createEra({
          teamId: resolvedTeamId,
          startYear,
          ...(endYear != null ? { endYear } : {}),
          label: eraLabel.trim(),
        });
        resolvedEraId = era.id;
      }
      if (!resolvedEraId) return;

      const kit = await createKit({
        teamId: resolvedTeamId,
        eraId: resolvedEraId,
        type: kitType,
        ...(manufacturerId ? { manufacturerId } : {}),
        ...(description.trim() ? { description: description.trim() } : {}),
      });
      navigation.replace("KitDetail", { kitId: kit.id });
    } finally {
      setSaving(false);
    }
  };

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
      <Section
        title={t("createKit.teamSection")}
        icon="shield-outline"
        trailing={
          <View style={styles.toggle}>
            <AppText variant="labelSm" color={colors.onSurfaceVariant}>
              {t("createKit.newTeam")}
            </AppText>
            <Switch value={newTeam} onValueChange={setNewTeam} />
          </View>
        }
      >
        {newTeam ? (
          <View style={{ gap: spacing.sm }}>
            <TextField
              label={t("createKit.teamName")}
              value={teamName}
              onChangeText={setTeamName}
            />
            <PickerField
              label={t("createKit.teamType")}
              placeholder={t("common.select")}
              options={[
                { value: "club", label: t("enums.teamType.club") },
                { value: "national", label: t("enums.teamType.national") },
              ]}
              value={teamType}
              onChange={(value) => value && setTeamType(value)}
            />
            <PickerField
              label={t("createKit.country")}
              placeholder={t("common.select")}
              options={countries.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              value={countryId}
              onChange={setCountryId}
            />
            <TextField
              label={t("createKit.primaryColor")}
              value={primaryColor}
              onChangeText={setPrimaryColor}
              autoCapitalize="none"
              placeholder="#0d3b7d"
            />
            <TextField
              label={t("createKit.secondaryColor")}
              value={secondaryColor}
              onChangeText={setSecondaryColor}
              autoCapitalize="none"
              placeholder={t("common.optional")}
            />
          </View>
        ) : (
          <PickerField
            label={t("createKit.team")}
            placeholder={t("common.select")}
            options={teams.map((team) => ({
              value: team.id,
              label: team.name,
              detail: team.countryName,
            }))}
            value={teamId}
            onChange={(value) => {
              setTeamId(value);
              setEraId(null);
            }}
          />
        )}
      </Section>

      <Section
        title={t("createKit.eraSection")}
        icon="calendar-outline"
        trailing={
          <View style={styles.toggle}>
            <AppText variant="labelSm" color={colors.onSurfaceVariant}>
              {t("createKit.newEra")}
            </AppText>
            <Switch
              value={newEra || newTeam}
              onValueChange={setNewEra}
              disabled={newTeam}
            />
          </View>
        }
      >
        {newEra || newTeam ? (
          <View style={{ gap: spacing.sm }}>
            <TextField
              label={t("createKit.eraLabel")}
              value={eraLabel}
              onChangeText={setEraLabel}
              placeholder={t("createKit.eraLabelPlaceholder")}
              autoCapitalize="none"
            />
            <View style={styles.yearRow}>
              <View style={styles.yearField}>
                <TextField
                  label={t("createKit.startYear")}
                  value={startYearText}
                  onChangeText={setStartYearText}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
              <View style={styles.yearField}>
                <TextField
                  label={t("createKit.endYear")}
                  value={endYearText}
                  onChangeText={setEndYearText}
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder={t("common.optional")}
                />
              </View>
            </View>
          </View>
        ) : (
          <PickerField
            label={t("createKit.era")}
            placeholder={
              teamId ? t("common.select") : t("createKit.pickTeamFirst")
            }
            options={eras.map((era) => ({ value: era.id, label: era.label }))}
            value={eraId}
            onChange={setEraId}
            disabled={!teamId}
          />
        )}
      </Section>

      <Section title={t("createKit.kitSection")} icon="shirt-outline">
        <PickerField
          label={t("createKit.kitType")}
          placeholder={t("common.select")}
          options={KIT_TYPES.map((type) => ({
            value: type,
            label: t(`enums.kitType.${type}`),
          }))}
          value={kitType}
          onChange={(value) => value && setKitType(value)}
        />
        <PickerField
          label={t("createKit.manufacturer")}
          placeholder={t("common.optional")}
          options={manufacturers.map((m) => ({ value: m.id, label: m.name }))}
          value={manufacturerId}
          onChange={setManufacturerId}
          optional
        />
        <TextField
          label={t("createKit.description")}
          value={description}
          onChangeText={setDescription}
          placeholder={t("common.optional")}
          multiline
        />
      </Section>

      <Button
        label={t("createKit.save")}
        icon="checkmark-outline"
        onPress={() => void save()}
        disabled={!canSave}
        loading={saving}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  toggle: { flexDirection: "row", alignItems: "center", gap: 8 },
  yearRow: { flexDirection: "row", gap: 12 },
  yearField: { flex: 1 },
});

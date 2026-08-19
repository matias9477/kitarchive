import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button";
import { PickerField } from "@/components/shared/PickerField";
import { TextField } from "@/components/shared/TextField";
import { TeamRow } from "@/components/kits/TeamRow";
import { useCatalogueStore } from "@/features/catalogue/catalogueStore";
import { getSuggestedTeams } from "@/features/catalogue/catalogueService";
import type { TeamWithCountry } from "@/features/catalogue/types";

interface BulkTeamPickerProps {
  selected: TeamWithCountry | null;
  onSelect: (team: TeamWithCountry) => void;
}

/**
 * Bulk-add step 1: choose (or quickly create) a team. Collapses to a single
 * row once chosen — tap it to switch teams mid-session.
 */
export const BulkTeamPicker: React.FC<BulkTeamPickerProps> = ({
  selected,
  onSelect,
}) => {
  const { colors, spacing, radius, typography } = useTheme();
  const { t } = useTranslation();
  const teams = useCatalogueStore((s) => s.teams);
  const countries = useCatalogueStore((s) => s.countries);
  const createTeam = useCatalogueStore((s) => s.createTeam);

  const [expanded, setExpanded] = useState(true);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<TeamWithCountry[]>([]);
  const [creating, setCreating] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [countryId, setCountryId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getSuggestedTeams().then(setSuggestions);
  }, []);

  const pick = (team: TeamWithCountry) => {
    onSelect(team);
    setExpanded(false);
    setQuery("");
    setCreating(false);
  };

  const create = async () => {
    if (!countryId) return;
    setBusy(true);
    try {
      const team = await createTeam({
        name: teamName.trim(),
        countryId,
        type: "club",
        primaryColor: "#0d3b7d",
      });
      setTeamName("");
      setCountryId(null);
      pick(team);
    } finally {
      setBusy(false);
    }
  };

  if (selected && !expanded) {
    return <TeamRow team={selected} onPress={() => setExpanded(true)} />;
  }

  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed
    ? teams.filter((team) => team.name.toLowerCase().includes(trimmed))
    : teams;

  return (
    <View style={{ gap: spacing.sm }}>
      <View
        style={[
          styles.searchBox,
          { backgroundColor: colors.surfaceContainer, borderRadius: radius.md },
        ]}
      >
        <Ionicons name="search" size={18} color={colors.outline} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t("bulkAdd.searchTeams")}
          placeholderTextColor={colors.outline}
          keyboardAppearance="dark"
          style={[
            styles.searchInput,
            typography.body,
            { color: colors.onSurface },
          ]}
        />
      </View>

      {!trimmed && suggestions.length > 0 ? (
        <View style={{ gap: spacing.xs, marginBottom: spacing.sm }}>
          <AppText variant="labelSm" color={colors.onSurfaceVariant}>
            {t("addShirt.suggestions")}
          </AppText>
          {suggestions.map((team) => (
            <TeamRow key={team.id} team={team} onPress={() => pick(team)} />
          ))}
        </View>
      ) : null}

      <View style={{ gap: spacing.xs }}>
        {!trimmed && suggestions.length > 0 ? (
          <AppText variant="labelSm" color={colors.onSurfaceVariant}>
            {t("bulkAdd.allTeams")}
          </AppText>
        ) : null}
        {filtered.map((team) => (
          <TeamRow key={team.id} team={team} onPress={() => pick(team)} />
        ))}
      </View>

      {creating ? (
        <View style={{ gap: spacing.sm }}>
          <TextField
            label={t("bulkAdd.teamName")}
            value={teamName}
            onChangeText={setTeamName}
            autoFocus
          />
          <PickerField
            label={t("bulkAdd.country")}
            placeholder={t("common.select")}
            options={countries.map((c) => ({ value: c.id, label: c.name }))}
            value={countryId}
            onChange={setCountryId}
          />
          <Button
            label={t("bulkAdd.createTeam")}
            icon="add-outline"
            variant="ghost"
            onPress={() => void create()}
            disabled={teamName.trim().length <= 1 || countryId == null || busy}
            loading={busy}
          />
        </View>
      ) : (
        <Pressable onPress={() => setCreating(true)} style={styles.newLink}>
          <Ionicons name="add" size={16} color={colors.secondary} />
          <AppText variant="bodySm" color={colors.secondary}>
            {t("bulkAdd.newTeam")}
          </AppText>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, paddingVertical: 12 },
  newLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
  },
});

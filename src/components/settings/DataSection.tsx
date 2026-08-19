import React, { useState } from "react";
import { Alert, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { Section } from "@/components/shared/Section";
import { SettingsRow } from "./SettingsRow";
import {
  exportBackup,
  importBackup,
  pickBackupFile,
} from "@/features/settings/backupService";
import { BackupError } from "@/features/settings/backupData";

/** Backup export / restore. Restore replaces all data behind a confirm. */
export const DataSection: React.FC = () => {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportBackup();
    } catch {
      Alert.alert(
        t("settings.exportErrorTitle"),
        t("settings.exportErrorMessage"),
      );
    } finally {
      setExporting(false);
    }
  };

  const runImport = async (uri: string) => {
    setImporting(true);
    try {
      await importBackup(uri);
      Alert.alert(
        t("settings.importSuccessTitle"),
        t("settings.importSuccessMessage"),
      );
    } catch (error) {
      const message =
        error instanceof BackupError
          ? error.code === "newer"
            ? t("settings.importErrorNewer")
            : t("settings.importErrorInvalid")
          : t("settings.importErrorGeneric");
      Alert.alert(t("settings.importErrorTitle"), message);
    } finally {
      setImporting(false);
    }
  };

  const handleImport = async () => {
    const uri = await pickBackupFile();
    if (!uri) return;
    Alert.alert(
      t("settings.importConfirmTitle"),
      t("settings.importConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.importConfirmAction"),
          style: "destructive",
          onPress: () => void runImport(uri),
        },
      ],
    );
  };

  return (
    <Section title={t("settings.backup")} icon="archive-outline">
      <View style={{ gap: spacing.xs }}>
        <SettingsRow
          label={t("settings.exportBackup")}
          trailingIcon="share-outline"
          onPress={() => void handleExport()}
          loading={exporting}
          disabled={importing}
        />
        <SettingsRow
          label={t("settings.importBackup")}
          trailingIcon="cloud-download-outline"
          onPress={() => void handleImport()}
          loading={importing}
          disabled={exporting}
        />
      </View>
    </Section>
  );
};

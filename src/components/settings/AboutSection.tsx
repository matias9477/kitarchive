import React from "react";
import { Linking, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { Section } from "@/components/shared/Section";
import { SettingsRow } from "./SettingsRow";
import { PRIVACY_POLICY_URL } from "@/config/constants";
import { getAppVersion } from "@/utils/version";
import { SEED_VERSION } from "@/db/seed";

/** App version, catalogue version and privacy policy link. */
export const AboutSection: React.FC = () => {
  const { spacing } = useTheme();
  const { t } = useTranslation();

  return (
    <Section title={t("settings.about")} icon="information-circle-outline">
      <View style={{ gap: spacing.xs }}>
        <SettingsRow
          label={t("settings.version")}
          trailing={<AppText>{getAppVersion()}</AppText>}
        />
        <SettingsRow
          label={t("settings.catalogueVersion")}
          trailing={<AppText>{SEED_VERSION}</AppText>}
        />
        <SettingsRow
          label={t("settings.privacyPolicy")}
          trailingIcon="open-outline"
          onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}
        />
      </View>
    </Section>
  );
};

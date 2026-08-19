import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { Section } from "@/components/shared/Section";
import { SettingsRow } from "./SettingsRow";
import { useLanguageStore } from "@/store/languageStore";
import type { LanguagePreference } from "@/i18n/index";

/** Language preference picker (system / en / es). */
export const LanguageSection: React.FC = () => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const options: { value: LanguagePreference; label: string }[] = [
    { value: "system", label: t("settings.system") },
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
  ];

  return (
    <Section title={t("settings.language")} icon="language-outline">
      <View style={{ gap: spacing.xs }}>
        {options.map((option) => {
          const active = option.value === language;
          return (
            <SettingsRow
              key={option.value}
              label={option.label}
              labelColor={active ? colors.secondary : colors.onSurface}
              onPress={() => setLanguage(option.value)}
              trailing={
                active ? (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={colors.secondary}
                  />
                ) : null
              }
            />
          );
        })}
      </View>
    </Section>
  );
};

import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { Section } from "@/components/shared/Section";
import { useLanguageStore } from "@/store/languageStore";
import type { LanguagePreference } from "@/i18n/index";
import { getAppVersion } from "@/utils/version";
import { SEED_VERSION } from "@/db/seed";

/** Language + about. The app is dark-only by design, so no theme toggle. */
export const SettingsScreen: React.FC = () => {
  const { colors, spacing, radius } = useTheme();
  const { t } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const languageOptions: { value: LanguagePreference; label: string }[] = [
    { value: "system", label: t("settings.system") },
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.screen, gap: spacing.lg }}
    >
      <Section title={t("settings.language")}>
        <View style={{ gap: spacing.xs }}>
          {languageOptions.map((option) => {
            const active = option.value === language;
            return (
              <Pressable
                key={option.value}
                onPress={() => setLanguage(option.value)}
                style={[
                  styles.row,
                  {
                    backgroundColor: colors.surfaceContainer,
                    borderRadius: radius.md,
                  },
                ]}
              >
                <AppText color={active ? colors.secondary : colors.onSurface}>
                  {option.label}
                </AppText>
                {active ? (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={colors.secondary}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Section title={t("settings.about")}>
        <View style={{ gap: spacing.xs }}>
          <View
            style={[
              styles.row,
              {
                backgroundColor: colors.surfaceContainer,
                borderRadius: radius.md,
              },
            ]}
          >
            <AppText color={colors.onSurfaceVariant}>
              {t("settings.version")}
            </AppText>
            <AppText>{getAppVersion()}</AppText>
          </View>
          <View
            style={[
              styles.row,
              {
                backgroundColor: colors.surfaceContainer,
                borderRadius: radius.md,
              },
            ]}
          >
            <AppText color={colors.onSurfaceVariant}>
              {t("settings.catalogueVersion")}
            </AppText>
            <AppText>{SEED_VERSION}</AppText>
          </View>
        </View>
      </Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
});

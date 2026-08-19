import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@/theme/index";
import { LanguageSection } from "@/components/settings/LanguageSection";
import { DataSection } from "@/components/settings/DataSection";
import { AboutSection } from "@/components/settings/AboutSection";

/** Language + backup + about. Dark-only by design, so no theme toggle. */
export const SettingsScreen: React.FC = () => {
  const { colors, spacing } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.screen, gap: spacing.lg }}
    >
      <LanguageSection />
      <DataSection />
      <AboutSection />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

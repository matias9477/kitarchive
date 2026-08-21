import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import type { OnboardingSlide } from "@/features/onboarding/slides";

interface OnboardingSlideViewProps {
  slide: OnboardingSlide;
  /** Page width — each slide fills exactly one page of the pager. */
  width: number;
}

/** One onboarding page: big icon badge, title, supporting copy. */
export const OnboardingSlideView: React.FC<OnboardingSlideViewProps> = ({
  slide,
  width,
}) => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.page, { width, padding: spacing.xl }]}>
      <View
        style={[styles.badge, { backgroundColor: colors.surfaceContainerHigh }]}
      >
        <Ionicons name={slide.icon} size={44} color={colors.secondary} />
      </View>
      <AppText variant="headline" align="center">
        {t(slide.titleKey)}
      </AppText>
      <AppText variant="body" align="center" color={colors.onSurfaceVariant}>
        {t(slide.messageKey)}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  page: { alignItems: "center", justifyContent: "center", gap: 16 },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
});

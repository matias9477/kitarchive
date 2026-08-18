import React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { Section } from "@/components/shared/Section";
import { StatRow } from "@/components/shared/StatRow";
import type { KitSummary } from "@/features/catalogue/types";

interface DuplicatesSectionProps {
  duplicates: { kit: KitSummary; count: number }[];
}

/** Kits owned more than once, linking to the kit page. */
export const DuplicatesSection: React.FC<DuplicatesSectionProps> = ({
  duplicates,
}) => {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  if (duplicates.length === 0) return null;

  return (
    <Section title={t("home.duplicates")} icon="copy-outline">
      <View style={{ gap: spacing.xs }}>
        {duplicates.map(({ kit, count }) => (
          <StatRow
            key={kit.kit.id}
            label={`${kit.teamName} · ${kit.eraLabel} · ${t(
              `enums.kitType.${kit.kit.type}`,
            )}`}
            value={`×${count}`}
            labelVariant="bodySm"
            onPress={() =>
              navigation.navigate("KitDetail", { kitId: kit.kit.id })
            }
          />
        ))}
      </View>
    </Section>
  );
};

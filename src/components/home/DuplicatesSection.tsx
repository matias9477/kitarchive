import React, { useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { Section } from "@/components/shared/Section";
import { StatRow } from "@/components/shared/StatRow";
import { ExpandToggle } from "@/components/shared/ExpandToggle";
import type { KitSummary } from "@/features/catalogue/types";

interface DuplicatesSectionProps {
  duplicates: { kit: KitSummary; count: number }[];
}

/** Rows shown while collapsed; the rest sit behind "show all". */
const MAX_COLLAPSED = 5;

/** Kits owned more than once, linking to the kit page. */
export const DuplicatesSection: React.FC<DuplicatesSectionProps> = ({
  duplicates,
}) => {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);

  if (duplicates.length === 0) return null;

  const visible = expanded ? duplicates : duplicates.slice(0, MAX_COLLAPSED);

  return (
    <Section title={t("home.duplicates")} icon="copy-outline">
      <View style={{ gap: spacing.xs }}>
        {visible.map(({ kit, count }) => (
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
        {duplicates.length > MAX_COLLAPSED ? (
          <ExpandToggle
            expanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
            showAllLabel={t("common.showAll", { count: duplicates.length })}
            showLessLabel={t("common.showLess")}
          />
        ) : null}
      </View>
    </Section>
  );
};

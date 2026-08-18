import React from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { Section } from "@/components/shared/Section";
import { BreakdownBars } from "@/components/shared/BreakdownBars";
import type { Condition, KitType } from "@/config/types";
import type { CountBucket } from "@/features/stats/types";

interface StatsBreakdownSectionProps {
  byType: CountBucket<KitType>[];
  byDecade: CountBucket[];
  byCondition: CountBucket<Condition>[];
}

/** Collection breakdowns (spec §29): one stacked bar per dimension. */
export const StatsBreakdownSection: React.FC<StatsBreakdownSectionProps> = ({
  byType,
  byDecade,
  byCondition,
}) => {
  const { spacing } = useTheme();
  const { t } = useTranslation();

  if (byType.length === 0) return null;

  return (
    <Section title={t("home.stats")} icon="stats-chart-outline">
      <View style={{ gap: spacing.sm }}>
        <BreakdownBars
          title={t("home.byType")}
          buckets={byType.map((b) => ({
            ...b,
            label: t(`enums.kitType.${b.key}`),
          }))}
        />
        <BreakdownBars title={t("home.byDecade")} buckets={byDecade} />
        <BreakdownBars
          title={t("home.byCondition")}
          buckets={byCondition.map((b) => ({
            ...b,
            label: t(`enums.condition.${b.key}`),
          }))}
        />
      </View>
    </Section>
  );
};

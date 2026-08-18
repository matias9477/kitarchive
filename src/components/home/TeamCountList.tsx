import React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { Section } from "@/components/shared/Section";
import { StatRow } from "@/components/shared/StatRow";
import type { CountBucket } from "@/features/stats/types";

interface TeamCountListProps {
  buckets: CountBucket[];
}

/** "By team" shirt counts — the top teams, each linking to its page. */
export const TeamCountList: React.FC<TeamCountListProps> = ({ buckets }) => {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  if (buckets.length === 0) return null;

  return (
    <Section title={t("home.byTeam")} icon="shield-outline">
      <View style={{ gap: spacing.xs }}>
        {buckets.slice(0, 6).map((bucket) => (
          <StatRow
            key={bucket.key}
            label={bucket.label}
            value={String(bucket.count)}
            onPress={() =>
              navigation.navigate("TeamDetail", { teamId: bucket.key })
            }
          />
        ))}
      </View>
    </Section>
  );
};

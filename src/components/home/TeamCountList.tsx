import React, { useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { Section } from "@/components/shared/Section";
import { StatRow } from "@/components/shared/StatRow";
import { ExpandToggle } from "@/components/shared/ExpandToggle";
import type { CountBucket } from "@/features/stats/types";

interface TeamCountListProps {
  buckets: CountBucket[];
}

/** Rows shown while collapsed; the rest sit behind "show all". */
const MAX_COLLAPSED = 6;

/** "By team" shirt counts — the top teams, each linking to its page. */
export const TeamCountList: React.FC<TeamCountListProps> = ({ buckets }) => {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);

  if (buckets.length === 0) return null;

  const visible = expanded ? buckets : buckets.slice(0, MAX_COLLAPSED);

  return (
    <Section title={t("home.byTeam")} icon="shield-outline">
      <View style={{ gap: spacing.xs }}>
        {visible.map((bucket) => (
          <StatRow
            key={bucket.key}
            label={bucket.label}
            value={String(bucket.count)}
            onPress={() =>
              navigation.navigate("TeamDetail", { teamId: bucket.key })
            }
          />
        ))}
        {buckets.length > MAX_COLLAPSED ? (
          <ExpandToggle
            expanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
            showAllLabel={t("common.showAll", { count: buckets.length })}
            showLessLabel={t("common.showLess")}
          />
        ) : null}
      </View>
    </Section>
  );
};

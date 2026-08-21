import React, { useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { ExpandToggle } from "@/components/shared/ExpandToggle";
import { ArchiveProgressCard } from "@/components/kits/ArchiveProgressCard";
import type { TeamProgress } from "@/features/stats/types";

interface ArchiveProgressListProps {
  progress: TeamProgress[];
}

/** Cards shown while collapsed — every starred team adds one, so cap it. */
const MAX_COLLAPSED = 3;

/** Catalogue-completion cards for the favorite teams. */
export const ArchiveProgressList: React.FC<ArchiveProgressListProps> = ({
  progress,
}) => {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);

  if (progress.length === 0) return null;

  const visible = expanded ? progress : progress.slice(0, MAX_COLLAPSED);

  return (
    <View style={{ gap: spacing.gutter }}>
      {visible.map((teamProgress) => (
        <ArchiveProgressCard
          key={teamProgress.teamId}
          title={t("home.archive", { team: teamProgress.teamName })}
          subtitle={t("home.trackingAll")}
          owned={teamProgress.ownedKits}
          total={teamProgress.totalKits}
          onPress={() =>
            navigation.navigate("TeamDetail", { teamId: teamProgress.teamId })
          }
        />
      ))}
      {progress.length > MAX_COLLAPSED ? (
        <ExpandToggle
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
          showAllLabel={t("common.showAll", { count: progress.length })}
          showLessLabel={t("common.showLess")}
        />
      ) : null}
    </View>
  );
};

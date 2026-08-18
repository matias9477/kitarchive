import React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { ArchiveProgressCard } from "@/components/kits/ArchiveProgressCard";
import type { TeamProgress } from "@/features/stats/types";

interface ArchiveProgressListProps {
  progress: TeamProgress[];
}

/** Catalogue-completion cards for the favorite teams. */
export const ArchiveProgressList: React.FC<ArchiveProgressListProps> = ({
  progress,
}) => {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  if (progress.length === 0) return null;

  return (
    <View style={{ gap: spacing.gutter }}>
      {progress.map((teamProgress) => (
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
    </View>
  );
};

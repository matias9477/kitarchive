import React, { useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button";
import { OnboardingSlideView } from "@/components/onboarding/OnboardingSlideView";
import { PagerDots } from "@/components/onboarding/PagerDots";
import { ONBOARDING_SLIDES } from "@/features/onboarding/slides";
import { setOnboardingCompleted } from "@/features/settings/settingsService";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

/**
 * First-launch walkthrough: swipeable pitch of the domain model, shown until
 * the user finishes or skips it (flag persisted in the settings row).
 */
export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const isLast = pageIndex === ONBOARDING_SLIDES.length - 1;

  const finish = () => {
    // Persist best-effort; even if the write fails the user proceeds and the
    // flow simply shows again next launch.
    void setOnboardingCompleted(true).catch(() => {});
    navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
  };

  const next = () => {
    if (isLast) {
      finish();
      return;
    }
    listRef.current?.scrollToIndex({ index: pageIndex + 1, animated: true });
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    if (index !== pageIndex && index >= 0 && index < ONBOARDING_SLIDES.length)
      setPageIndex(index);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.topBar, { paddingHorizontal: spacing.screen }]}>
        <Pressable
          onPress={finish}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t("onboarding.skip")}
        >
          <AppText variant="titleSm" color={colors.onSurfaceVariant}>
            {t("onboarding.skip")}
          </AppText>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(slide) => slide.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={32}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        renderItem={({ item: slide }) => (
          <OnboardingSlideView slide={slide} width={width} />
        )}
      />

      <View
        style={{
          paddingHorizontal: spacing.screen,
          paddingBottom: spacing.md,
          gap: spacing.lg,
        }}
      >
        <PagerDots count={ONBOARDING_SLIDES.length} activeIndex={pageIndex} />
        <Button
          label={isLast ? t("onboarding.getStarted") : t("onboarding.next")}
          icon={isLast ? "checkmark" : "arrow-forward"}
          onPress={next}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { alignItems: "flex-end", paddingVertical: 8 },
});

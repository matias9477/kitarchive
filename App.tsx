import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
} from "@expo-google-fonts/sora";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
// Initialize i18next before any screen renders, and mount the language store so
// its persisted preference rehydrates and applies on launch.
import "@/i18n/index";
import { useLanguageStore } from "@/store/languageStore";
import { AppNavigator, navigationRef } from "@/navigation/AppNavigator";
import { initializeDatabase } from "@/db/client";
import { getOnboardingCompleted } from "@/features/settings/settingsService";
import { configureNotifications } from "@/utils/notifications";
import { syncWidget } from "@/lib/widget";

void navigationRef;

// Keep the native splash up until the first paint of real content.
SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Root component. Loads fonts and initializes the database (schema + catalogue
 * seed), notifications and onboarding state before rendering navigation.
 */
export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [fontsLoaded] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  // Re-mount the tree on language change so strings that live outside React
  // state (navigation titles) refresh too.
  const languagePreference = useLanguageStore((s) => s.language);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
        setOnboardingCompleted(await getOnboardingCompleted());
        await configureNotifications();
        void syncWidget();
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setIsInitialized(true);
      }
    };
    void init();
  }, []);

  if (!isInitialized || !fontsLoaded) return null;

  return (
    <AppReady
      key={languagePreference}
      onboardingCompleted={onboardingCompleted}
    />
  );
}

const AppReady: React.FC<{ onboardingCompleted: boolean }> = ({
  onboardingCompleted,
}) => {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <>
      <AppNavigator onboardingCompleted={onboardingCompleted} />
      {/* Dark-only app — status bar is always light-on-dark. */}
      <StatusBar style="light" />
    </>
  );
};

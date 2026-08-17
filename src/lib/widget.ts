import { requireOptionalNativeModule } from "expo";
import { getAllTeamKitCounts } from "@/features/stats/statsService";
import type { KitsWidgetProps } from "@/widgets/KitsWidget";

/**
 * expo-widgets touches its native module at import time, which throws in Expo
 * Go (and any build without the widget target) — and with Metro lazy bundling
 * that throw escapes a plain try/catch around require(). So the native module
 * is probed with requireOptionalNativeModule (null instead of throwing) BEFORE
 * any expo-widgets JS is loaded. Never import '@/widgets/KitsWidget' by value
 * from app code; go through syncWidget() instead.
 */

type WidgetHandle = typeof import("@/widgets/KitsWidget").default;

let unavailable = false;

const getWidget = (): WidgetHandle | null => {
  if (unavailable) return null;
  if (!requireOptionalNativeModule("ExpoWidgets")) {
    unavailable = true;
    console.warn("Home-screen widget unavailable (Expo Go?) — sync disabled.");
    return null;
  }
  try {
    return (require("@/widgets/KitsWidget") as { default: WidgetHandle })
      .default;
  } catch {
    unavailable = true;
    console.warn("Home-screen widget failed to load — sync disabled.");
    return null;
  }
};

/**
 * Pushes current per-team progress into the home-screen widget. Called after
 * every collection mutation and once on app start. The props type lives in
 * src/widgets/KitsWidget.tsx — change both together.
 */
export const syncWidget = async (): Promise<void> => {
  const widget = getWidget();
  if (!widget) return;
  try {
    const counts = await getAllTeamKitCounts();
    const props: KitsWidgetProps = {
      teams: counts.map((c) => ({
        id: c.teamId,
        name: c.teamName,
        ownedKits: c.ownedKits,
        totalKits: c.totalKits,
        ownedItems: c.ownedItems,
      })),
    };
    widget.updateSnapshot(props);
  } catch (error) {
    // Widget sync failures must never break the app.
    console.error("Failed to sync widget:", error);
  }
};

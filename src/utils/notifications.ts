import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

/** expo-notifications is unavailable in Expo Go — bail out gracefully. */
const isExpoGo = (): boolean => Constants.appOwnership === "expo";

/**
 * Configure notification handling + request permissions. Call once at startup.
 * Returns whether notifications are usable.
 */
export const configureNotifications = async (): Promise<boolean> => {
  if (isExpoGo()) return false;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === "granted";
};

export const cancelNotification = async (id: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(id);
};

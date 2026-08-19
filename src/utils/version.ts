import Constants from "expo-constants";

/**
 * App version from app.json (expo.version — the store marketing version,
 * bumped by expo-release), resolved through expo-constants at runtime so it
 * always matches the built binary's config.
 */
export const getAppVersion = (): string =>
  Constants.expoConfig?.version ?? "1.0.0";

/**
 * App version, read from package.json at bundle time (Metro resolves the
 * require). Falls back to app.json, then '1.0.0'.
 */
export const getAppVersion = (): string => {
  try {
    const packageJson = require("../../package.json");
    if (packageJson?.version) return packageJson.version;
  } catch {
    // fall through
  }
  try {
    const appJson = require("../../app.json");
    if (appJson?.expo?.version) return appJson.expo.version;
  } catch (error) {
    console.warn("Could not read version, using fallback:", error);
  }
  return "1.0.0";
};

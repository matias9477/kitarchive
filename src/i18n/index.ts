import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import type { LanguageCode } from "@/config/types";
import en from "./locales/en.json";
import es from "./locales/es.json";

/** Languages the app ships translations for. English is the fallback. */
export const SUPPORTED_LANGUAGES: readonly LanguageCode[] = [
  "en",
  "es",
] as const;

/** A stored preference: an explicit language, or 'system' (device locale). */
export type LanguagePreference = LanguageCode | "system";

/** Resolve a stored preference to a concrete supported language code. */
export const resolveLanguage = (
  preference: LanguagePreference,
): LanguageCode => {
  if (preference === "en" || preference === "es") return preference;
  const deviceCode = Localization.getLocales()[0]?.languageCode;
  return deviceCode === "es" ? "es" : "en";
};

/** BCP-47 tag for the active language, for Intl / native pickers. */
export const currentLocaleTag = (): string =>
  i18n.language === "es" ? "es-ES" : "en-US";

void i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources: { en: { translation: en }, es: { translation: es } },
  lng: resolveLanguage("system"),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;

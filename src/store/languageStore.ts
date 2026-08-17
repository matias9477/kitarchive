import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import i18n, { resolveLanguage, type LanguagePreference } from "@/i18n/index";

export interface LanguageState {
  /** An explicit language, or 'system' to follow the device locale. */
  language: LanguagePreference;
  setLanguage: (language: LanguagePreference) => void;
}

/** Language preference, persisted and kept in sync with i18next. */
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "system",
      setLanguage: (language) => {
        set({ language });
        void i18n.changeLanguage(resolveLanguage(language));
      },
    }),
    {
      name: "language-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // AsyncStorage hydrates async; push the stored preference into i18next
      // once it lands (init used the device locale).
      onRehydrateStorage: () => (state) => {
        if (state) void i18n.changeLanguage(resolveLanguage(state.language));
      },
    },
  ),
);

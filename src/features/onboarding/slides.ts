import type { Ionicons } from "@expo/vector-icons";

export interface OnboardingSlide {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  messageKey: string;
}

/**
 * First-launch pitch, one slide per pillar of the domain model:
 * catalogue what exists, track what you own, wish for what's missing.
 */
export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    key: "catalogue",
    icon: "albums-outline",
    titleKey: "onboarding.catalogueTitle",
    messageKey: "onboarding.catalogueMessage",
  },
  {
    key: "collection",
    icon: "shirt-outline",
    titleKey: "onboarding.collectionTitle",
    messageKey: "onboarding.collectionMessage",
  },
  {
    key: "wishlist",
    icon: "star-outline",
    titleKey: "onboarding.wishlistTitle",
    messageKey: "onboarding.wishlistMessage",
  },
];

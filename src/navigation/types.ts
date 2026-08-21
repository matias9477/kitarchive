export type TabParamList = {
  Home: undefined;
  Collection: undefined;
  /** Dummy tab — the raised center button; tapping opens the AddShirt modal. */
  AddTab: undefined;
  Explore: undefined;
  Wishlist: undefined;
};

import type { NavigatorScreenParams } from "@react-navigation/native";
import type { Confederation } from "@/db/seed/world";

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  /** First-launch walkthrough; initial route until the user completes it. */
  Onboarding: undefined;
  /** Team page: eras, kits, progress. With intent 'addItem' (set by the
   * add-shirt wizard), tapping a kit goes straight to ItemForm instead of
   * KitDetail, so the browse detour doesn't swallow the add flow. */
  TeamDetail: { teamId: string; intent?: "addItem" };
  /** Explore drill-down: one country's clubs or one confederation's nations. */
  ExploreGroup:
    | { kind: "country"; countryId: string }
    | { kind: "confederation"; confederation: Confederation | "other" };
  /** Catalogue kit page: reference images, owned items, wishlist state. */
  KitDetail: { kitId: string };
  /** Physical shirt page. */
  ItemDetail: { itemId: string };
  /** Add-shirt wizard step 1: find the catalogue kit (modal). */
  AddShirt: undefined;
  /** Bulk-register shirts: team → season → kit cascade + local queue (modal). */
  BulkAdd: undefined;
  /** Add/edit a physical shirt: kitId to create under a kit, itemId to edit. */
  ItemForm:
    | { kitId: string; itemId?: undefined }
    | { itemId: string; kitId?: undefined };
  /** Extend the catalogue with a new kit (and optionally team/era). */
  CreateKit: { teamId?: string; eraId?: string } | undefined;
  /** Pick a team's logo: bundled crest library or a custom photo (modal). */
  TeamLogoPicker: { teamId: string };
  /** Optional desired configuration for a wishlist entry. */
  WishlistConfig: { kitId: string };
  /** Pick an image from Google Images (modal WebView): kit reference image
   * (kitId) or collection-item photo (itemId). With autoSelect, the first
   * result is picked and saved automatically (manual picking as fallback). */
  WebImagePicker:
    | { kitId: string; itemId?: undefined; query: string; autoSelect?: boolean }
    | {
        itemId: string;
        kitId?: undefined;
        query: string;
        autoSelect?: boolean;
      };
  Search: undefined;
  Settings: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}

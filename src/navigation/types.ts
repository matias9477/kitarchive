export type TabParamList = {
  Home: undefined;
  Collection: undefined;
  /** Dummy tab — the raised center button; tapping opens the AddShirt modal. */
  AddTab: undefined;
  Explore: undefined;
  Wishlist: undefined;
};

import type { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  /** Team page: eras, kits, progress. */
  TeamDetail: { teamId: string };
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
  /** Optional desired configuration for a wishlist entry. */
  WishlistConfig: { kitId: string };
  /** Pick an image from Google Images (modal WebView): kit reference image
   * (kitId) or collection-item photo (itemId). */
  WebImagePicker:
    | { kitId: string; itemId?: undefined; query: string }
    | { itemId: string; kitId?: undefined; query: string };
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

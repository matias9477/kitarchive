export type TabParamList = {
  Home: undefined;
  Collection: undefined;
  /** Dummy tab — the raised center button; tapping opens the AddShirt modal. */
  AddTab: undefined;
  Explore: undefined;
  Wishlist: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  /** Team page: eras, kits, progress. */
  TeamDetail: { teamId: string };
  /** Catalogue kit page: reference images, owned items, wishlist state. */
  KitDetail: { kitId: string };
  /** Physical shirt page. */
  ItemDetail: { itemId: string };
  /** Add-shirt wizard step 1: find the catalogue kit (modal). */
  AddShirt: undefined;
  /** Add/edit a physical shirt: kitId to create under a kit, itemId to edit. */
  ItemForm:
    | { kitId: string; itemId?: undefined }
    | { itemId: string; kitId?: undefined };
  /** Extend the catalogue with a new kit (and optionally team/era). */
  CreateKit: { teamId?: string } | undefined;
  /** Optional desired configuration for a wishlist entry. */
  WishlistConfig: { kitId: string };
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

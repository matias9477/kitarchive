import React from "react";
import { Pressable } from "react-native";
import * as Linking from "expo-linking";
import {
  DarkTheme,
  NavigationContainer,
  createNavigationContainerRef,
  useNavigation,
  type LinkingOptions,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { fonts } from "@/theme/typography";
import { TeamDetailScreen } from "@/app/TeamDetailScreen";
import { KitDetailScreen } from "@/app/KitDetailScreen";
import { ItemDetailScreen } from "@/app/ItemDetailScreen";
import { AddShirtScreen } from "@/app/AddShirtScreen";
import { BulkAddScreen } from "@/app/BulkAddScreen";
import { ItemFormScreen } from "@/app/ItemFormScreen";
import { CreateKitScreen } from "@/app/CreateKitScreen";
import { WishlistConfigScreen } from "@/app/WishlistConfigScreen";
import { WebImagePickerScreen } from "@/app/WebImagePickerScreen";
import { SearchScreen } from "@/app/SearchScreen";
import { SettingsScreen } from "@/app/SettingsScreen";
import { TabNavigator } from "./TabNavigator";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root navigation ref — navigate from non-component code or from modals
 * mounted as siblings of the navigator.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL("/"), "kitarchive://"],
  config: {
    screens: {
      MainTabs: "",
      TeamDetail: "team/:teamId",
      KitDetail: "kit/:kitId",
      ItemDetail: "item/:itemId",
      AddShirt: "add",
      Search: "search",
      Settings: "settings",
    },
  },
};

/**
 * Explicit close button for modal screens — modals aren't part of the push
 * stack, so they get no automatic back button (and fullScreenModal can't be
 * swipe-dismissed either).
 */
const HeaderClose: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={() => navigation.goBack()}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={t("common.cancel")}
    >
      <Ionicons name="close" size={24} color={colors.onSurface} />
    </Pressable>
  );
};

const headerClose = () => <HeaderClose />;

type AppNavigatorProps = { onboardingCompleted: boolean };

export const AppNavigator: React.FC<AppNavigatorProps> = ({
  onboardingCompleted,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  // Onboarding is not scaffolded — gate the initial route here once you add it.
  void onboardingCompleted;

  const navTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: colors.secondary,
      background: colors.background,
      card: colors.surfaceContainerLowest,
      text: colors.onSurface,
      border: colors.outlineVariant,
    },
  };

  return (
    <NavigationContainer ref={navigationRef} linking={linking} theme={navTheme}>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerStyle: { backgroundColor: colors.surfaceContainerLowest },
          headerTintColor: colors.onSurface,
          headerTitleStyle: { fontFamily: fonts.soraSemiBold, fontSize: 17 },
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TeamDetail"
          component={TeamDetailScreen}
          options={{ title: "" }}
        />
        <Stack.Screen
          name="KitDetail"
          component={KitDetailScreen}
          options={{ title: "" }}
        />
        <Stack.Screen
          name="ItemDetail"
          component={ItemDetailScreen}
          options={{ title: t("itemDetail.title") }}
        />
        <Stack.Screen
          name="AddShirt"
          component={AddShirtScreen}
          options={{
            title: t("addShirt.title"),
            presentation: "fullScreenModal",
            headerLeft: headerClose,
          }}
        />
        <Stack.Screen
          name="BulkAdd"
          component={BulkAddScreen}
          options={{
            title: t("bulkAdd.title"),
            presentation: "modal",
            headerLeft: headerClose,
          }}
        />
        <Stack.Screen
          name="ItemForm"
          component={ItemFormScreen}
          options={{
            title: t("itemForm.title"),
            presentation: "modal",
            headerLeft: headerClose,
          }}
        />
        <Stack.Screen
          name="CreateKit"
          component={CreateKitScreen}
          options={{
            title: t("createKit.title"),
            presentation: "modal",
            headerLeft: headerClose,
          }}
        />
        <Stack.Screen
          name="WishlistConfig"
          component={WishlistConfigScreen}
          options={{
            title: t("wishlistConfig.title"),
            presentation: "modal",
            headerLeft: headerClose,
          }}
        />
        <Stack.Screen
          name="WebImagePicker"
          component={WebImagePickerScreen}
          options={{
            title: t("webImagePicker.title"),
            presentation: "modal",
            headerLeft: headerClose,
          }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ title: t("search.title") }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: t("settings.title") }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

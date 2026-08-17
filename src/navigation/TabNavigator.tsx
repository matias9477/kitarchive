import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { fonts } from "@/theme/typography";
import { HomeScreen } from "@/app/HomeScreen";
import { CollectionScreen } from "@/app/CollectionScreen";
import { ExploreScreen } from "@/app/ExploreScreen";
import { WishlistScreen } from "@/app/WishlistScreen";
import type { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

/** Placeholder for the center slot — never rendered; the button intercepts. */
const AddPlaceholder: React.FC = () => null;

/** Raised circular Add button in the center tab slot (DESIGN.md action blue). */
const AddButton: React.FC = () => {
  const { colors, radius } = useTheme();
  const navigation = useNavigation();
  return (
    <View style={styles.addSlot}>
      <Pressable
        onPress={() => navigation.navigate("AddShirt")}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.addButton,
          {
            backgroundColor: colors.secondaryContainer,
            borderRadius: radius.full,
            shadowColor: colors.secondaryContainer,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Ionicons name="add" size={30} color="#ffffff" />
      </Pressable>
    </View>
  );
};

export const TabNavigator: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLowest,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.outlineVariant,
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
        },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: { fontSize: 11, fontFamily: fonts.interMedium },
        tabBarIconStyle: { marginBottom: 2 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t("nav.home"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Collection"
        component={CollectionScreen}
        options={{
          tabBarLabel: t("nav.collection"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shirt-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AddTab"
        component={AddPlaceholder}
        options={{
          tabBarLabel: () => null,
          tabBarButton: () => <AddButton />,
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarLabel: t("nav.explore"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="albums-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarLabel: t("nav.wishlist"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  addSlot: { flex: 1, alignItems: "center", justifyContent: "center" },
  addButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -18,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});

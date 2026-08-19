import React from "react";
import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from "react-native";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";
import { COUNTRY_FLAGS } from "@/config/countryFlags";

const FLAGS: Record<string, ImageSourcePropType> = COUNTRY_FLAGS;

interface CountryFlagProps {
  countryId: string;
  countryName: string;
  /** Flag height in px; width follows a 3:2 ratio. */
  size?: number;
}

/** Small rounded flag, replacing the old emoji flags. */
export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryId,
  countryName,
  size = 14,
}) => {
  const { colors } = useTheme();
  const source = FLAGS[countryId];
  const frame = {
    width: size * 1.5,
    height: size,
    borderRadius: size / 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outlineVariant,
  };

  if (!source) {
    return (
      <View
        style={[
          styles.center,
          frame,
          { backgroundColor: colors.surfaceContainerHighest },
        ]}
      >
        <AppText
          variant="labelSm"
          color={colors.onSurfaceVariant}
          style={{ fontSize: size * 0.45, lineHeight: size * 0.6 }}
        >
          {countryName.trim().slice(0, 2).toUpperCase()}
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.clip, frame]}>
      <Image source={source} style={styles.image} resizeMode="cover" />
    </View>
  );
};

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
  center: { alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
});

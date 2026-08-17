import React from "react";
import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from "react-native";
import { useTheme } from "@/theme/index";
import { AppText } from "./AppText";

/**
 * Bundled flag art for the seed countries (public-domain PNGs from
 * flagcdn.com, w160). England has no ISO 3166-1 code, so the seed id "en"
 * maps to flagcdn's gb-eng (St George's Cross — never the Union Jack).
 * Countries created in-app fall back to an initials badge; to give one real
 * art, drop a w160 PNG into assets/flags and add it to this map.
 */
const FLAGS: Record<string, ImageSourcePropType> = {
  ar: require("../../../assets/flags/ar.png"),
  br: require("../../../assets/flags/br.png"),
  de: require("../../../assets/flags/de.png"),
  en: require("../../../assets/flags/gb-eng.png"),
  es: require("../../../assets/flags/es.png"),
  fr: require("../../../assets/flags/fr.png"),
  it: require("../../../assets/flags/it.png"),
  nl: require("../../../assets/flags/nl.png"),
  pt: require("../../../assets/flags/pt.png"),
  uy: require("../../../assets/flags/uy.png"),
};

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

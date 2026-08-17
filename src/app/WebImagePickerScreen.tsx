import React, { useState } from "react";
import { Alert, Image, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { WebView } from "react-native-webview";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { persistRemoteImage } from "@/lib/images";
import {
  WEB_IMAGE_CLICK_SCRIPT,
  googleImagesUrl,
  parseWebImageMessage,
  type WebImageSelection,
} from "@/lib/webImagePicker";
import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button";
import { useCatalogueStore } from "@/features/catalogue/catalogueStore";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "WebImagePicker">;

/**
 * Google Images inside a WebView: tapping any image selects it (the injected
 * script reports it here), and "Use this image" downloads it into app storage
 * and attaches it to the kit as a reference image.
 */
export const WebImagePickerScreen: React.FC<Props> = ({ route }) => {
  const { kitId, query } = route.params;
  const { colors, spacing, radius } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const addKitImage = useCatalogueStore((s) => s.addKitImage);
  const [selection, setSelection] = useState<WebImageSelection | null>(null);
  const [saving, setSaving] = useState(false);

  const useImage = async () => {
    if (!selection) return;
    setSaving(true);
    try {
      const uri = await persistRemoteImage(selection.src);
      await addKitImage(kitId, uri);
      navigation.goBack();
    } catch {
      setSaving(false);
      Alert.alert(t("webImagePicker.downloadFailed"));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <WebView
        source={{ uri: googleImagesUrl(query) }}
        injectedJavaScript={WEB_IMAGE_CLICK_SCRIPT}
        onMessage={(event) => {
          const parsed = parseWebImageMessage(event.nativeEvent.data);
          if (parsed) setSelection(parsed);
        }}
        style={styles.web}
      />
      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.surfaceContainerLowest,
            borderTopColor: colors.outlineVariant,
            padding: spacing.md,
            gap: spacing.sm,
          },
        ]}
      >
        {selection ? (
          <View style={[styles.preview, { gap: spacing.sm }]}>
            <Image
              source={{ uri: selection.src }}
              style={[styles.thumb, { borderRadius: radius.sm }]}
              resizeMode="cover"
            />
            <AppText
              variant="labelSm"
              color={colors.onSurfaceVariant}
              style={styles.previewText}
              numberOfLines={2}
            >
              {selection.width > 0
                ? `${selection.width} × ${selection.height}`
                : t("webImagePicker.selected")}
            </AppText>
          </View>
        ) : (
          <AppText variant="labelSm" color={colors.onSurfaceVariant}>
            {t("webImagePicker.hint")}
          </AppText>
        )}
        <Button
          label={t("webImagePicker.use")}
          icon="checkmark-outline"
          onPress={() => void useImage()}
          disabled={!selection}
          loading={saving}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  web: { flex: 1 },
  bar: { borderTopWidth: StyleSheet.hairlineWidth },
  preview: { flexDirection: "row", alignItems: "center" },
  thumb: { width: 48, height: 60 },
  previewText: { flex: 1 },
});

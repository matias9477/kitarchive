import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { WebView } from "react-native-webview";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { persistRemoteImage } from "@/lib/images";
import {
  WEB_IMAGE_AUTO_SCRIPT,
  WEB_IMAGE_CLICK_SCRIPT,
  googleImagesUrl,
  parseWebImageMessage,
  type WebImageSelection,
} from "@/lib/webImagePicker";
import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button";
import { useCatalogueStore } from "@/features/catalogue/catalogueStore";
import { useCollectionStore } from "@/features/collection/collectionStore";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "WebImagePicker">;

/** How long the auto-select flow may run before degrading to manual picking. */
const AUTO_SELECT_TIMEOUT_MS = 12_000;

/**
 * Google Images inside a WebView: tapping any image selects it (the injected
 * script reports it here), and "Use this image" downloads it into app storage
 * and attaches it as a kit reference image (kitId) or item photo (itemId).
 * With autoSelect, an extra injected script picks the first result and the
 * screen saves it and closes on its own; if nothing turns up in time, the
 * screen quietly becomes the regular manual picker.
 */
export const WebImagePickerScreen: React.FC<Props> = ({ route }) => {
  const { query } = route.params;
  const autoSelect = route.params.autoSelect === true;
  const { colors, spacing, radius } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const addKitImage = useCatalogueStore((s) => s.addKitImage);
  const addItemPhoto = useCollectionStore((s) => s.addPhoto);
  const [selection, setSelection] = useState<WebImageSelection | null>(null);
  const [saving, setSaving] = useState(false);
  const [autoPending, setAutoPending] = useState(autoSelect);

  useEffect(() => {
    if (!autoPending) return;
    const timer = setTimeout(() => setAutoPending(false), AUTO_SELECT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [autoPending]);

  const useImage = async (chosen: WebImageSelection | null) => {
    if (!chosen || saving) return;
    setSaving(true);
    try {
      const uri = await persistRemoteImage(chosen.src);
      if (route.params.itemId != null)
        await addItemPhoto({ itemId: route.params.itemId, uri });
      else await addKitImage(route.params.kitId, uri);
      navigation.goBack();
    } catch {
      setSaving(false);
      setAutoPending(false);
      Alert.alert(t("webImagePicker.downloadFailed"));
    }
  };

  const onMessage = (raw: string) => {
    const parsed = parseWebImageMessage(raw);
    if (!parsed) return;
    if (parsed.auto) {
      // Only honor the auto pick while we're still waiting for one.
      if (autoPending && !saving) {
        setSelection(parsed);
        void useImage(parsed);
      }
      return;
    }
    setSelection(parsed);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Block taps while auto-select drives the page, so the user and the
          injected script don't fight over Google's preview panel. */}
      <View style={styles.web} pointerEvents={autoPending ? "none" : "auto"}>
        <WebView
          source={{ uri: googleImagesUrl(query) }}
          injectedJavaScript={
            autoSelect
              ? WEB_IMAGE_CLICK_SCRIPT + WEB_IMAGE_AUTO_SCRIPT
              : WEB_IMAGE_CLICK_SCRIPT
          }
          onMessage={(event) => onMessage(event.nativeEvent.data)}
          style={styles.web}
        />
      </View>
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
        {autoPending ? (
          <View style={[styles.preview, { gap: spacing.sm }]}>
            <ActivityIndicator size="small" color={colors.secondary} />
            <AppText variant="labelSm" color={colors.onSurfaceVariant}>
              {t("webImagePicker.searching")}
            </AppText>
          </View>
        ) : selection ? (
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
        {autoPending ? null : (
          <Button
            label={t("webImagePicker.use")}
            icon="checkmark-outline"
            onPress={() => void useImage(selection)}
            disabled={!selection}
            loading={saving}
          />
        )}
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

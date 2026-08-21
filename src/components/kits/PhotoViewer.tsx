import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/index";
import { AppText } from "@/components/shared/AppText";
import type { HeroImage } from "./HeroGallery";

interface PhotoViewerProps {
  images: HeroImage[];
  /** Page to open on; null keeps the viewer closed. */
  index: number | null;
  onClose: () => void;
  /** Shows an ellipsis button that hands the current page back (e.g. to the
   * existing photo-options alert). */
  onOptions?: ((index: number) => void) | undefined;
  /** Accessibility label for the options button. */
  optionsLabel?: string | undefined;
}

/**
 * Fullscreen photo gallery: black background, paged swiping, pinch-to-zoom,
 * no vignette or metadata — just the pictures. Shared by kit and item detail.
 */
export const PhotoViewer: React.FC<PhotoViewerProps> = ({
  images,
  index,
  onClose,
  onOptions,
  optionsLabel,
}) => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const pagerRef = useRef<ScrollView>(null);

  const visible = index != null && images.length > 0;

  // Land on the tapped photo each time the viewer opens.
  useEffect(() => {
    if (index != null) setPage(Math.min(index, images.length - 1));
  }, [index, images.length]);

  if (!visible) return null;

  return (
    <Modal
      visible
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: page * width, y: 0 }}
          onMomentumScrollEnd={(event) =>
            setPage(Math.round(event.nativeEvent.contentOffset.x / width))
          }
        >
          {images.map((image) => (
            <ScrollView
              key={image.id}
              maximumZoomScale={4}
              minimumZoomScale={1}
              centerContent
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              style={{ width, height }}
            >
              <Image
                source={{ uri: image.uri }}
                style={{ width, height }}
                resizeMode="contain"
              />
            </ScrollView>
          ))}
        </ScrollView>

        <View
          style={[
            styles.header,
            { top: insets.top + spacing.xs, paddingHorizontal: spacing.screen },
          ]}
        >
          <Pressable
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("common.close")}
            style={styles.headerButton}
          >
            <Ionicons name="close" size={22} color={colors.onSurface} />
          </Pressable>
          {images.length > 1 ? (
            <AppText variant="labelSm" color={colors.onSurfaceVariant}>
              {Math.min(page, images.length - 1) + 1} / {images.length}
            </AppText>
          ) : null}
          {onOptions ? (
            <Pressable
              onPress={() => onOptions(Math.min(page, images.length - 1))}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={optionsLabel ?? t("common.edit")}
              style={styles.headerButton}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={22}
                color={colors.onSurface}
              />
            </Pressable>
          ) : (
            <View style={styles.headerButton} />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#000" },
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(11,15,16,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
});

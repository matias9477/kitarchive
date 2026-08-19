import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@/theme/index";
import { Chip } from "@/components/shared/Chip";
import { ImageOverlayShelf } from "./ImageOverlayShelf";
import { KitImageView } from "./KitImageView";
import { KitPlaceholder } from "./KitPlaceholder";

export interface HeroImage {
  id: string;
  uri: string;
}

export interface HeroGalleryHandle {
  /** Jump back to the first image (e.g. after changing the default). */
  resetToFirst: () => void;
}

interface HeroGalleryProps {
  images: HeroImage[];
  /** Shown when images is empty (e.g. an item falling back to its kit's
   * reference image) before giving up to the placeholder. */
  fallbackUri?: string | null;
  primaryColor: string;
  secondaryColor?: string | null;
  width: number;
  height: number;
  /** Small pills on the overlay shelf (era, kit type, manufacturer…). */
  overlayLabels: string[];
  overlayTitle: string;
  /** Chip label marking the first image when there are several. */
  defaultBadgeLabel: string;
  /** Optional chip pinned top-right (e.g. "Owned"). */
  badge?: React.ReactNode;
  onImagePress?: (index: number) => void;
  /** Makes the shelf title a link (e.g. to the team page). */
  onTitlePress?: (() => void) | undefined;
}

/**
 * The detail-screen hero: paged image carousel in a rounded container with
 * the identity shelf overlaid, page dots, and a "default" chip on the first
 * image. Shared by kit and item detail so both read the same (DESIGN.md
 * image treatment).
 */
export const HeroGallery = forwardRef<HeroGalleryHandle, HeroGalleryProps>(
  (
    {
      images,
      fallbackUri,
      primaryColor,
      secondaryColor,
      width,
      height,
      overlayLabels,
      overlayTitle,
      defaultBadgeLabel,
      badge,
      onImagePress,
      onTitlePress,
    },
    ref,
  ) => {
    const { colors, spacing, radius } = useTheme();
    const [page, setPage] = useState(0);
    const scrollRef = useRef<ScrollView>(null);

    useImperativeHandle(ref, () => ({
      resetToFirst: () => {
        scrollRef.current?.scrollTo({ x: 0, animated: false });
        setPage(0);
      },
    }));

    return (
      <View style={{ gap: spacing.sm }}>
        <View style={{ borderRadius: radius.xl, overflow: "hidden" }}>
          {images.length > 0 ? (
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) =>
                setPage(Math.round(event.nativeEvent.contentOffset.x / width))
              }
            >
              {images.map((image, index) => (
                <Pressable
                  key={image.id}
                  onPress={onImagePress ? () => onImagePress(index) : undefined}
                >
                  <KitImageView
                    uri={image.uri}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor ?? null}
                    style={{ width, height }}
                  />
                  {index === 0 && images.length > 1 ? (
                    <View style={styles.defaultBadge}>
                      <Chip
                        label={defaultBadgeLabel}
                        icon="image"
                        tone="goldSoft"
                      />
                    </View>
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>
          ) : fallbackUri ? (
            <KitImageView
              uri={fallbackUri}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor ?? null}
              style={{ width, height }}
            />
          ) : (
            <View style={{ width, height }}>
              <KitPlaceholder
                primaryColor={primaryColor}
                secondaryColor={secondaryColor ?? null}
              />
            </View>
          )}
          <ImageOverlayShelf
            labels={overlayLabels}
            title={overlayTitle}
            titleVariant="headline"
            onTitlePress={onTitlePress}
          />
          {badge ? (
            <View pointerEvents="none" style={styles.badge}>
              {badge}
            </View>
          ) : null}
        </View>
        {images.length > 1 ? (
          <View style={styles.dots}>
            {images.map((image, index) => (
              <View
                key={image.id}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === Math.min(page, images.length - 1)
                        ? colors.onSurface
                        : colors.outlineVariant,
                  },
                ]}
              />
            ))}
          </View>
        ) : null}
      </View>
    );
  },
);

HeroGallery.displayName = "HeroGallery";

const styles = StyleSheet.create({
  defaultBadge: { position: "absolute", top: 10, left: 10 },
  badge: { position: "absolute", top: 10, right: 10 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});

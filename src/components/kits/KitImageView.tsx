import React, { useState } from "react";
import {
  Image,
  View,
  type ImageResizeMode,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { KitPlaceholder } from "./KitPlaceholder";

interface KitImageViewProps {
  uri: string | null;
  primaryColor: string;
  secondaryColor?: string | null;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
}

/**
 * Kit/item image with the team-color placeholder as fallback — both when
 * there is no image and when the stored URI fails to load (e.g. the file was
 * removed outside the app). Always use this instead of a bare Image for
 * stored kit imagery.
 */
export const KitImageView: React.FC<KitImageViewProps> = ({
  uri,
  primaryColor,
  secondaryColor,
  style,
  resizeMode = "cover",
}) => {
  // Track the URI that failed so the error state self-resets when it changes.
  const [failedUri, setFailedUri] = useState<string | null>(null);

  if (!uri || uri === failedUri) {
    // overflow: clip the placeholder when the style carries a borderRadius.
    return (
      <View style={[style as StyleProp<ViewStyle>, { overflow: "hidden" }]}>
        <KitPlaceholder
          primaryColor={primaryColor}
          secondaryColor={secondaryColor ?? null}
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailedUri(uri)}
    />
  );
};

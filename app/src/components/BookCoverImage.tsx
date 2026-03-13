import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  type ImageResizeMode,
  type ImageStyle,
  type StyleProp,
} from 'react-native';
import type { BookDTO } from '../bridge/PersistenceBridge';
import { resolveCoverForDisplay } from '../domain/coverDisplay';

const PLACEHOLDER_SOURCE = require('../../assets/book-cover-placeholder.png');

export type BookCoverImageProps = {
  thumbnailUrl?: string | null;
  coverSource?: BookDTO['coverSource'];
  title?: string;
  testID?: string;
  placeholderTestID?: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  showPlaceholderTitle?: boolean;
};

export function BookCoverImage({
  thumbnailUrl,
  coverSource,
  title,
  testID,
  placeholderTestID,
  style,
  resizeMode = 'cover',
  showPlaceholderTitle = true,
}: BookCoverImageProps) {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const normalized = thumbnailUrl?.trim() ?? '';

  useEffect(() => {
    setImageLoadFailed(false);
  }, [normalized]);

  const cover = useMemo(
    () =>
      resolveCoverForDisplay({
        thumbnailUrl: normalized,
        coverSource,
        imageLoadFailed,
      }),
    [coverSource, imageLoadFailed, normalized]
  );

  if (cover.displayUri) {
    return (
      <Image
        testID={testID}
        source={{ uri: cover.displayUri }}
        style={[styles.cover, style]}
        resizeMode={resizeMode}
        onError={() => setImageLoadFailed(true)}
      />
    );
  }

  return (
    <ImageBackground
      testID={placeholderTestID ?? testID}
      source={PLACEHOLDER_SOURCE}
      style={[styles.cover, styles.placeholderCover, style]}
      imageStyle={styles.placeholderImage}
      resizeMode="cover"
    >
      <View style={styles.placeholderOverlay}>
        {showPlaceholderTitle && title?.trim() ? (
          <Text style={styles.placeholderTitle} numberOfLines={2}>
            {title}
          </Text>
        ) : null}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  cover: {
    backgroundColor: '#E5E7EB',
  },
  placeholderCover: {
    overflow: 'hidden',
  },
  placeholderImage: {
    opacity: 0.9,
  },
  placeholderOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 8,
    backgroundColor: 'rgba(28, 28, 28, 0.18)',
  },
  placeholderTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.22)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

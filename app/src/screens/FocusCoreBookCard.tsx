import React from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';

import type { BookDTO } from '../bridge/PersistenceBridge';
import { copy } from '../config/copy';
import { SessionCTAButton } from '../components/SessionCTAButton';

const AMBER = '#D48A3E';
const TEXT = '#2C2C2C';

type FocusCoreBookCardProps = {
  book: BookDTO | null;
  progressRatio: number | null;
  hasSelectedBook: boolean;
  canManualChange: boolean;
  showChangeBookAction: boolean;
  onPressChangeBook: () => void;
};

export function FocusCoreBookCard({
  book,
  progressRatio,
  hasSelectedBook,
  canManualChange,
  showChangeBookAction,
  onPressChangeBook,
}: FocusCoreBookCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.coverWrap}>
        {book?.thumbnailUrl ? (
          <Image source={{ uri: book.thumbnailUrl }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text style={styles.coverPlaceholderText} numberOfLines={3}>
              {book?.title ?? copy.focusCore.coverFallbackTitle}
            </Text>
          </View>
        )}
      </View>

      {progressRatio !== null ? (
        <View testID="focus-core-progress-track" style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progressRatio * 100)}%` }]} />
        </View>
      ) : null}

      {book?.title ? (
        <>
          <Text testID="focus-core-book-title" style={styles.bookTitle} numberOfLines={2}>
            {book.title}
          </Text>
          {book.author ? (
            <Text style={styles.bookAuthor} numberOfLines={1}>
              {book.author}
            </Text>
          ) : null}
        </>
      ) : null}

      {showChangeBookAction && hasSelectedBook && canManualChange ? (
        <View style={styles.changeBookButtonWrap}>
          <SessionCTAButton
            testID="focus-core-change-book"
            tone="ghost"
            label={copy.focusCore.changeBookLink}
            onPress={onPressChangeBook}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.06)',
    alignItems: 'center',
  },
  coverWrap: {
    width: 200,
    height: 267,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  cover: { width: '100%', height: '100%' },
  coverPlaceholder: {
    flex: 1,
    padding: 18,
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 138, 62, 0.10)',
  },
  coverPlaceholderText: { color: TEXT, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  progressTrack: {
    height: 4,
    width: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(212, 138, 62, 0.18)',
    overflow: 'hidden',
    marginTop: 14,
  },
  progressFill: { height: 4, backgroundColor: AMBER },
  bookTitle: { color: TEXT, fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  bookAuthor: { color: '#6B7280', fontSize: 13, marginTop: 6 },
  changeBookButtonWrap: {
    marginTop: 8,
  },
});

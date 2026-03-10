import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { copy } from '../config/copy';
import { persistenceBridge } from '../bridge/PersistenceBridge';

export function AddBookScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const t = title.trim();
    if (!t) return;
    const parsedPageCount = Number(pageCount);
    const normalizedPageCount =
      pageCount.trim().length > 0 && Number.isFinite(parsedPageCount) && parsedPageCount > 0
        ? Math.floor(parsedPageCount)
        : undefined;
    try {
      setSaving(true);
      await persistenceBridge.saveBook({
        id: `book_${Date.now()}`,
        title: t,
        author: author.trim() || undefined,
        pageCount: normalizedPageCount,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        format: 'paper',
        status: 'active',
      });
      setTitle('');
      setAuthor('');
      setPageCount('');
      setThumbnailUrl('');
      navigation.goBack();
    } catch (e) {
      Alert.alert('保存に失敗しました', e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.label}>{copy.addBook.labelTitle}</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder={copy.addBook.placeholderTitle}
        placeholderTextColor="#666"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={styles.label}>{copy.addBook.labelAuthorOptional}</Text>
      <TextInput
        style={styles.input}
        value={author}
        onChangeText={setAuthor}
        placeholder={copy.addBook.placeholderAuthor}
        placeholderTextColor="#666"
        autoCapitalize="none"
      />
      <Text style={styles.label}>{copy.addBook.labelPageCountOptional}</Text>
      <TextInput
        style={styles.input}
        value={pageCount}
        onChangeText={setPageCount}
        placeholder={copy.addBook.placeholderPageCount}
        placeholderTextColor="#9CA3AF"
        keyboardType="numeric"
      />
      <Text style={styles.optionalLabel}>{copy.addBook.labelCoverUrlOptional}</Text>
      <TextInput
        style={styles.input}
        value={thumbnailUrl}
        onChangeText={setThumbnailUrl}
        placeholder={copy.addBook.placeholderCoverUrl}
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={[styles.cta, (!title.trim() || saving) && styles.ctaDisabled]}
        onPress={onSave}
        disabled={!title.trim() || saving}
      >
        <Text style={styles.ctaText}>{copy.addBook.ctaAddAndBack}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FDFCF8',
  },
  label: {
    color: '#4B5563',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 8,
  },
  optionalLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.12)',
    borderRadius: 10,
    padding: 14,
    color: '#2C2C2C',
    fontSize: 16,
    marginBottom: 8,
  },
  cta: {
    backgroundColor: '#D48A3E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  ctaDisabled: { backgroundColor: '#B8B8B8', opacity: 0.8 },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});

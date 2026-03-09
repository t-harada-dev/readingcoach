import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../context';

export function AddBookScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { addBook } = useApp();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const t = title.trim();
    if (!t) return;
    setSaving(true);
    await addBook(t, author.trim() || undefined);
    setSaving(false);
    setTitle('');
    setAuthor('');
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.label}>タイトル</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="本のタイトル"
        placeholderTextColor="#666"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={styles.label}>著者（任意）</Text>
      <TextInput
        style={styles.input}
        value={author}
        onChangeText={setAuthor}
        placeholder="著者名"
        placeholderTextColor="#666"
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={[styles.cta, (!title.trim() || saving) && styles.ctaDisabled]}
        onPress={onSave}
        disabled={!title.trim() || saving}
      >
        <Text style={styles.ctaText}>追加して戻る</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
  },
  label: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  cta: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  ctaDisabled: { backgroundColor: '#333', opacity: 0.7 },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});

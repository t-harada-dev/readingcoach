import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type Tone = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: Tone;
  testID?: string;
};

export function SessionCTAButton({ label, onPress, disabled = false, tone = 'primary', testID }: Props) {
  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.base, tone === 'primary' ? styles.primary : tone === 'secondary' ? styles.secondary : styles.ghost, disabled ? styles.disabled : null]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.label, tone === 'primary' ? styles.primaryLabel : styles.secondaryLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primary: {
    backgroundColor: '#D48A3E',
  },
  secondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(44,44,44,0.12)',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryLabel: {
    color: '#FFFFFF',
  },
  secondaryLabel: {
    color: '#2C2C2C',
  },
});

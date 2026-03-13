import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { appTheme } from '../theme/layout';

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
    borderRadius: appTheme.borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: appTheme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primary: {
    backgroundColor: appTheme.colors.accent,
  },
  secondary: {
    backgroundColor: appTheme.colors.surface,
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
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
    color: appTheme.colors.textInverse,
  },
  secondaryLabel: {
    color: appTheme.colors.textPrimary,
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SessionCTAButton } from '../components/SessionCTAButton';
import { sessionModeLabel } from '../config/copy';
import type { SessionMode } from '../useCases/StartSessionUseCase';

type FocusCorePendingSectionProps = {
  mainMode: SessionMode;
  subMode: SessionMode | null;
  rehabMode: SessionMode | null;
  startingMode: SessionMode | null;
  ctaDisabled: boolean;
  onPressPrimaryCTA: () => void;
  onPressSecondaryCTA: () => void;
  onPressRehabCTA: () => void;
};

export function FocusCorePendingSection({
  mainMode,
  subMode,
  rehabMode,
  startingMode,
  ctaDisabled,
  onPressPrimaryCTA,
  onPressSecondaryCTA,
  onPressRehabCTA,
}: FocusCorePendingSectionProps) {
  return (
    <>
      <View style={startingMode ? styles.disabled : null}>
        <SessionCTAButton
          testID="focus-core-primary-cta"
          tone="primary"
          label={sessionModeLabel(mainMode)}
          onPress={onPressPrimaryCTA}
          disabled={ctaDisabled}
        />
      </View>
      {subMode ? (
        <View style={startingMode ? styles.disabled : null}>
          <SessionCTAButton
            testID="focus-core-secondary-cta"
            tone="secondary"
            label={sessionModeLabel(subMode)}
            onPress={onPressSecondaryCTA}
            disabled={ctaDisabled}
          />
        </View>
      ) : null}
      {rehabMode ? (
        <View style={startingMode ? styles.disabled : null}>
          <SessionCTAButton
            testID="focus-core-rehab-cta"
            tone="secondary"
            label={sessionModeLabel(rehabMode)}
            onPress={onPressRehabCTA}
            disabled={ctaDisabled}
          />
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  disabled: { opacity: 0.6 },
});

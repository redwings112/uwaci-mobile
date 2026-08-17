import { Image, StyleSheet, View } from 'react-native';

const wavesImage = require('../../../../assets/onboarding/waves-main.png');
const wavesBaseImage = require('../../../../assets/onboarding/waves-base.png');

export function WaveBackdrop() {
  return (
    <View testID="wave-backdrop" pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={wavesImage}
        accessibilityElementsHidden
        style={{ ...StyleSheet.absoluteFill, top: '25%' }}
      />
      <Image
        source={wavesBaseImage}
        accessibilityElementsHidden
        style={{ ...StyleSheet.absoluteFill, top: '50%' }}
      />
    </View>
  );
}

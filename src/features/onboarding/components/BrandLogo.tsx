import { Image } from 'react-native';

const logoImage = require('../../../../assets/onboarding/logo.png');

interface BrandLogoProps {
  width: number;
}

export function BrandLogo({ width }: BrandLogoProps) {
  return (
    <Image
      testID="brand-logo"
      source={logoImage}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="Uwaci. Knowledge for humanity."
      style={{ width, height: width }}
    />
  );
}

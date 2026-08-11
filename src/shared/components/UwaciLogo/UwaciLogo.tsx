import { Image, Text, View } from 'react-native';

interface UwaciLogoProps {
  dark?: boolean;
  compact?: boolean;
}

export function UwaciLogo({ dark = false, compact = false }: UwaciLogoProps) {
  return (
    <View className="flex-row items-center gap-2" accessible accessibilityLabel="Uwaci">
      <Image
        className={compact ? 'h-9 w-9' : 'h-14 w-14'}
        resizeMode="contain"
        source={require('../../../../assets/logo.png')}
      />
      <Text
        className={`${compact ? 'text-lg' : 'text-2xl'} font-semibold ${dark ? 'text-white' : 'text-ink dark:text-white'}`}
      >
        Uwaci
      </Text>
    </View>
  );
}

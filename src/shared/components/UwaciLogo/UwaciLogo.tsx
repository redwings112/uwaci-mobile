import { Text, View } from 'react-native';

interface UwaciLogoProps {
  dark?: boolean;
  compact?: boolean;
}

export function UwaciLogo({ dark = false, compact = false }: UwaciLogoProps) {
  return (
    <View className="flex-row items-center" accessible accessibilityLabel="Uwaci">
      <View className={`${compact ? 'h-7 w-7' : 'h-10 w-10'} relative items-center justify-center`}>
        <View
          className={`${compact ? 'h-5 w-3' : 'h-7 w-4'} absolute left-1 rounded-b-full border-b-4 border-l-4 border-brand`}
        />
        <View
          className={`${compact ? 'h-5 w-3' : 'h-7 w-4'} absolute right-1 rounded-b-full border-b-4 border-r-4 border-violet`}
        />
        <View
          className={`${compact ? 'h-2 w-2' : 'h-3 w-3'} absolute -top-0.5 rounded-full bg-accent`}
        />
      </View>
      <Text
        className={`${compact ? 'text-base' : 'text-2xl'} font-semibold ${dark ? 'text-white' : 'text-ink dark:text-white'}`}
      >
        Uwaci
      </Text>
    </View>
  );
}

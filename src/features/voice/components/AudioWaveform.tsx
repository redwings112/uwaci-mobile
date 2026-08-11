import { View } from 'react-native';

export function AudioWaveform({ active, level = 0 }: { active: boolean; level?: number }) {
  const heights = [12, 24, 38, 20, 44, 30, 16, 34, 22, 12];
  return (
    <View className="h-12 flex-row items-center justify-center gap-1" accessible={false}>
      {heights.map((height, index) => (
        <View
          key={`${height}-${index}`}
          className={`w-1 rounded-full ${active ? 'bg-danger' : 'bg-border'}`}
          style={{ height: active ? Math.max(8, height * (0.2 + level * 0.8)) : 8 }}
        />
      ))}
    </View>
  );
}

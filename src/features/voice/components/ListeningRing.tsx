import Svg, { Circle, Line } from 'react-native-svg';

import { colors } from '@/theme/tokens';

interface ListeningRingProps {
  size: number;
  audioLevel: number;
  active: boolean;
}

const TICK_COUNT = 72;

export function ListeningRing({ size, audioLevel, active }: ListeningRingProps) {
  const center = size / 2;
  const innerRadius = size * 0.35;
  const level = Math.max(0, Math.min(1, audioLevel));

  return (
    <Svg width={size} height={size} pointerEvents="none">
      {Array.from({ length: TICK_COUNT }, (_, index) => {
        const angle = (index / TICK_COUNT) * Math.PI * 2 - Math.PI / 2;
        const wave = 0.86 + 0.14 * Math.sin(index * 1.7);
        const reach = wave * (active ? 12 + level * 10 : 10);
        const outerRadius = innerRadius + reach;
        return (
          <Line
            key={index}
            x1={center + Math.cos(angle) * innerRadius}
            y1={center + Math.sin(angle) * innerRadius}
            x2={center + Math.cos(angle) * outerRadius}
            y2={center + Math.sin(angle) * outerRadius}
            stroke={index % 2 === 0 ? colors.brand : colors.violet}
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={active ? 0.8 : 0.4}
          />
        );
      })}
      <Circle
        cx={center}
        cy={center}
        r={innerRadius + 26}
        stroke={colors.brand}
        strokeWidth={1}
        strokeDasharray="1 5"
        opacity={0.45}
        fill="none"
      />
      <Circle cx={center} cy={12} r={9} fill={colors.accent} opacity={0.25} />
      <Circle cx={center} cy={12} r={5} fill={colors.accent} />
    </Svg>
  );
}

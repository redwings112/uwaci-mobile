import type { ReactNode } from 'react';
import { Text, useColorScheme, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import Svg, { Line } from 'react-native-svg';
import { colors } from '@/theme/tokens';

function mixHex(from: string, to: string, ratio: number): string {
  const parse = (value: string): [number, number, number] => [
    parseInt(value.slice(1, 3), 16),
    parseInt(value.slice(3, 5), 16),
    parseInt(value.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(from);
  const [r2, g2, b2] = parse(to);
  const channel = (a: number, b: number) =>
    Math.round(a + (b - a) * ratio)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r1, r2)}${channel(g1, g2)}${channel(b1, b2)}`;
}

const light = {
  text: '#15142C',
  muted: '#5F6072',
  border: '#DDE3DD',
  surface: '#F7F8F3',
  brand: colors.brand,
};

const stepStart = colors.violet;
const stepEnd = colors.cyan;

const dark = {
  text: '#FFFFFF',
  muted: '#C7C5D5',
  border: '#3B3854',
  surface: '#24213F',
  brand: '#8FD3B1',
};

export function MarkdownMessage({
  content,
  dashed = false,
}: {
  content: string;
  dashed?: boolean;
}) {
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? dark : light;
  const rules = {
    ordered_list: (node: { key: string }, children: ReactNode[]) => (
      <View key={node.key} className="mb-3 mt-1">
        {children.map((child, index) => {
          const ratio = children.length > 1 ? index / (children.length - 1) : 0;
          const stepColor = mixHex(stepStart, stepEnd, ratio);
          return (
            <View key={index} className="flex-row">
              <View className="w-9 items-center">
                <View
                  className="h-7 w-7 items-center justify-center rounded-full"
                  style={{ backgroundColor: stepColor }}
                >
                  <Text className="text-xs font-bold text-white">{index + 1}</Text>
                </View>
                {index < children.length - 1 ? (
                  dashed ? (
                    <View className="w-0.5 flex-1">
                      <Svg width="2" height="100%">
                        <Line
                          x1="1"
                          y1="0"
                          x2="1"
                          y2="100%"
                          stroke={stepColor}
                          strokeWidth="2"
                          strokeDasharray="5 5"
                        />
                      </Svg>
                    </View>
                  ) : (
                    <View className="w-0.5 flex-1" style={{ backgroundColor: stepColor }} />
                  )
                ) : null}
              </View>
              <View className="flex-1 pb-3 pl-1">{child}</View>
            </View>
          );
        })}
      </View>
    ),
    list_item: (node: { key: string }, children: ReactNode[], parent: { type: string }[]) =>
      parent?.[0]?.type === 'ordered_list' ? (
        <View key={node.key}>{children}</View>
      ) : (
        <View key={node.key} className="mb-1.5 flex-row">
          <Text style={{ color: palette.brand }}>{'•  '}</Text>
          <View className="flex-1">{children}</View>
        </View>
      ),
  };
  return (
    <Markdown
      rules={rules}
      style={{
        body: { color: palette.text, fontSize: 15, lineHeight: 23 },
        paragraph: { marginBottom: 10, marginTop: 0 },
        heading1: { color: palette.text, fontSize: 22, fontWeight: '700', marginBottom: 10 },
        heading2: { color: palette.text, fontSize: 19, fontWeight: '700', marginBottom: 8 },
        heading3: { color: palette.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
        strong: { color: palette.text, fontWeight: '700' },
        em: { color: palette.text, fontStyle: 'italic' },
        bullet_list: { marginBottom: 10 },
        ordered_list: { marginBottom: 10 },
        list_item: { marginBottom: 6 },
        bullet_list_icon: { color: palette.brand, marginRight: 8 },
        ordered_list_icon: { color: palette.brand, marginRight: 8 },
        blockquote: {
          backgroundColor: palette.surface,
          borderLeftColor: palette.brand,
          borderLeftWidth: 4,
          color: palette.muted,
          marginVertical: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
        },
        code_inline: {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          borderRadius: 4,
          borderWidth: 1,
          color: palette.text,
          fontFamily: 'monospace',
          paddingHorizontal: 4,
        },
        code_block: {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          borderRadius: 8,
          borderWidth: 1,
          color: palette.text,
          fontFamily: 'monospace',
          padding: 12,
        },
        fence: {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          borderRadius: 8,
          borderWidth: 1,
          color: palette.text,
          fontFamily: 'monospace',
          padding: 12,
        },
        link: { color: palette.brand, textDecorationLine: 'underline' },
        hr: { backgroundColor: palette.border, height: 1, marginVertical: 12 },
        table: { borderColor: palette.border, borderWidth: 1 },
        th: { backgroundColor: palette.surface, padding: 6 },
        td: { borderColor: palette.border, padding: 6 },
      }}
    >
      {content}
    </Markdown>
  );
}

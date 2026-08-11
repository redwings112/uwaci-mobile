import { useColorScheme } from 'react-native';
import Markdown from 'react-native-markdown-display';

const light = {
  text: '#15142C',
  muted: '#5F6072',
  border: '#DDE3DD',
  surface: '#F7F8F3',
  brand: '#215C45',
};

const dark = {
  text: '#FFFFFF',
  muted: '#C7C5D5',
  border: '#3B3854',
  surface: '#24213F',
  brand: '#8FD3B1',
};

export function MarkdownMessage({ content }: { content: string }) {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? dark : light;
  return (
    <Markdown
      style={{
        body: { color: colors.text, fontSize: 15, lineHeight: 23 },
        paragraph: { marginBottom: 10, marginTop: 0 },
        heading1: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 10 },
        heading2: { color: colors.text, fontSize: 19, fontWeight: '700', marginBottom: 8 },
        heading3: { color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
        strong: { color: colors.text, fontWeight: '700' },
        em: { color: colors.text, fontStyle: 'italic' },
        bullet_list: { marginBottom: 10 },
        ordered_list: { marginBottom: 10 },
        list_item: { marginBottom: 6 },
        bullet_list_icon: { color: colors.brand, marginRight: 8 },
        ordered_list_icon: { color: colors.brand, marginRight: 8 },
        blockquote: {
          backgroundColor: colors.surface,
          borderLeftColor: colors.brand,
          borderLeftWidth: 4,
          color: colors.muted,
          marginVertical: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
        },
        code_inline: {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: 4,
          borderWidth: 1,
          color: colors.text,
          fontFamily: 'monospace',
          paddingHorizontal: 4,
        },
        code_block: {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: 8,
          borderWidth: 1,
          color: colors.text,
          fontFamily: 'monospace',
          padding: 12,
        },
        fence: {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: 8,
          borderWidth: 1,
          color: colors.text,
          fontFamily: 'monospace',
          padding: 12,
        },
        link: { color: colors.brand, textDecorationLine: 'underline' },
        hr: { backgroundColor: colors.border, height: 1, marginVertical: 12 },
        table: { borderColor: colors.border, borderWidth: 1 },
        th: { backgroundColor: colors.surface, padding: 6 },
        td: { borderColor: colors.border, padding: 6 },
      }}
    >
      {content}
    </Markdown>
  );
}

interface HeadingCueSet {
  title: string;
  section: string;
  subsection: string;
}

const headingCues: Record<string, HeadingCueSet> = {
  en: { title: 'Title', section: 'Section', subsection: 'Subsection' },
  fr: { title: 'Titre', section: 'Section', subsection: 'Sous-section' },
  sw: { title: 'Kichwa', section: 'Sehemu', subsection: 'Sehemu ndogo' },
};

function decodeCommonEntities(value: string): string {
  return value
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', ' less than ')
    .replaceAll('&gt;', ' greater than ')
    .replaceAll('&quot;', '')
    .replaceAll('&#39;', "'");
}

function stripInlineMarkdown(value: string): string {
  return decodeCommonEntities(value)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)]\[[^\]]*]/g, '$1')
    .replace(/<https?:\/\/[^>]+>/gi, '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/(`{1,2})(.*?)\1/g, '$2')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(^|[^\w])([*_])([^\n]+?)\2(?=$|[^\w])/g, '$1$3')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/\\([\\`*{}[\]()#+\-.!_>])/g, '$1')
    .replace(/[“”„‟"]+/g, '')
    .replace(/[‘’]/g, "'")
    .replace(/\s+[—–]\s+/g, ', ')
    .replace(/\s+-\s+/g, ', ')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function withSentencePause(value: string): string {
  if (!value) return '';
  return /[.!?…:]$/.test(value) ? value : `${value}.`;
}

/**
 * Converts rendered-answer Markdown into natural text for a speech engine.
 * The visual message keeps its Markdown; only the TTS input is transformed.
 */
export function prepareTextForSpeech(markdown: string, language?: string): string {
  const locale = language?.toLowerCase().split('-', 1)[0] ?? 'en';
  const cues = headingCues[locale];
  const spokenBlocks: string[] = [];
  let firstHeadingLevel: number | null = null;
  let headingCount = 0;
  let inCodeFence = false;

  for (const rawLine of markdown.replace(/\r\n?/g, '\n').split('\n')) {
    const line = rawLine.trim();
    if (/^(```|~~~)/.test(line)) {
      inCodeFence = !inCodeFence;
      continue;
    }
    // Raw source code is usually unintelligible through TTS. It remains visible on screen.
    if (inCodeFence || !line || /^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) continue;

    const heading = /^(#{1,6})\s*(.*?)\s*#*$/.exec(line);
    if (heading) {
      const level = heading[1]!.length;
      const text = withSentencePause(stripInlineMarkdown(heading[2] ?? ''));
      if (!text) continue;
      if (firstHeadingLevel === null) firstHeadingLevel = level;
      let cue = '';
      if (cues) {
        if (headingCount === 0 && spokenBlocks.length === 0) cue = cues.title;
        else if (headingCount === 0) cue = cues.section;
        else cue = level > firstHeadingLevel ? cues.subsection : cues.section;
      }
      spokenBlocks.push(cue ? `${cue}. ${text}` : text);
      headingCount += 1;
      continue;
    }

    if (/^\|?\s*:?-{3,}/.test(line)) continue;
    const tableText = line.includes('|')
      ? line
          .split('|')
          .map((cell) => stripInlineMarkdown(cell))
          .filter(Boolean)
          .join('. ')
      : line;
    const withoutBlockSyntax = tableText
      .replace(/^>+\s*/, '')
      .replace(/^[-+*]\s+/, '')
      .replace(/^(\d+)[.)]\s+/, '$1. ');
    const text = withSentencePause(stripInlineMarkdown(withoutBlockSyntax));
    if (text) spokenBlocks.push(text);
  }

  return spokenBlocks
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

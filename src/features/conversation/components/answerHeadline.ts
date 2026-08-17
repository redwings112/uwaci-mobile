export interface SplitAnswer {
  headline: string | null;
  body: string;
}

const MAX_HEADLINE_LENGTH = 180;

export function splitAnswerHeadline(content: string): SplitAnswer {
  const trimmed = content.trim();
  if (!trimmed) return { headline: null, body: content };

  const firstBlock = trimmed.split(/\n\s*\n/)[0]?.trim() ?? '';
  const startsWithMarkup = /^([#>*\-+`|]|\d+[.)])/.test(firstBlock);
  if (!firstBlock || startsWithMarkup) return { headline: null, body: content };

  const sentenceEnd = firstBlock.search(/[.!?](\s|$)/);
  const headline = sentenceEnd === -1 ? firstBlock : firstBlock.slice(0, sentenceEnd + 1).trimEnd();

  if (!headline || headline.length > MAX_HEADLINE_LENGTH) return { headline: null, body: content };

  const remainder = trimmed.slice(trimmed.indexOf(headline) + headline.length).trimStart();
  if (!remainder) return { headline: null, body: content };

  return { headline, body: remainder };
}

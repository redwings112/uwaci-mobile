import type { UwaciLanguageCode } from '@/core/constants/languages';

const thinkingPrompts: Record<UwaciLanguageCode, readonly string[]> = {
  en: ['let me think.', 'Give me a second.', "I'm working that out for you."],
  fr: ['laissez-moi réfléchir.', 'Donnez-moi une seconde.', "J'y réfléchis pour vous."],
  ln: ['tika nakanisa.', 'Pesa ngai mwa ntango.', 'Nazali koluka eyano malamu.'],
  sw: ['ngoja nifikirie.', 'Nipe sekunde moja.', 'Ninakutafutia jibu zuri.'],
};

export function getThinkingPrompt(language: UwaciLanguageCode, turn: number): string {
  const prompts = thinkingPrompts[language];
  return prompts[turn % prompts.length]!;
}

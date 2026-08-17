import type { UwaciLanguageCode } from '@/core/constants/languages';

import type { VoiceThinkingStage } from './types';

const stagePrompts: Record<UwaciLanguageCode, Record<VoiceThinkingStage, string>> = {
  en: { transcribing: 'Understanding what you said…', reasoning: 'Preparing your answer…' },
  fr: { transcribing: 'Compréhension de ta demande…', reasoning: 'Préparation de ta réponse…' },
  ln: { transcribing: 'Nazali koyoka maloba na yo…', reasoning: 'Nazali kobongisa eyano…' },
  sw: { transcribing: 'Ninaelewa ulichosema…', reasoning: 'Ninaandaa jibu lako…' },
};

/** Visual status copy driven by a backend stage event. It is never spoken as filler. */
export function getThinkingPrompt(language: UwaciLanguageCode, stage: VoiceThinkingStage): string {
  return stagePrompts[language][stage];
}

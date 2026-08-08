import type { RootState } from '@/store';

export const selectPreferredLanguage = (state: RootState) =>
  state.language.preferredConversationLanguage;
export const selectUiLanguage = (state: RootState) => state.language.uiLanguage;

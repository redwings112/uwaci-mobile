import type { RootState } from '@/store';

export const selectConversationMessages = (state: RootState) => state.conversation.messages;
export const selectActiveConversationId = (state: RootState) =>
  state.conversation.activeConversationId;
export const selectConversationRequest = (state: RootState) => ({
  status: state.conversation.requestStatus,
  errorMessage: state.conversation.errorMessage,
});

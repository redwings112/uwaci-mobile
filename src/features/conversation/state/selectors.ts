import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@/store';

export const selectConversationMessages = (state: RootState) => state.conversation.messages;
export const selectActiveConversationId = (state: RootState) =>
  state.conversation.activeConversationId;
const selectConversationRequestStatus = (state: RootState) => state.conversation.requestStatus;
const selectConversationErrorMessage = (state: RootState) => state.conversation.errorMessage;

export const selectConversationRequest = createSelector(
  [selectConversationRequestStatus, selectConversationErrorMessage],
  (status, errorMessage) => ({ status, errorMessage }),
);

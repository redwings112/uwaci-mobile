import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ConversationMessage } from '../types';

interface ConversationState {
  activeConversationId: string | null;
  messages: ConversationMessage[];
  requestStatus: 'idle' | 'sending' | 'error';
  errorMessage: string | null;
}

const initialState: ConversationState = {
  activeConversationId: null,
  messages: [],
  requestStatus: 'idle',
  errorMessage: null,
};

// The backend remains the durable history. Keeping only the latest turns in Redux
// prevents voice sessions from growing until React Native runs out of memory.
export const MAX_IN_MEMORY_MESSAGES = 100;

function trimMessages(messages: ConversationMessage[]): void {
  if (messages.length > MAX_IN_MEMORY_MESSAGES)
    messages.splice(0, messages.length - MAX_IN_MEMORY_MESSAGES);
}

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    conversationOpened: (state, action: PayloadAction<string>) => {
      state.activeConversationId = action.payload;
      state.errorMessage = null;
    },
    conversationLoaded: (state, action: PayloadAction<ConversationMessage[]>) => {
      state.messages = action.payload.slice(-MAX_IN_MEMORY_MESSAGES);
      state.requestStatus = 'idle';
    },
    messageAdded: (state, action: PayloadAction<ConversationMessage>) => {
      if (!state.messages.some((message) => message.id === action.payload.id))
        state.messages.push(action.payload);
      trimMessages(state.messages);
    },
    messageReconciled: (
      state,
      action: PayloadAction<{ optimisticId: string; message: ConversationMessage }>,
    ) => {
      const index = state.messages.findIndex(
        (message) => message.id === action.payload.optimisticId,
      );
      if (index >= 0) state.messages[index] = action.payload.message;
      else if (!state.messages.some((message) => message.id === action.payload.message.id))
        state.messages.push(action.payload.message);
      trimMessages(state.messages);
    },
    requestStarted: (state) => {
      state.requestStatus = 'sending';
      state.errorMessage = null;
    },
    requestFailed: (state, action: PayloadAction<string>) => {
      state.requestStatus = 'error';
      state.errorMessage = action.payload;
    },
    requestFinished: (state) => {
      state.requestStatus = 'idle';
    },
    requestErrorCleared: (state) => {
      state.errorMessage = null;
      if (state.requestStatus === 'error') state.requestStatus = 'idle';
    },
    conversationReset: () => initialState,
  },
});

export const {
  conversationLoaded,
  conversationOpened,
  conversationReset,
  messageAdded,
  messageReconciled,
  requestErrorCleared,
  requestFailed,
  requestFinished,
  requestStarted,
} = conversationSlice.actions;
export const conversationReducer = conversationSlice.reducer;

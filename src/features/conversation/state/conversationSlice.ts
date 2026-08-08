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

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    conversationOpened: (state, action: PayloadAction<string>) => {
      state.activeConversationId = action.payload;
      state.errorMessage = null;
    },
    conversationLoaded: (state, action: PayloadAction<ConversationMessage[]>) => {
      state.messages = action.payload;
      state.requestStatus = 'idle';
    },
    messageAdded: (state, action: PayloadAction<ConversationMessage>) => {
      if (!state.messages.some((message) => message.id === action.payload.id))
        state.messages.push(action.payload);
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
    conversationReset: () => initialState,
  },
});

export const {
  conversationLoaded,
  conversationOpened,
  conversationReset,
  messageAdded,
  requestFailed,
  requestFinished,
  requestStarted,
} = conversationSlice.actions;
export const conversationReducer = conversationSlice.reducer;

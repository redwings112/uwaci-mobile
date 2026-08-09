import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AuthState } from '@/core/auth/authTypes';

const initialState: AuthState = { status: 'unknown', userId: null, errorMessage: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionResolved: (state, action: PayloadAction<{ userId: string | null }>) => {
      state.status = action.payload.userId ? 'authenticated' : 'anonymous';
      state.userId = action.payload.userId;
      state.errorMessage = null;
    },
    sessionFailed: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.userId = null;
      state.errorMessage = action.payload;
    },
    signedOut: () => ({ status: 'anonymous' as const, userId: null, errorMessage: null }),
  },
});

export const { sessionFailed, sessionResolved, signedOut } = authSlice.actions;
export const authReducer = authSlice.reducer;

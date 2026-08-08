import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AuthState } from '@/core/auth/authTypes';

const initialState: AuthState = { status: 'unknown', userId: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionResolved: (state, action: PayloadAction<{ userId: string | null }>) => {
      state.status = action.payload.userId ? 'authenticated' : 'anonymous';
      state.userId = action.payload.userId;
    },
    signedOut: () => ({ status: 'anonymous' as const, userId: null }),
  },
});

export const { sessionResolved, signedOut } = authSlice.actions;
export const authReducer = authSlice.reducer;

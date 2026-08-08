import { configureStore } from '@reduxjs/toolkit';

import { apiMiddleware } from './middleware';
import { rootReducer } from './rootReducer';

export function createAppStore() {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefault) => getDefault().concat(apiMiddleware),
  });
}

export const store = createAppStore();
export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

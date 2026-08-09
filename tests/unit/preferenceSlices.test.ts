import { authReducer, sessionResolved, signedOut } from '@/features/authentication/state/authSlice';
import {
  languageReducer,
  preferredLanguageChanged,
  uiLanguageChanged,
} from '@/features/language/state/languageSlice';
import { settingsReducer, voiceResponsesChanged } from '@/features/settings/state/settingsSlice';

describe('preference and session reducers', () => {
  it('resolves and clears an authenticated session', () => {
    const authenticated = authReducer(undefined, sessionResolved({ userId: 'user-1' }));
    expect(authenticated).toEqual({
      status: 'authenticated',
      userId: 'user-1',
      errorMessage: null,
    });
    expect(authReducer(authenticated, signedOut())).toEqual({
      status: 'anonymous',
      userId: null,
      errorMessage: null,
    });
  });

  it('keeps UI locale separate from conversation language', () => {
    let state = languageReducer(undefined, uiLanguageChanged('fr'));
    state = languageReducer(state, preferredLanguageChanged('ln'));
    expect(state).toEqual({ uiLanguage: 'fr', preferredConversationLanguage: 'ln' });
  });

  it('stores the voice response preference', () => {
    expect(settingsReducer(undefined, voiceResponsesChanged(false)).voiceResponsesEnabled).toBe(
      false,
    );
  });
});

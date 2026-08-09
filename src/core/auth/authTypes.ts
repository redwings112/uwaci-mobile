export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  userId?: string;
}

export interface AuthState {
  status: 'unknown' | 'anonymous' | 'authenticated' | 'error';
  userId: string | null;
  errorMessage: string | null;
}

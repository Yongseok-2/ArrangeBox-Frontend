import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  accountId: string | null;
  setAuth: (data: { access_token: string; refresh_token: string; expires_at: string; account_id?: string }) => void;
  setAccountId: (accountId: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      accountId: null,
      setAuth: (data) =>
        set({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: data.expires_at,
          ...(data.account_id ? { accountId: data.account_id } : {}),
        }),
      setAccountId: (accountId) => set({ accountId }),
      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          accountId: null,
        }),
      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'arrangebox-auth-storage',
    }
  )
);

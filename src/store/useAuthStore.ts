import { create } from 'zustand';


interface AuthState {
  isAuthenticated: boolean;
  expiresAt: string | null;
  accountId: string | null;
  setAuth: (data: { expires_at: string; account_id?: string }) => void;
  setAccountId: (accountId: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  (set) => ({
    isAuthenticated: false,
    expiresAt: null,
    accountId: null,
    setAuth: (data) =>
      set({
        isAuthenticated: true,
        expiresAt: data.expires_at,
        ...(data.account_id ? { accountId: data.account_id } : {}),
      }),
    setAccountId: (accountId) => set({ accountId }),
    clearAuth: () =>
      set({
        isAuthenticated: false,
        expiresAt: null,
        accountId: null,
      }),
  })
);

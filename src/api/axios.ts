import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 갱신 전용 (인터셉터에서 무한 루프 방지용)
export const apiAuthClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const authStore = useAuthStore.getState();
    let accessToken = authStore.accessToken;
    const refreshToken = authStore.refreshToken;
    const expiresAt = authStore.expiresAt;

    // 만료 5분 전이면 토큰 갱신 시도
    if (accessToken && refreshToken && expiresAt) {
      const expiresDate = new Date(expiresAt);
      const now = new Date();
      if (expiresDate.getTime() - now.getTime() < 5 * 60 * 1000) {
        try {
          const res = await apiAuthClient.post('/auth/google/token/ensure', {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: expiresAt,
          });

          if (res.data && res.data.access_token) {
            authStore.setAuth({
              access_token: res.data.access_token,
              refresh_token: res.data.refresh_token || refreshToken,
              expires_at: res.data.expires_at || expiresAt,
              account_id: authStore.accountId || undefined,
            });
            accessToken = res.data.access_token;
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          authStore.clearAuth();
          window.location.href = '/';
          return Promise.reject(error);
        }
      }
    }

    // POST/PUT 등에서 body에 access_token이 요구되는 설계
    if (accessToken && config.data && typeof config.data === 'object') {
      if (!config.data.access_token) {
        config.data.access_token = accessToken;
      }
      if (authStore.accountId && !config.data.account_id) {
        config.data.account_id = authStore.accountId;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

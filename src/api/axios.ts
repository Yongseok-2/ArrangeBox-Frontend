import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 갱신 전용 (인터셉터에서 무한 루프 방지용)
export const apiAuthClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const authStore = useAuthStore.getState();
    const expiresAt = authStore.expiresAt;
    const isAuthenticated = authStore.isAuthenticated;

    // 만료 5분 전이면 토큰 갱신 시도 (HttpOnly 쿠키 방식이므로 body 전송 필요 없음)
    if (isAuthenticated && expiresAt) {
      const expiresDate = new Date(expiresAt);
      const now = new Date();
      if (expiresDate.getTime() - now.getTime() < 5 * 60 * 1000) {
        try {
          const res = await apiAuthClient.post('/auth/google/token/ensure');

          if (res.data && res.data.expires_at) {
            authStore.setAuth({
              expires_at: res.data.expires_at,
              account_id: authStore.accountId || undefined,
            });
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          authStore.clearAuth();
          window.location.href = '/';
          return Promise.reject(error);
        }
      }
    }

    // POST/PUT 등에서 백엔드 API 명세에 명시된 account_id는 필요시 주입
    if (authStore.accountId && config.data && typeof config.data === 'object') {
      if (!config.data.account_id) {
        config.data.account_id = authStore.accountId;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthCallback from './pages/AuthCallback';
import AppLayout from './components/layout/AppLayout';
import TriagePage from './pages/TriagePage';
import LoginPage from './pages/LoginPage';
import FetchEmailPage from './pages/FetchEmailPage';
import PrivateRoute from './components/PrivateRoute';

// React Query 전역 설정 (재조회 횟수, 윈도우 포커스 시 재조회 방지 등)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* 공통 레이아웃을 사용하는 페이지들 */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<LandingPage />} />
            {/* 로그인 필요 라우트 */}
            <Route element={<PrivateRoute />}>
              <Route path="/triage" element={<TriagePage />} />
            </Route>
          </Route>

          {/* OAuth 인증 및 콜백, 동기화 관련 라우트 (레이아웃 제외) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/fetch-email" element={<FetchEmailPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
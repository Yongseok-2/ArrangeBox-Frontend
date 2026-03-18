import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthCallback from './pages/AuthCallback';

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
          {/* 랜딩(로그인) 페이지 */}
          <Route path="/" element={<LandingPage />} />
          {/* OAuth 콜백 처리 라우트 */}
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
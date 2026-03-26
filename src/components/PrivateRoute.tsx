import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * 로그인된 사용자만 접근 가능한 라우트 가드
 * 미인증 시 랜딩 페이지(/)로 리다이렉트
 */
export default function PrivateRoute() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

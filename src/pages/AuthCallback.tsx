import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiAuthClient } from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';

const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/callback`;

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setAuth = useAuthStore((state: any) => state.setAuth);
    const [error, setError] = useState<string | null>(null);

    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const authorize = async () => {
            const code = searchParams.get('code');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setError(`로그인 실패: ${errorParam}`);
                return;
            }

            if (!code) {
                setError('인증 코드가 없습니다.');
                return;
            }

            try {
                const response = await apiAuthClient.post('/auth/google/token', {
                    code,
                    redirect_uri: redirectUri
                });

                if (response.data && response.data.expires_at) {
                    setAuth({
                        expires_at: response.data.expires_at,
                        account_id: response.data.account_id,
                    });

                    // 성공 시 이메일 가져오기 페이지로 이동
                    navigate('/fetch-email', { replace: true });
                } else {
                    setError('토큰을 받아오지 못했습니다.');
                }
            } catch (err: any) {
                console.error('OAuth 통신 에러:', err);
                setError(err?.response?.data?.message || '로그인 중 오류가 발생했습니다.');
            }
        };

        authorize();
    }, [searchParams, navigate, setAuth]);

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 text-center">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 max-w-md w-full">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">로그인 오류</h2>
                    <p className="text-red-500 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="rounded-full bg-red-600 px-6 py-2 text-white font-medium hover:bg-red-700 transition"
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                <p className="text-neutral-600 font-medium">로그인 처리 중입니다...</p>
            </div>
        </div>
    );
};

export default AuthCallback;

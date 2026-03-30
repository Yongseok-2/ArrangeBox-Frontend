import { CloudDownload, Zap, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { apiClient } from '@/api/axios';

// 백엔드 이메일 동기화 요청을 위한 인터페이스 정의
interface SyncEmailsReq {
    account_id: string;
    user_id: string;
    max_results: number;
}

const FetchEmailPage = () => {
    const navigate = useNavigate();
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const accountId = useAuthStore((state) => state.accountId);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleLogout = async () => {
        try {
            // Optional: Notify backend to clear cookies if supported
            await apiClient.post('/auth/logout');
        } catch (e) {
            console.error('Logout failed on backend:', e);
        } finally {
            clearAuth();
            navigate('/', { replace: true });
        }
    };

    const handleFetchEmail = async () => {
        if (!accountId) {
            console.error('Account ID가 없습니다.');
            return;
        }

        setIsLoading(true);
        setProgress(0);

        // 가짜 프로그레스 바 진행 (0~90%까지 무작위 상승)
        const interval = setInterval(() => {
            setProgress((prev) => {
                const step = Math.random() * 8;
                const next = prev + step;
                return next > 90 ? 90 : next;
            });
        }, 500);

        try {
            // 프로젝트 양식에 맞춰 요청 객체 생성
            const req: SyncEmailsReq = {
                account_id: accountId,
                user_id: 'me',
                max_results: 1000,
            };

            // 실제 백엔드 /emails/sync 호출
            const response = await apiClient.post('/emails/sync', req);
            
            if (response.data && response.data.fetched_count !== undefined) {
                localStorage.setItem('arrangebox_fetched_count', String(response.data.fetched_count));
            }

            // 완료 시 즉시 100% 달성 및 타이머 종료
            clearInterval(interval);
            setProgress(100);

            setTimeout(() => {
                navigate('/triage');
            }, 600);
        } catch (error) {
            clearInterval(interval);
            console.error('Failed to fetch emails:', error);
            // 에러가 나도 다음 화면(Triage)에서 에러 뷰를 띄울 수 있도록 이동
            navigate('/triage');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* 왼쪽위 로그아웃 버튼 */}
            <button
                onClick={handleLogout}
                className="absolute top-6 left-6 md:top-10 md:left-10 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-neutral-200/50 text-neutral-600 text-sm font-bold transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 hover:shadow-sm"
            >
                <LogOut className="w-4 h-4" />
                <span>로그아웃</span>
            </button>

            {/* 메인 이메일 가져오기 카드 (LoginPage 디자인 기반 수정) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[700px] bg-white rounded-[2.5rem] p-8 md:p-14 shadow-[0_-10px_40px_rgba(26,28,28,0.06)] flex flex-col items-center text-center relative overflow-hidden z-10"
            >
                {/* Decorative Gradient Background Bleed */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

                {/* Brand Icon */}
                <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center shadow-lg shadow-emerald-500/20 relative z-10 mb-2">
                    <CloudDownload className="text-white w-10 h-10" />
                </div>

                {/* Content */}
                <h1
                    className="text-[2.2rem] leading-none tracking-tight text-neutral-900 mb-8 relative z-10 whitespace-nowrap"
                    style={{ fontWeight: 700 }}
                >
                    내 이메일 가져오기
                </h1>
                <p className="text-neutral-500 text-base font-medium leading-relaxed px-2 relative z-10">
                    <span className="text-emerald-600 font-bold">{accountId || 'Google 계정'}</span>의 메일함을 스캔하여<br />정리할 이메일들을 안전하게 분석합니다.
                </p>

                {/* Spacer */}
                <div className="h-6 w-full" />

                {/* Action Area */}
                {isLoading ? (
                    <div className="w-full max-w-[420px] relative z-10 flex flex-col gap-3 py-4">
                        <div className="flex justify-between text-sm font-bold text-emerald-600 px-1">
                            <span className="animate-pulse">이메일 분석 중...</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                        <p className="text-xs text-neutral-400 mt-2">
                            AI가 가장 효율적인 정리 방법을 스캔하고 있습니다
                        </p>
                    </div>
                ) : (
                    <Button
                        onClick={handleFetchEmail}
                        disabled={isLoading}
                        className="group w-full max-w-[420px] h-auto relative z-10 bg-emerald-500 hover:bg-emerald-600 transition-all duration-300 text-white font-bold py-[1.15rem] px-8 rounded-full flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-emerald-500/25"
                    >
                        <CloudDownload className="w-5 h-5 text-white animate-bounce" />
                        <span className="text-[17px]">이메일 분석 시작하기</span>
                    </Button>
                )}

                {/* Secondary Info */}
                <div className="mt-10 pt-8 border-t border-neutral-100 w-full relative z-10">
                    <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold mb-2">
                        <Zap className="w-5 h-5 fill-current" />
                        <span className="text-sm">AI 기반 분류 시스템</span>
                    </div>
                    <p className="text-xs text-neutral-400 font-medium">
                        가져온 이메일은 환경적 기준에 따라 지능적으로 분류됩니다.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default FetchEmailPage;

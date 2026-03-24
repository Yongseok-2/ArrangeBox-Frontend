import { CloudDownload, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { apiClient } from '@/api/axios';
import { useQueryClient } from '@tanstack/react-query';

interface SyncEmailsReq {
    account_id: string;
    user_id: string;
    max_results: number;
}

interface FetchEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FetchEmailModal({ isOpen, onClose }: FetchEmailModalProps) {
    const accountId = useAuthStore((state) => state.accountId);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const queryClient = useQueryClient();

    const handleFetchEmail = async () => {
        if (!accountId) {
            console.error('Account ID가 없습니다.');
            return;
        }

        setIsLoading(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress((prev) => {
                const step = Math.random() * 8;
                const next = prev + step;
                return next > 90 ? 90 : next;
            });
        }, 500);

        try {
            const req: SyncEmailsReq = {
                account_id: accountId,
                user_id: 'me',
                max_results: 50,
            };

            await apiClient.post('/emails/sync', req);

            clearInterval(interval);
            setProgress(100);

            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['triage-preview-db'] });
                setIsLoading(false);
                onClose();
            }, 600);
        } catch (error) {
            clearInterval(interval);
            console.error('Failed to fetch emails:', error);
            setIsLoading(false);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="w-full max-w-[700px] bg-white rounded-[2.5rem] p-8 md:p-14 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
                    >
                        {/* 닫기 버튼 */}
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100/50 text-neutral-500 hover:bg-neutral-200 transition-colors disabled:opacity-50"
                        >
                            <X size={20} />
                        </button>

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
                            <span className="text-emerald-600 font-bold">{accountId || 'Google 계정'}</span>의 메일함을 다시 스캔하여<br />정리할 이메일들을 안전하게 분석합니다.
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
                </motion.div>
            )}
        </AnimatePresence>
    );
}

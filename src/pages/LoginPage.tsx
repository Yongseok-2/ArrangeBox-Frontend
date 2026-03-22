import { Mail, Shield, Zap, ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@/hooks/useGoogleLogin';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';

const LoginPage = () => {
    const { login, isLoading } = useGoogleLogin();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* 뒤로가기 버튼 */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 md:top-10 md:left-10 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-neutral-200/50 text-neutral-600 text-sm font-bold transition-all hover:bg-white hover:text-neutral-900 hover:shadow-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>뒤로가기</span>
            </button>

            {/* 메인 로그인 연결 카드 (Stitch Design) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[700px] bg-white rounded-[2.5rem] p-8 md:p-14 shadow-[0_-10px_40px_rgba(26,28,28,0.06)] flex flex-col items-center text-center relative overflow-hidden z-10"
            >
                {/* Decorative Gradient Background Bleed */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

                {/* Brand Icon (Stitch) */}
                <div className="w-20 h-20 bg-orange-500 rounded-[2rem] flex items-center justify-center shadow-lg shadow-orange-500/20 relative z-10">
                    <Mail className="text-white w-10 h-10" />
                </div>

                {/* Content */}
                <h1
                    className="text-[2.2rem] leading-none tracking-tight text-neutral-900 mb-10 relative z-10 whitespace-nowrap"
                    style={{ fontWeight: 700 }}
                >
                    Arrange Box 시작하기
                </h1>
                <p className="text-neutral-500 text-base font-medium leading-relaxed px-2 relative z-10">
                    Google 계정을 연동해서 불필요한 메일을<br />Arrange Box로 깔끔하게 치워보세요!
                </p>

                {/* 강제로 공백을 뚫어주는 투명 스페이서 (64px) */}
                <div className="h-6 w-full" />

                {/* Primary Action Button */}
                <Button
                    onClick={login}
                    disabled={isLoading}
                    className="group w-full max-w-[420px] h-auto relative z-10 bg-orange-500 hover:bg-orange-600 transition-all duration-300 text-white font-bold py-[1.15rem] px-8 rounded-full flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-orange-500/25 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Zap className="w-5 h-5 fill-current text-white animate-pulse" />
                            <span className="text-[17px]">Gmail 연결하기</span>
                        </>
                    )}
                </Button>

                {/* Secondary Info / Security (Stitch) */}
                <div className="mt-10 pt-8 border-t border-neutral-100 w-full relative z-10">
                    <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold mb-2">
                        <Shield className="w-5 h-5 fill-current" />
                        <span className="text-sm">안전한 데이터 관리</span>
                    </div>
                    <p className="text-xs text-neutral-400 font-medium">
                        모든 작업 내역과 개인정보는 안전하게 보호됩니다.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;

import { Mail, Shield, Zap, ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@/hooks/useGoogleLogin';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

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

            {/* 배경 시각 장식 */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-orange-400/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-400/5 rounded-full blur-[100px] pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md bg-white border border-neutral-100 shadow-2xl shadow-neutral-200/50 rounded-[2.5rem] p-8 md:p-12 relative z-10 text-center"
            >
                <div className="mx-auto bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                    <Mail className="w-10 h-10 text-orange-500" />
                </div>
                
                <h1 className="text-3xl font-black text-neutral-900 mb-3 tracking-tight">Arrange Box 시작하기</h1>
                <p className="text-neutral-500 mb-10 leading-relaxed font-medium">
                    Google 계정을 연동해서 불필요한 메일을<br/>AI로 깔끔하게 치워보세요!
                </p>

                <div className="space-y-4 mb-10 text-left">
                    <div className="flex gap-4 items-center">
                        <div className="bg-emerald-50 text-emerald-500 p-2 rounded-full"><Shield className="w-5 h-5"/></div>
                        <div>
                            <p className="font-bold text-sm text-neutral-900">안전한 데이터 관리</p>
                            <p className="text-xs text-neutral-500">모든 작업 내역과 개인정보는 안전하게 보호됩니다.</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={login}
                    disabled={isLoading}
                    className="w-full relative flex items-center justify-center gap-3 rounded-full bg-orange-500 py-4 font-bold text-white transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 fill-current" />
                            <span>Gmail 연결하기</span>
                        </div>
                    )}
                </button>
            </motion.div>
        </div>
    );
};

export default LoginPage;

import { useState, useEffect } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'motion/react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@/hooks/useGoogleLogin';
import { useAuthStore } from '@/store/useAuthStore';
import { apiAuthClient } from '@/api/axios';
import FetchEmailModal from '@/components/FetchEmailModal';
import { CloudDownload } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { login, isLoading } = useGoogleLogin();
    const { isAuthenticated, clearAuth } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isFetchModalOpen, setIsFetchModalOpen] = useState(false);

    const isLandingPage = location.pathname === '/';
    const isTriagePage = location.pathname === '/triage';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            try {
                // 백엔드 세션/쿠키 삭제 요청
                await apiAuthClient.post('/auth/logout');
            } catch (error) {
                console.error('Logout API failed:', error);
                // API가 실패하더라도 클라이언트 상태는 지워주는 것이 안전합니다.
            } finally {
                clearAuth();
                navigate('/');
                setIsOpen(false);
            }
        }
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <>
            <nav
                className={cn(
                    'fixed inset-x-0 top-0 z-50 transition-all duration-300',
                    scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
                )}
            >
                <div className="mx-auto max-w-7xl px-6 md:px-10 flex items-center justify-between">
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={handleLogoClick}
                    >
                        <span className="text-2xl font-bold tracking-tight text-neutral-900">
                            Arrange Box
                        </span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {isLandingPage && !isAuthenticated && (
                            <>
                                <a href="#features" className="text-sm font-medium text-neutral-600 hover:text-orange-500 transition-colors">기능</a>
                                <a href="#impact" className="text-sm font-medium text-neutral-600 hover:text-orange-500 transition-colors">환경 임팩트</a>
                                <a href="#how-it-works" className="text-sm font-medium text-neutral-600 hover:text-orange-500 transition-colors">이용 방법</a>
                            </>
                        )}

                        {isAuthenticated ? (
                            <>
                                {isTriagePage && (
                                    <button
                                        onClick={() => setIsFetchModalOpen(true)}
                                        className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-emerald-600 transition-colors px-4 py-2 rounded-full hover:bg-emerald-50"
                                    >
                                        <CloudDownload size={16} />
                                        메일 다시 가져오기
                                    </button>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-orange-500 transition-colors px-4 py-2 rounded-full hover:bg-orange-50"
                                >
                                    <LogOut size={16} />
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={login}
                                disabled={isLoading}
                                className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-70"
                            >
                                {isLoading ? '준비 중...' : '무료로 시작하기'}
                            </button>
                        )}
                    </div>

                    {/* Mobile Nav Toggle */}
                    <button className="md:hidden text-neutral-900" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute inset-x-0 top-full bg-white border-b border-neutral-100 shadow-xl p-6 flex flex-col gap-4 md:hidden"
                        >
                            {isLandingPage && !isAuthenticated && (
                                <>
                                    <a href="#features" onClick={() => setIsOpen(false)} className="text-lg font-medium text-neutral-800">기능</a>
                                    <a href="#impact" onClick={() => setIsOpen(false)} className="text-lg font-medium text-neutral-800">환경 임팩트</a>
                                    <a href="#how-it-works" onClick={() => setIsOpen(false)} className="text-lg font-medium text-neutral-800">이용 방법</a>
                                </>
                            )}

                            {isAuthenticated ? (
                                <>
                                    {isTriagePage && (
                                        <button
                                            onClick={() => { setIsFetchModalOpen(true); setIsOpen(false); }}
                                            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-neutral-100 px-5 py-3 text-base font-semibold text-neutral-700 w-full"
                                        >
                                            <CloudDownload size={18} />
                                            메일 다시 가져오기
                                        </button>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-neutral-100 px-5 py-3 text-base font-semibold text-neutral-700 w-full"
                                    >
                                        <LogOut size={18} />
                                        로그아웃
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={login}
                                    disabled={isLoading}
                                    className="mt-4 rounded-xl bg-orange-500 px-5 py-3 text-base font-semibold text-white w-full disabled:opacity-70"
                                >
                                    {isLoading ? '준비 중...' : '무료로 시작하기'}
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
            <FetchEmailModal isOpen={isFetchModalOpen} onClose={() => setIsFetchModalOpen(false)} />
        </>
    );
};

export default Navbar;
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'motion/react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@/hooks/useGoogleLogin';

const logoImg = 'https://placehold.co/40x40/orange/white?text=Logo';
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { login, isLoading } = useGoogleLogin();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                'fixed inset-x-0 top-0 z-50 transition-all duration-300',
                scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
            )}
        >
            <div className="mx-auto max-w-7xl px-6 md:px-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden">
                        <img src={logoImg} alt="Arrange Box Logo" className="h-full w-full object-contain" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-neutral-900">
                        Arrange Box
                    </span>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm font-medium text-neutral-600 hover:text-orange-500 transition-colors">기능</a>
                    <a href="#impact" className="text-sm font-medium text-neutral-600 hover:text-orange-500 transition-colors">환경 임팩트</a>
                    <a href="#how-it-works" className="text-sm font-medium text-neutral-600 hover:text-orange-500 transition-colors">이용 방법</a>
                    <button 
                        onClick={login}
                        disabled={isLoading}
                        className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-70"
                    >
                        {isLoading ? '준비 중...' : '무료로 시작하기'}
                    </button>
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
                        <a href="#features" onClick={() => setIsOpen(false)} className="text-lg font-medium text-neutral-800">기능</a>
                        <a href="#impact" onClick={() => setIsOpen(false)} className="text-lg font-medium text-neutral-800">환경 임팩트</a>
                        <a href="#how-it-works" onClick={() => setIsOpen(false)} className="text-lg font-medium text-neutral-800">이용 방법</a>
                        <button 
                            onClick={login}
                            disabled={isLoading}
                            className="mt-4 rounded-xl bg-orange-500 px-5 py-3 text-base font-semibold text-white w-full disabled:opacity-70"
                        >
                            {isLoading ? '준비 중...' : '무료로 시작하기'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
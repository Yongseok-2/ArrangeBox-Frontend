import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppLayout() {
  const { clearAuth } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-neutral-900">
      {/* App Navbar */}
      <nav
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
        )}
      >
        <div className="mx-auto max-w-7xl px-6 md:px-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-neutral-900">
              Arrange Box
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={clearAuth}
              className="text-sm font-medium text-neutral-600 hover:text-orange-500 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content (with top padding for the fixed navbar) */}
      <main className="pt-24 pb-20 mx-auto max-w-7xl px-6 md:px-10">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

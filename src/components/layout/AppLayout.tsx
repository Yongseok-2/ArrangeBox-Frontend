import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Navbar from './Navbar';
import Footer from './Footer';

export default function AppLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isTriagePage = location.pathname.startsWith('/triage');

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-neutral-900 flex flex-col">
      <Navbar />

      <main className={cn(
        "flex-1 w-full flex flex-col",
        isLandingPage ? "pt-24 mx-auto" : isTriagePage ? "pt-24" : "pt-32 pb-20 max-w-7xl mx-auto px-6 md:px-10"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {!isTriagePage && <Footer />}
    </div>
  );
}

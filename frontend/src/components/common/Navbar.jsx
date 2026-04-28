import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Stethoscope, Menu, X, Sparkles } from 'lucide-react';
import LanguagePicker from './LanguagePicker';
import Button from './Button';

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 border-b border-white/50 bg-white/70 backdrop-blur-xl shadow-[0_10px_30px_-22px_rgba(10,37,64,0.55)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[76px] items-center justify-between gap-4 py-3">
          <Link to="/" className="group flex min-w-0 items-center gap-3">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.04 }}
              transition={{ duration: 0.35 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A2540] via-[#143b60] to-[#2EC4B6] shadow-[0_18px_36px_-18px_rgba(10,37,64,0.8)]"
            >
              <Stethoscope className="h-6 w-6 text-white" />
            </motion.div>
            <div className="min-w-0 text-left">
              <span className="block font-display text-xl font-bold tracking-tight text-[#0A2540] sm:text-2xl">
                {t('title')}
              </span>
              <span className="block text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                Medical Bill Intelligence
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-4 md:flex">
            <LanguagePicker />
            <Link to="/dashboard">
              <Button variant="primary" className="min-w-[170px]">
                <Sparkles className="h-4 w-4" />
                {t('navbar.analyze_now')}
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-2xl border border-[#0A2540]/10 bg-white/70 p-3 text-[#0A2540] transition-colors hover:bg-white md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 border-t border-[#0A2540]/8 py-4 md:hidden"
            >
              <div className="flex flex-col gap-4">
                <LanguagePicker onLanguageChange={() => setIsMobileMenuOpen(false)} />
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    <Sparkles className="h-4 w-4" />
                    {t('navbar.analyze_now')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

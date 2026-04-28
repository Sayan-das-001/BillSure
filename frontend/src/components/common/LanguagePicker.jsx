import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, ChevronDown } from 'lucide-react';
import { getLanguagesByRegion, getLanguageByCode, RTL_LANGUAGES } from '../../constants/languages';

export default function LanguagePicker({ onLanguageChange }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const storedLang = localStorage.getItem('i18nextLng');
    if (!storedLang || !getLanguageByCode(storedLang)) {
      if (i18n.language !== 'en') {
        i18n.changeLanguage('en');
        localStorage.setItem('i18nextLng', 'en');
      }
    } else if (i18n.language !== storedLang && getLanguageByCode(storedLang)) {
      i18n.changeLanguage(storedLang);
    }
  }, []);

  const currentLang = getLanguageByCode(i18n.language) || getLanguageByCode('en') || { name: 'English', dir: 'ltr' };
  const languagesByRegion = getLanguagesByRegion() || {};

  const handleLanguageChange = (langCode) => {
    const lang = getLanguageByCode(langCode) || { dir: 'ltr' };
    i18n.changeLanguage(langCode);
    try {
      localStorage.setItem('i18nextLng', langCode);
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }
    setIsOpen(false);

    if (onLanguageChange) {
      onLanguageChange();
    }

    document.documentElement.dir = lang.dir;
    document.documentElement.lang = langCode;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-2xl border border-[#0A2540]/10 bg-white/75 px-4 py-3 text-left text-[#0A2540] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
      >
        <Languages className="h-4 w-4" />
        <span className="text-sm font-medium">{currentLang?.name || 'Language'}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="custom-scrollbar absolute right-0 z-50 mt-3 max-h-96 w-72 overflow-y-auto rounded-[24px] border border-white/70 bg-white/92 shadow-[0_28px_55px_-30px_rgba(10,37,64,0.45)] backdrop-blur-xl sm:w-80"
            >
              <div className="p-4">
                {Object.entries(languagesByRegion).map(([region, langs]) => (
                  <div key={region} className="mb-4 last:mb-0">
                    <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      {region}
                    </h3>
                    <div className="space-y-1">
                      {langs?.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full rounded-2xl px-3 py-3 text-left text-sm transition-all ${
                            i18n.language === lang.code
                              ? 'bg-[#0A2540] text-white shadow-[0_14px_28px_-18px_rgba(10,37,64,0.9)]'
                              : 'text-slate-700 hover:bg-slate-100/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{lang?.name || 'Unknown'}</div>
                              <div
                                className={`text-xs ${
                                  i18n.language === lang.code ? 'text-white/80' : 'text-slate-500'
                                }`}
                              >
                                {lang?.englishName || ''}
                              </div>
                            </div>
                            {RTL_LANGUAGES.includes(lang?.code) && (
                              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                                RTL
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { getLanguageByCode } from '../constants/languages';

export default function MainLayout() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = getLanguageByCode(i18n.language) || { dir: 'ltr' };
    document.documentElement.dir = currentLang.dir || 'ltr';
    document.documentElement.lang = i18n.language || 'en';
  }, [i18n.language]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f9fbfd_0%,#f4f8fb_48%,#eef5fb_100%)]" />
        <div className="bg-blob-1 absolute left-[8%] top-0 h-80 w-80 rounded-full bg-[#2EC4B6]/18 blur-3xl" />
        <div className="bg-blob-2 absolute right-[10%] top-24 h-96 w-96 rounded-full bg-[#0A2540]/8 blur-3xl" />
        <div className="bg-blob-3 absolute bottom-24 left-0 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="bg-blob-4 absolute bottom-0 right-[15%] h-80 w-80 rounded-full bg-cyan-200/25 blur-3xl" />
        <div className="bg-noise absolute inset-0 opacity-[0.06]" />
      </div>
      <Navbar />
      <main className="relative z-0 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { LANGUAGES } from '../constants/languages';

// Import all translation files
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import ta from '../locales/ta.json';
import te from '../locales/te.json';
import bn from '../locales/bn.json';
import mr from '../locales/mr.json';
import gu from '../locales/gu.json';
import kn from '../locales/kn.json';
import ml from '../locales/ml.json';
import as from '../locales/as.json';
import brx from '../locales/brx.json';
import doi from '../locales/doi.json';
import ks from '../locales/ks.json';
import gom from '../locales/gom.json';
import mai from '../locales/mai.json';
import mni from '../locales/mni.json';
import ne from '../locales/ne.json';
import or from '../locales/or.json';
import pa from '../locales/pa.json';
import sa from '../locales/sa.json';
import sat from '../locales/sat.json';
import sd from '../locales/sd.json';
import ur from '../locales/ur.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  ta: { translation: ta },
  te: { translation: te },
  bn: { translation: bn },
  mr: { translation: mr },
  gu: { translation: gu },
  kn: { translation: kn },
  ml: { translation: ml },
  as: { translation: as },
  brx: { translation: brx },
  doi: { translation: doi },
  ks: { translation: ks },
  gom: { translation: gom },
  mai: { translation: mai },
  mni: { translation: mni },
  ne: { translation: ne },
  or: { translation: or },
  pa: { translation: pa },
  sa: { translation: sa },
  sat: { translation: sat },
  sd: { translation: sd },
  ur: { translation: ur }
};

const supportedLanguages = Object.keys(resources);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      checkWhitelist: true
    },
    supportedLngs: supportedLanguages
  })
  .then(() => {
    const currentLang = i18n.language;
    if (!currentLang || !supportedLanguages.includes(currentLang)) {
      i18n.changeLanguage('en');
      try {
        localStorage.setItem('i18nextLng', 'en');
      } catch (e) {
        console.warn('localStorage write failed:', e);
      }
    } else {
      try {
        localStorage.setItem('i18nextLng', currentLang);
      } catch (e) {
        console.warn('localStorage write failed:', e);
      }
    }
  });

export default i18n;


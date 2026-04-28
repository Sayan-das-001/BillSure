export const LANGUAGES = [
  {
    code: 'as',
    name: 'অসমীয়া',
    englishName: 'Assamese',
    dir: 'ltr',
    voiceCode: 'as-IN',
    region: 'East'
  },
  {
    code: 'bn',
    name: 'বাংলা',
    englishName: 'Bengali',
    dir: 'ltr',
    voiceCode: 'bn-IN',
    region: 'East'
  },
  {
    code: 'brx',
    name: 'बड़ो',
    englishName: 'Bodo',
    dir: 'ltr',
    voiceCode: 'hi-IN', // Fallback
    region: 'North'
  },
  {
    code: 'doi',
    name: 'डोगरी',
    englishName: 'Dogri',
    dir: 'ltr',
    voiceCode: 'hi-IN', // Fallback
    region: 'North'
  },
  {
    code: 'gu',
    name: 'ગુજરાતી',
    englishName: 'Gujarati',
    dir: 'ltr',
    voiceCode: 'gu-IN',
    region: 'West'
  },
  {
    code: 'hi',
    name: 'हिन्दी',
    englishName: 'Hindi',
    dir: 'ltr',
    voiceCode: 'hi-IN',
    region: 'North'
  },
  {
    code: 'kn',
    name: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    dir: 'ltr',
    voiceCode: 'kn-IN',
    region: 'South'
  },
  {
    code: 'ks',
    name: 'कॉशुर',
    englishName: 'Kashmiri',
    dir: 'rtl',
    voiceCode: 'ur-IN', // Fallback
    region: 'North'
  },
  {
    code: 'gom',
    name: 'कोंकणी',
    englishName: 'Konkani',
    dir: 'ltr',
    voiceCode: 'hi-IN', // Fallback
    region: 'West'
  },
  {
    code: 'mai',
    name: 'मैथिली',
    englishName: 'Maithili',
    dir: 'ltr',
    voiceCode: 'hi-IN', // Fallback
    region: 'East'
  },
  {
    code: 'ml',
    name: 'മലയാളം',
    englishName: 'Malayalam',
    dir: 'ltr',
    voiceCode: 'ml-IN',
    region: 'South'
  },
  {
    code: 'mni',
    name: 'ꯃꯤꯇꯩꯂꯣꯟ',
    englishName: 'Manipuri',
    dir: 'ltr',
    voiceCode: 'hi-IN', // Fallback
    region: 'East'
  },
  {
    code: 'mr',
    name: 'मराठी',
    englishName: 'Marathi',
    dir: 'ltr',
    voiceCode: 'mr-IN',
    region: 'West'
  },
  {
    code: 'ne',
    name: 'नेपाली',
    englishName: 'Nepali',
    dir: 'ltr',
    voiceCode: 'ne-IN',
    region: 'North'
  },
  {
    code: 'or',
    name: 'ଓଡ଼ିଆ',
    englishName: 'Odia',
    dir: 'ltr',
    voiceCode: 'or-IN',
    region: 'East'
  },
  {
    code: 'pa',
    name: 'ਪੰਜਾਬੀ',
    englishName: 'Punjabi',
    dir: 'ltr',
    voiceCode: 'pa-IN',
    region: 'North'
  },
  {
    code: 'sa',
    name: 'संस्कृतम्',
    englishName: 'Sanskrit',
    dir: 'ltr',
    voiceCode: 'hi-IN', // Fallback
    region: 'Classical'
  },
  {
    code: 'sat',
    name: 'ᱥᱟᱱᱛᱟᱲᱤ',
    englishName: 'Santhali',
    dir: 'ltr',
    voiceCode: 'hi-IN', // Fallback
    region: 'East'
  },
  {
    code: 'sd',
    name: 'سنڌي',
    englishName: 'Sindhi',
    dir: 'rtl',
    voiceCode: 'ur-IN', // Fallback
    region: 'West'
  },
  {
    code: 'ta',
    name: 'தமிழ்',
    englishName: 'Tamil',
    dir: 'ltr',
    voiceCode: 'ta-IN',
    region: 'South'
  },
  {
    code: 'te',
    name: 'తెలుగు',
    englishName: 'Telugu',
    dir: 'ltr',
    voiceCode: 'te-IN',
    region: 'South'
  },
  {
    code: 'ur',
    name: 'اردو',
    englishName: 'Urdu',
    dir: 'rtl',
    voiceCode: 'ur-IN',
    region: 'North'
  }
];

export const getLanguageByCode = (code) => {
  const found = LANGUAGES.find(lang => lang.code === code);
  if (found) return found;
  
  // Fallback to English if not found
  return {
    code: 'en',
    name: 'English',
    englishName: 'English',
    dir: 'ltr',
    voiceCode: 'en-IN',
    region: 'International'
  };
};

export const getLanguagesByRegion = () => {
  const regions = {};
  LANGUAGES.forEach(lang => {
    if (!regions[lang.region]) {
      regions[lang.region] = [];
    }
    regions[lang.region].push(lang);
  });
  return regions;
};

export const RTL_LANGUAGES = ['ur', 'ks', 'sd'];


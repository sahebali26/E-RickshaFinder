import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { LanguageContextType, Translations } from '../types';
import { ENGLISH_TRANSLATIONS, HINDI_TRANSLATIONS } from '../constants';

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<'en' | 'hi'>(() => {
    const storedLang = localStorage.getItem('appLanguage');
    return (storedLang === 'en' || storedLang === 'hi') ? storedLang : 'en';
  });

  const [translations, setTranslations] = useState<Translations>(() => {
    const storedLang = localStorage.getItem('appLanguage');
    return storedLang === 'hi' ? HINDI_TRANSLATIONS : ENGLISH_TRANSLATIONS;
  });

  const setLanguage = useCallback((lang: 'en' | 'hi') => {
    setLanguageState(lang);
    localStorage.setItem('appLanguage', lang);
  }, []);

  useEffect(() => {
    setTranslations(language === 'hi' ? HINDI_TRANSLATIONS : ENGLISH_TRANSLATIONS);
  }, [language]);

  const value = {
    language,
    setLanguage,
    translations,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

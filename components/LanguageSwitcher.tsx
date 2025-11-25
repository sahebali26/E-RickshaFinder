import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Button from './Button';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, translations } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <Button onClick={toggleLanguage} variant="secondary" className="min-w-[100px] bg-white dark:bg-gray-700 text-blue-700 dark:text-gray-200">
      {translations.selectLanguage}: {language === 'en' ? 'हिन्दी' : 'English'}
    </Button>
  );
};

export default LanguageSwitcher;
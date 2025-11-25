import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import { useLanguage } from '../contexts/LanguageContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { translations } = useLanguage();

  return (
    <header className="bg-blue-700 dark:bg-blue-900 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">
          {translations.appName}
        </h1>
        {user && (
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="text-sm">
              {translations.welcome}, {user.phoneNumber} (
              {translations.currentRole}: {translations[user.role]})
            </span>
            <Button onClick={logout} variant="secondary" className="bg-white text-blue-700 hover:bg-gray-100 dark:bg-blue-800 dark:text-white dark:hover:bg-blue-700">
              {translations.logout}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
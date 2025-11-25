import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { User, AuthContextType } from '../types';
import {
  getCurrentUser,
  logoutUser,
  verifyOtpAndLogin,
} from '../services/authService';
import { useLanguage } from './LanguageContext';
import { API_SIMULATION_DELAY_SHORT } from '../constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { translations } = useLanguage();

  const loadUser = useCallback(() => {
    setLoading(true);
    setTimeout(() => { // Simulate async loading from local storage
      const storedUser = getCurrentUser();
      if (storedUser) {
        setUser(storedUser);
      }
      setLoading(false);
    }, API_SIMULATION_DELAY_SHORT);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (phoneNumber: string, otp: string, role: User['role']) => {
      setLoading(true);
      setError(null);
      try {
        const loggedInUser = await verifyOtpAndLogin(phoneNumber, otp, role);
        if (loggedInUser) {
          setUser(loggedInUser);
          return true;
        }
        return false;
      } catch (e: unknown) {
        setError((e as Error).message || translations.authenticationFailed);
        setUser(null);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [translations.authenticationFailed],
  );

  const logout = useCallback(() => {
    setLoading(true);
    setTimeout(() => { // Simulate async logout
      logoutUser();
      setUser(null);
      setLoading(false);
    }, API_SIMULATION_DELAY_SHORT);
  }, []);

  const value = {
    user,
    login,
    logout,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

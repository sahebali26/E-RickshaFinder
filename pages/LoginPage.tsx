import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import { useLanguage } from '../contexts/LanguageContext';
import { sendOtp } from '../services/authService';
import { User } from '../types';

const LoginPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<User['role']>('user');
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);

  const { login, user, error } = useAuth();
  const navigate = useNavigate();
  const { translations } = useLanguage();

  useEffect(() => {
    if (user) {
      // Redirect based on role if already logged in
      switch (user.role) {
        case 'user':
          navigate('/user/dashboard', { replace: true });
          break;
        case 'driver':
          navigate('/driver/dashboard', { replace: true });
          break;
        case 'admin':
          navigate('/admin/panel', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
          break;
      }
    }
  }, [user, navigate]);

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    try {
      // In a real app, this would call a backend service to send an OTP
      await sendOtp(phoneNumber);
      setIsOtpSent(true);
    } catch (e: unknown) {
      alert((e as Error).message || translations.authenticationFailed);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleLogin = async () => {
    setIsVerifyingOtp(true);
    const success = await login(phoneNumber, otp, selectedRole);
    if (!success) {
      // Error message is handled by AuthContext
    }
    setIsVerifyingOtp(false);
  };

  if (user) {
    return null; // Already redirecting
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <Card title={translations.login} className="w-full max-w-md">
        <div className="mb-4">
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {translations.phoneNumber}
          </label>
          <input
            type="tel"
            id="phoneNumber"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder={translations.enterPhoneNumber}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isOtpSent || isSendingOtp || isVerifyingOtp}
          />
        </div>

        {!isOtpSent ? (
          <Button
            onClick={handleSendOtp}
            isLoading={isSendingOtp}
            disabled={phoneNumber.length < 10}
            className="w-full"
          >
            {translations.sendOtp}
          </Button>
        ) : (
          <>
            <div className="mb-4">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {translations.otp}
              </label>
              <input
                type="text"
                id="otp"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder={translations.enterOtp}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={4}
                disabled={isVerifyingOtp}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {translations.selectRole}
              </label>
              <select
                id="role"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as User['role'])}
                disabled={isVerifyingOtp}
              >
                <option value="user">{translations.user}</option>
                <option value="driver">{translations.driver}</option>
                <option value="admin">{translations.admin}</option>
              </select>
            </div>

            <Button
              onClick={handleLogin}
              isLoading={isVerifyingOtp}
              disabled={otp.length !== 4}
              className="w-full"
            >
              {translations.verifyOtp}
            </Button>
          </>
        )}

        {error && (
          <p className="mt-4 text-red-600 dark:text-red-400 text-center">
            {error}
          </p>
        )}
      </Card>
    </div>
  );
};

export default LoginPage;
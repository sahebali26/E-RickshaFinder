import { User } from '../types';
import { API_SIMULATION_DELAY_MEDIUM } from '../constants';

// Mock user data
const mockUsers: User[] = [
  { id: 'u1', phoneNumber: '1234567890', role: 'user' },
  { id: 'd1', phoneNumber: '9876543210', role: 'driver' },
  { id: 'a1', phoneNumber: '0000000000', role: 'admin' },
];

/**
 * Simulates sending an OTP to a mobile number.
 * In a real app, this would involve a backend call to an SMS service.
 */
export const sendOtp = async (phoneNumber: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`OTP sent to ${phoneNumber}`);
      // Always succeed for simulation
      resolve(true);
    }, API_SIMULATION_DELAY_MEDIUM);
  });
};

/**
 * Simulates verifying an OTP and logging in a user.
 */
export const verifyOtpAndLogin = async (
  phoneNumber: string,
  otp: string,
  role: User['role'],
): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // For simulation, any 4-digit OTP works, and it checks against mock users
      if (otp.length === 4) {
        const user = mockUsers.find(
          (u) => u.phoneNumber === phoneNumber && u.role === role,
        );
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error('Invalid phone number or role.'));
        }
      } else {
        reject(new Error('Invalid OTP.'));
      }
    }, API_SIMULATION_DELAY_MEDIUM);
  });
};

/**
 * Retrieves the current user from local storage.
 */
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('currentUser');
  return userJson ? (JSON.parse(userJson) as User) : null;
};

/**
 * Logs out the current user.
 */
export const logoutUser = (): void => {
  localStorage.removeItem('currentUser');
};

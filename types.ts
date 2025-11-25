// User and Auth types
export interface User {
  id: string;
  phoneNumber: string;
  role: 'user' | 'driver' | 'admin';
}

export interface AuthContextType {
  user: User | null;
  login: (phoneNumber: string, otp: string, role: User['role']) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

// Geolocation types
export interface LatLng {
  latitude: number;
  longitude: number;
}

// Driver types
export interface Driver {
  id: string;
  name: string;
  vehicleType: 'e-rickshaw' | 'auto';
  phoneNumber: string;
  rating: number;
  location: LatLng;
  isOnline: boolean;
}

// Ride types
export interface RideRequest {
  id: string;
  userId: string;
  userName: string;
  pickupLocation: LatLng;
  dropLocation: LatLng;
  distanceKm: number;
  fareEstimate: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  driverId?: string;
  driverName?: string;
}

export interface Ride {
  id: string;
  userId: string;
  driverId: string;
  pickupLocation: LatLng;
  dropLocation: LatLng;
  distanceKm: number;
  actualFare: number;
  commission: number;
  timestamp: number;
}

// Language/Translation types
export type Translations = {
  [key: string]: string;
};

export type LanguageContextType = {
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  translations: Translations;
};

// Gemini API related types (if any specific response formats are needed)
export interface GeminiApiResponse {
  // Define structure of Gemini response if parsing a specific JSON format
  text: string;
}
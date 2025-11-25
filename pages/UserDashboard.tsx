import React, { useState, useEffect, useCallback } from 'react';
import { LatLng, Driver, RideRequest } from '../types';
import { getUserLocation } from '../services/geolocationService';
import {
  fetchNearbyDrivers,
  createRideRequest,
} from '../services/driverService';
import Card from '../components/Card';
import Button from '../components/Button';
import DriverCard from '../components/DriverCard';
import MapComponent from '../components/MapComponent';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  PER_KM_RATE,
  MINIMUM_FARE,
  API_SIMULATION_DELAY_LONG,
} from '../constants';
import { getGeminiResponse, getMockGeminiResponse } from '../services/geminiService'; // Using mock for simplicity

const UserDashboard: React.FC = () => {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [nearbyDrivers, setNearbyDrivers] = useState<
    { driver: Driver; distanceKm: number }[]
  >([]);
  const [isFindingDrivers, setIsFindingDrivers] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [pickupLocation, setPickupLocation] = useState<string>('');
  const [dropLocation, setDropLocation] = useState<string>('');
  const [fareEstimate, setFareEstimate] = useState<number | null>(null);
  const [bookingConfirmation, setBookingConfirmation] = useState<string | null>(
    null,
  );
  const [isConfirmingBooking, setIsConfirmingBooking] = useState<boolean>(false);

  const [geminiPrompt, setGeminiPrompt] = useState<string>('');
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
  const [isAskingGemini, setIsAskingGemini] = useState<boolean>(false);

  const { user } = useAuth();
  const { translations } = useLanguage();

  const handleGetLocation = useCallback(async () => {
    setError(null);
    try {
      const location = await getUserLocation();
      setUserLocation(location);
    } catch (e: unknown) {
      if ((e as any).code === 1) {
        setError(translations.geolocationBlocked);
      } else {
        setError(`${translations.geolocationError} ${(e as Error).message}`);
      }
      console.error('Geolocation Error:', e);
    }
  }, [translations.geolocationBlocked, translations.geolocationError]);

  const handleFindDrivers = useCallback(async () => {
    if (!userLocation) {
      alert('Please enable location services to find nearby drivers.');
      return;
    }
    setIsFindingDrivers(true);
    try {
      const drivers = await fetchNearbyDrivers(userLocation);
      setNearbyDrivers(drivers);
    } catch (e: unknown) {
      setError(`Error finding drivers: ${(e as Error).message}`);
    } finally {
      setIsFindingDrivers(false);
    }
  }, [userLocation]);

  useEffect(() => {
    handleGetLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openBookingModal = (driverId: string) => {
    setSelectedDriverId(driverId);
    setPickupLocation(
      `Lat: ${userLocation?.latitude.toFixed(4)}, Lon: ${userLocation?.longitude.toFixed(4)}`,
    ); // Pre-fill with user's current location
    setDropLocation('');
    setFareEstimate(null);
    setBookingConfirmation(null);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedDriverId(null);
  };

  const handleCalculateFare = () => {
    // Simulate distance calculation for demo purposes
    const distanceKm = Math.floor(Math.random() * 10) + 3; // 3-12 km random distance
    const estimatedFare = Math.max(MINIMUM_FARE, distanceKm * PER_KM_RATE);
    setFareEstimate(estimatedFare);
  };

  const handleConfirmBooking = async () => {
    if (
      !user ||
      !selectedDriverId ||
      !userLocation ||
      !pickupLocation ||
      !dropLocation ||
      !fareEstimate
    ) {
      alert('Missing information for booking.');
      return;
    }

    setIsConfirmingBooking(true);
    try {
      // For demo, use random LatLng for drop, and fixed distance
      const distanceKm = Math.floor(Math.random() * 10) + 3; // 3-12 km random distance
      const mockDropLocation: LatLng = {
        latitude: userLocation.latitude + (Math.random() - 0.5) * 0.05,
        longitude: userLocation.longitude + (Math.random() - 0.5) * 0.05,
      };

      const rideRequest: RideRequest = await createRideRequest(
        user.id,
        user.phoneNumber, // Using phone number as user name for simplicity
        userLocation,
        mockDropLocation,
        distanceKm,
        fareEstimate,
        selectedDriverId,
      );
      setBookingConfirmation(
        `${translations.rideConfirmed}! ${translations.fareEstimate}: ₹${rideRequest.fareEstimate}. ${translations.status}: ${rideRequest.status}`,
      );
    } catch (e: unknown) {
      setBookingConfirmation(`Booking failed: ${(e as Error).message}`);
    } finally {
      setIsConfirmingBooking(false);
      setTimeout(closeBookingModal, API_SIMULATION_DELAY_LONG); // Close after a delay
    }
  };

  const handleAskGemini = async () => {
    if (!geminiPrompt.trim()) return;
    setIsAskingGemini(true);
    setGeminiResponse(null);
    try {
      // Use getMockGeminiResponse for local dev, switch to getGeminiResponse for actual API
      const response = await getMockGeminiResponse(geminiPrompt);
      setGeminiResponse(response);
    } catch (e: unknown) {
      setGeminiResponse(`Error: ${(e as Error).message}`);
    } finally {
      setIsAskingGemini(false);
    }
  };

  return (
    <div className="container mx-auto py-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">
        {translations.welcome}, {user?.phoneNumber}!
      </h2>

      {error && (
        <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Location and Map */}
        <Card title={translations.yourCurrentLocation}>
          <div className="mb-4">
            {userLocation ? (
              <p className="text-gray-700 dark:text-gray-300">
                Lat: {userLocation.latitude.toFixed(6)}, Lon:{' '}
                {userLocation.longitude.toFixed(6)}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                {translations.loading}...
              </p>
            )}
          </div>
          <MapComponent
            userLocation={userLocation}
            drivers={nearbyDrivers.map((d) => d.driver)}
          />
          <Button
            onClick={handleFindDrivers}
            isLoading={isFindingDrivers}
            disabled={!userLocation}
            className="w-full mt-4"
          >
            {translations.findNearbyRickshaw}
          </Button>
        </Card>

        {/* Nearby Drivers */}
        <Card title={translations.nearbyDrivers}>
          {isFindingDrivers && (
            <p className="text-center text-gray-500 dark:text-gray-400">
              {translations.loading}...
            </p>
          )}
          {!isFindingDrivers && nearbyDrivers.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No drivers found nearby.
            </p>
          )}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {nearbyDrivers.map(({ driver, distanceKm }) => (
              <DriverCard
                key={driver.id}
                driver={driver}
                distanceKm={distanceKm}
                onBookRide={openBookingModal}
              />
            ))}
          </div>
        </Card>

        {/* Ask Gemini Feature */}
        <Card title={translations.askGemini} className="lg:col-span-2">
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-2"
            rows={3}
            placeholder={translations.askAnything}
            value={geminiPrompt}
            onChange={(e) => setGeminiPrompt(e.target.value)}
            disabled={isAskingGemini}
          ></textarea>
          <Button
            onClick={handleAskGemini}
            isLoading={isAskingGemini}
            disabled={!geminiPrompt.trim()}
            className="w-full"
          >
            {isAskingGemini ? translations.gettingAnswer : translations.askGemini}
          </Button>
          {geminiResponse && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md shadow-inner text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              <strong>Gemini:</strong> {geminiResponse}
            </div>
          )}
        </Card>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={closeBookingModal}
        title={translations.confirmBooking}
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="pickup"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {translations.pickupLocation}
            </label>
            <input
              type="text"
              id="pickup"
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              disabled={isConfirmingBooking}
            />
          </div>
          <div>
            <label
              htmlFor="drop"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {translations.dropLocation}
            </label>
            <input
              type="text"
              id="drop"
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={dropLocation}
              onChange={(e) => setDropLocation(e.target.value)}
              disabled={isConfirmingBooking}
            />
          </div>
          <Button
            onClick={handleCalculateFare}
            variant="secondary"
            disabled={!dropLocation.trim() || isConfirmingBooking}
          >
            {translations.fareEstimate}
          </Button>
          {fareEstimate && (
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">
              {translations.fareEstimate}: ₹{fareEstimate}
            </p>
          )}

          {bookingConfirmation && (
            <p className="mt-4 p-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded">
              {bookingConfirmation}
            </p>
          )}

          <Button
            onClick={handleConfirmBooking}
            isLoading={isConfirmingBooking}
            disabled={!fareEstimate || isConfirmingBooking}
            className="w-full"
          >
            {translations.confirmBooking}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UserDashboard;
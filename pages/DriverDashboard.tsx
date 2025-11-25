import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  updateDriverOnlineStatus,
  getIncomingRideRequests,
  acceptRideRequest,
  rejectRideRequest,
  getDriverById,
  _simulateUserRideRequest, // For simulating requests
} from '../services/driverService';
import Card from '../components/Card';
import Button from '../components/Button';
import { RideRequest } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { API_SIMULATION_DELAY_LONG } from '../constants';

const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const { translations } = useLanguage();
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [incomingRequests, setIncomingRequests] = useState<RideRequest[]>([]);
  const [processingRequest, setProcessingRequest] = useState<string | null>(
    null,
  );

  const fetchDriverStatus = useCallback(async () => {
    if (user?.id) {
      setLoadingStatus(true);
      const driver = await getDriverById(user.id);
      if (driver) {
        setIsOnline(driver.isOnline);
      }
      setLoadingStatus(false);
    }
  }, [user?.id]);

  const fetchRequests = useCallback(async () => {
    if (user?.id && isOnline) {
      const requests = await getIncomingRideRequests(user.id);
      setIncomingRequests(requests);
    } else {
      setIncomingRequests([]);
    }
  }, [user?.id, isOnline]);

  useEffect(() => {
    fetchDriverStatus();
  }, [fetchDriverStatus]);

  useEffect(() => {
    let requestInterval: number;
    if (user && isOnline) {
      fetchRequests(); // Initial fetch
      requestInterval = window.setInterval(fetchRequests, 5000); // Poll for new requests every 5 seconds
    } else {
      setIncomingRequests([]); // Clear requests if offline
    }
    return () => {
      if (requestInterval) clearInterval(requestInterval);
    };
  }, [user, isOnline, fetchRequests]);

  const handleToggleOnlineStatus = async () => {
    if (!user) return;
    setLoadingStatus(true);
    try {
      const success = await updateDriverOnlineStatus(user.id, !isOnline);
      if (success) {
        setIsOnline(!isOnline);
      } else {
        alert('Failed to update online status.');
      }
    } catch (e: unknown) {
      alert(`Error: ${(e as Error).message}`);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleAcceptReject = async (
    requestId: string,
    action: 'accept' | 'reject',
  ) => {
    if (!user) return;
    setProcessingRequest(requestId);
    try {
      if (action === 'accept') {
        await acceptRideRequest(requestId, user.id, user.phoneNumber);
      } else {
        await rejectRideRequest(requestId, user.id);
      }
      // Re-fetch requests after action
      await new Promise((resolve) => setTimeout(resolve, API_SIMULATION_DELAY_LONG)); // Simulate backend processing
      fetchRequests();
    } catch (e: unknown) {
      alert(`Error processing request: ${(e as Error).message}`);
    } finally {
      setProcessingRequest(null);
    }
  };

  // Simulate incoming requests for demo
  const simulateRequest = useCallback(() => {
    if (user && isOnline) {
      _simulateUserRideRequest(
        'mock-user',
        'Mock User',
        { latitude: 28.61, longitude: 77.2 },
        { latitude: 28.65, longitude: 77.25 },
        5,
        100,
      );
    } else {
        alert("Driver must be online to simulate requests.")
    }
  }, [user, isOnline]);


  return (
    <div className="container mx-auto py-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">
        {translations.welcome}, {user?.phoneNumber}!
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Online Status Card */}
        <Card title={translations.status}>
          <div className="flex flex-col items-center">
            <p className="text-xl font-semibold mb-4">
              {isOnline ? (
                <span className="text-green-600 dark:text-green-400">
                  {translations.online}
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400">
                  {translations.offline}
                </span>
              )}
            </p>
            <Button
              onClick={handleToggleOnlineStatus}
              isLoading={loadingStatus}
              variant={isOnline ? 'danger' : 'primary'}
            >
              {isOnline
                ? `Go ${translations.offline}`
                : `Go ${translations.online}`}
            </Button>
            <Button onClick={simulateRequest} className="mt-4" variant="secondary" disabled={!isOnline}>
                Simulate Incoming Request
            </Button>
          </div>
        </Card>

        {/* Incoming Ride Requests Card */}
        <Card title={translations.incomingRideRequests}>
          {loadingStatus ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              {translations.loading}...
            </p>
          ) : !isOnline ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              Go online to receive requests.
            </p>
          ) : incomingRequests.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              {translations.noRequests}
            </p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {incomingRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-600"
                >
                  <p className="font-semibold text-blue-600 dark:text-blue-400">
                    User: {request.userName}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {translations.pickup}: Lat:{' '}
                    {request.pickupLocation.latitude.toFixed(4)}, Lon:{' '}
                    {request.pickupLocation.longitude.toFixed(4)}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {translations.drop}: Lat:{' '}
                    {request.dropLocation.latitude.toFixed(4)}, Lon:{' '}
                    {request.dropLocation.longitude.toFixed(4)}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {translations.distance}: {request.distanceKm.toFixed(1)}{' '}
                    km
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {translations.fareEstimate}: ₹{request.fareEstimate}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={() => handleAcceptReject(request.id, 'accept')}
                      isLoading={processingRequest === request.id}
                      disabled={processingRequest !== null}
                      variant="primary"
                    >
                      {translations.accept}
                    </Button>
                    <Button
                      onClick={() => handleAcceptReject(request.id, 'reject')}
                      isLoading={processingRequest === request.id}
                      disabled={processingRequest !== null}
                      variant="danger"
                    >
                      {translations.reject}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DriverDashboard;
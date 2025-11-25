import { Driver, LatLng, RideRequest, Ride } from '../types';
import { API_SIMULATION_DELAY_SHORT, DRIVER_SEARCH_RADIUS_KM, COMMISSION_PER_RIDE } from '../constants';

// --- Mock Data ---
const mockDrivers: Driver[] = [
  {
    id: 'd1',
    name: 'Ravi Kumar',
    vehicleType: 'e-rickshaw',
    phoneNumber: '9876543210',
    rating: 4.5,
    location: { latitude: 28.625, longitude: 77.215 }, // Near a common point in Delhi
    isOnline: true,
  },
  {
    id: 'd2',
    name: 'Priya Sharma',
    vehicleType: 'auto',
    phoneNumber: '9876543211',
    rating: 4.8,
    location: { latitude: 28.630, longitude: 77.220 },
    isOnline: true,
  },
  {
    id: 'd3',
    name: 'Amit Singh',
    vehicleType: 'e-rickshaw',
    phoneNumber: '9876543212',
    rating: 4.2,
    location: { latitude: 28.610, longitude: 77.205 },
    isOnline: false, // Offline
  },
  {
    id: 'd4',
    name: 'Sunita Devi',
    vehicleType: 'auto',
    phoneNumber: '9876543213',
    rating: 4.9,
    location: { latitude: 28.640, longitude: 77.230 },
    isOnline: true,
  },
];

let mockRideRequests: RideRequest[] = [];
let mockCompletedRides: Ride[] = [];

// --- Helper Functions ---
/**
 * Calculates distance between two LatLng points using Haversine formula.
 * Returns distance in kilometers.
 */
function calculateDistance(loc1: LatLng, loc2: LatLng): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (loc2.latitude - loc1.latitude) * (Math.PI / 180);
  const dLon = (loc2.longitude - loc1.longitude) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.latitude * (Math.PI / 180)) *
      Math.cos(loc2.latitude * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

// --- Driver-related Services ---

export const fetchNearbyDrivers = async (
  userLocation: LatLng,
): Promise<{ driver: Driver; distanceKm: number }[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const availableDrivers = mockDrivers.filter((d) => d.isOnline);
      const driversWithDistance = availableDrivers
        .map((driver) => {
          const distanceKm = calculateDistance(userLocation, driver.location);
          return { driver, distanceKm };
        })
        .filter((item) => item.distanceKm <= DRIVER_SEARCH_RADIUS_KM)
        .sort((a, b) => a.distanceKm - b.distanceKm); // Sort by distance

      resolve(driversWithDistance);
    }, API_SIMULATION_DELAY_SHORT);
  });
};

export const updateDriverOnlineStatus = async (
  driverId: string,
  isOnline: boolean,
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const driverIndex = mockDrivers.findIndex((d) => d.id === driverId);
      if (driverIndex !== -1) {
        mockDrivers[driverIndex].isOnline = isOnline;
        console.log(`Driver ${driverId} status updated to ${isOnline}`);
        resolve(true);
      } else {
        reject(new Error('Driver not found.'));
      }
    }, API_SIMULATION_DELAY_SHORT);
  });
};

// Fix: Removed duplicate 'new' keyword.
export const getDriverById = async (driverId: string): Promise<Driver | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDrivers.find(d => d.id === driverId) || null);
    }, API_SIMULATION_DELAY_SHORT);
  });
}

// --- Ride Request/Booking Services (User-side) ---

export const createRideRequest = async (
  userId: string,
  userName: string,
  pickupLocation: LatLng,
  dropLocation: LatLng,
  distanceKm: number,
  fareEstimate: number,
  driverId: string,
): Promise<RideRequest> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRequest: RideRequest = {
        id: `ride-${Date.now()}`,
        userId,
        userName,
        pickupLocation,
        dropLocation,
        distanceKm,
        fareEstimate,
        status: 'pending',
        driverId,
      };
      mockRideRequests.push(newRequest);
      console.log('New ride request created:', newRequest);
      resolve(newRequest);
    }, API_SIMULATION_DELAY_SHORT);
  });
};

// --- Ride Request/Handling Services (Driver-side) ---

export const getIncomingRideRequests = async (
  driverId: string,
): Promise<RideRequest[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const requests = mockRideRequests.filter(
        (req) => req.driverId === driverId && req.status === 'pending',
      );
      resolve(requests);
    }, API_SIMULATION_DELAY_SHORT);
  });
};

export const acceptRideRequest = async (
  requestId: string,
  driverId: string,
  driverName: string,
): Promise<RideRequest | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const requestIndex = mockRideRequests.findIndex((req) => req.id === requestId && req.driverId === driverId);
      if (requestIndex !== -1) {
        mockRideRequests[requestIndex].status = 'accepted';
        mockRideRequests[requestIndex].driverName = driverName;
        console.log(`Ride request ${requestId} accepted by driver ${driverId}`);

        // Simulate immediate completion for simplicity in mock
        const acceptedRequest = mockRideRequests[requestIndex];
        const newRide: Ride = {
            id: `completed-${acceptedRequest.id}`,
            userId: acceptedRequest.userId,
            driverId: acceptedRequest.driverId!,
            pickupLocation: acceptedRequest.pickupLocation,
            dropLocation: acceptedRequest.dropLocation,
            distanceKm: acceptedRequest.distanceKm,
            actualFare: acceptedRequest.fareEstimate, // Use estimate as actual for mock
            commission: COMMISSION_PER_RIDE,
            timestamp: Date.now(),
        };
        mockCompletedRides.push(newRide);
        console.log('Ride completed and recorded:', newRide);

        // Remove the request from pending list
        mockRideRequests = mockRideRequests.filter(req => req.id !== requestId);

        resolve(acceptedRequest);
      } else {
        resolve(null); // Request not found or not for this driver
      }
    }, API_SIMULATION_DELAY_SHORT);
  });
};

export const rejectRideRequest = async (
  requestId: string,
  driverId: string,
): Promise<RideRequest | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const requestIndex = mockRideRequests.findIndex((req) => req.id === requestId && req.driverId === driverId);
      if (requestIndex !== -1) {
        mockRideRequests[requestIndex].status = 'rejected';
        console.log(`Ride request ${requestId} rejected by driver ${driverId}`);
        resolve(mockRideRequests[requestIndex]);
      } else {
        resolve(null); // Request not found or not for this driver
      }
    }, API_SIMULATION_DELAY_SHORT);
  });
};

// --- Admin Services ---

export const getAdminStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const totalRides = mockCompletedRides.length;
      const totalCommission = mockCompletedRides.reduce((sum, ride) => sum + ride.commission, 0);
      const activeDrivers = mockDrivers.filter(d => d.isOnline).length;
      const activeUsers = new Set(mockCompletedRides.map(r => r.userId)).size; // Unique users who completed rides

      resolve({
        totalRides,
        totalCommission,
        activeDrivers,
        activeUsers,
      });
    }, API_SIMULATION_DELAY_SHORT);
  });
};

// Mock function to simulate a ride request from an *unassigned* user
export const _simulateUserRideRequest = (
  userId: string,
  userName: string,
  pickupLocation: LatLng,
  dropLocation: LatLng,
  distanceKm: number,
  fareEstimate: number,
) => {
    // Find an online driver to assign to this request
    const onlineDriver = mockDrivers.find(d => d.isOnline);
    if (onlineDriver) {
        const newRequest: RideRequest = {
            id: `sim-ride-${Date.now()}`,
            userId,
            userName,
            pickupLocation,
            dropLocation,
            distanceKm,
            fareEstimate,
            status: 'pending',
            driverId: onlineDriver.id, // Assign to an online driver
        };
        mockRideRequests.push(newRequest);
        console.log('Simulated user ride request:', newRequest);
        return newRequest;
    } else {
        console.log('No online drivers to assign simulated request.');
        return null;
    }
}
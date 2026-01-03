
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase'; // Adjust path if needed
import { collection, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Default to New Delhi if location access is denied
const DEFAULT_CENTER = [28.6139, 77.2090];

export function useVehicleData(user) {
    const [userLocation, setUserLocation] = useState(DEFAULT_CENTER);
    const [vehicles, setVehicles] = useState([]);
    const [isLocating, setIsLocating] = useState(true);
    const [isDriver, setIsDriver] = useState(false); // Toggle for "Driver Mode"

    // 1. Get Real User Location
    useEffect(() => {
        if (!navigator.geolocation) {
            console.error("Geolocation is not supported by this browser.");
            setIsLocating(false);
            return;
        }

        const success = (position) => {
            const { latitude, longitude } = position.coords;
            const newLocation = [latitude, longitude];
            console.log("Got Location (initial):", newLocation); // Debugging
            setUserLocation(newLocation);
            setIsLocating(false);
        };

        const error = (err) => {
            console.warn("Geolocation error:", err);
            // Don't STOP trying, just log it. 
            // If we are completely blocked, isLocating will stay false eventually or we handle it.
            // But let's keep isLocating=false so the map at least shows *something* (Default)
            if (err.code === 1) alert("Location permission denied. Please enable GPS.");
            setIsLocating(false);
        };

        // Initial fetch - Aggressive
        navigator.geolocation.getCurrentPosition(success, error, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        });

        // Watch for updates - Aggressive (Targeting ~1 sec updates if hardware supports)
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const newLocation = [latitude, longitude];

                console.log("Got Location (watch):", newLocation); // Debugging for every position update
                // Update local state immediately
                setUserLocation(newLocation);

                // CRITICAL: Only publish if we are explicitly a driver AND have a user object
                if (isDriver && user) {
                    publishDriverLocation(newLocation, user);
                }
            },
            (err) => console.warn("Watch Position Error:", err),
            {
                enableHighAccuracy: true,
                maximumAge: 0,       // Force fresh reading
                timeout: 5000        // Timeout if no reading in 5s
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [isDriver, user]); // Re-run effect if driver mode toggles or user changes

    // 2. Publish Driver Location (Helper)
    const publishDriverLocation = async (coords, currentUser) => {
        if (!currentUser) return;
        // Double check requirement: We assume caller checked isDriver, but let's be safe.
        // Actually, we can't check 'isDriver' state here easily without passing it or relying on closure. 
        // The useEffect handles the condition.

        // Ensure we are not publishing invalid coords
        if (!coords || coords.length !== 2) return;

        const driverId = currentUser.uid;

        try {
            await setDoc(doc(db, "drivers", driverId), {
                id: driverId,
                name: "E-Rickshaw",
                driver: currentUser.displayName || "Unknown Driver",
                lat: coords[0],
                lng: coords[1],
                heading: 0,
                status: 'available',
                lastUpdated: serverTimestamp(),
                phone: currentUser.email || "+91 00000 00000",
                avatar: currentUser.photoURL || `https://i.pravatar.cc/150?u=${driverId}`,
                rating: "5.0"
            }, { merge: true });
        } catch (e) {
            console.error("Error publishing location:", e);
        }
    };

    // Helper: Haversine Distance (in km)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    // 3. Listen to Real Vehicles from Firestore
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "drivers"), (snapshot) => {
            const drivers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filter & Sort
            const processedDrivers = drivers
                .filter(d => d.id !== user?.uid) // Don't show myself
                .map(d => {
                    // Calc distance
                    const dist = calculateDistance(userLocation[0], userLocation[1], d.lat, d.lng);
                    return { ...d, distance: dist };
                })
                .filter(d => d.distance < 50) // Only show within 50km
                .sort((a, b) => a.distance - b.distance);

            setVehicles(processedDrivers);
        });

        return () => unsubscribe();
    }, [user, userLocation]); // Re-run if userLocation changes to re-calc distances

    const toggleDriverMode = () => {
        setIsDriver(prev => !prev);
    };

    return { vehicles, userLocation, isLocating, isDriver, toggleDriverMode };
}


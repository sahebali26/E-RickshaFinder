import { db } from "../lib/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, onSnapshot, orderBy } from "firebase/firestore";

export const requestRide = async (driverId, riderId, riderName, fromLocation, destination) => {
    try {
        const docRef = await addDoc(collection(db, "bookings"), {
            driverId,
            riderId,
            riderName,
            from: { lat: fromLocation[0], lng: fromLocation[1] },
            destination: destination || "Not specified",
            status: "pending", // pending, accepted, completed, cancelled
            timestamp: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error requesting ride:", error);
        throw error;
    }
};

export const updateRideStatus = async (bookingId, status) => {
    try {
        const bookingRef = doc(db, "bookings", bookingId);
        await updateDoc(bookingRef, { status });
    } catch (error) {
        console.error("Error updating ride status:", error);
    }
};

// Listen for rides requested BY the current user (Rider)
export const subscribeToRiderBookings = (riderId, callback) => {
    const q = query(
        collection(db, "bookings"),
        where("riderId", "==", riderId),
        orderBy("timestamp", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(bookings);
    });
};

// Listen for rides requested TO the current user (Driver)
export const subscribeToDriverBookings = (driverId, callback) => {
    const q = query(
        collection(db, "bookings"),
        where("driverId", "==", driverId),
        where("status", "==", "pending"),
        orderBy("timestamp", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(bookings);
    });
};

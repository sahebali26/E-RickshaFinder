import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export const getUserProfile = async (uid) => {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting user profile:", error);
        throw error;
    }
};

export const createUserProfile = async (uid, data) => {
    try {
        // data should ensure it has: role, name, phone, etc.
        // If role is 'driver', it should have vehicle details.
        await setDoc(doc(db, "users", uid), {
            ...data,
            id: uid,
            createdAt: new Date().toISOString()
        }, { merge: true });
    } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
    }
};

export const updateUserProfile = async (uid, data) => {
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, data);
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};

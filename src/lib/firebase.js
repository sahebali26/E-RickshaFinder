// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCeyki8uKDyTDzn2QLKR1EUROwxGDn2FG4",
    authDomain: "e-rickshaw-finder.firebaseapp.com",
    projectId: "e-rickshaw-finder",
    storageBucket: "e-rickshaw-finder.firebasestorage.app",
    messagingSenderId: "330393348990",
    appId: "1:330393348990:web:3a7d8e73a6a45f86f3e12f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

export const logout = () => signOut(auth);

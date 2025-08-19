// src/firebase.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithCustomToken, signInAnonymously } from "firebase/auth"; // Include what you need
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
// It's good practice to check if config is present before initializing
if (!firebaseConfig.apiKey) {
    console.error("Firebase config is missing or invalid. Check your .env file.");
    // You might throw an error or handle this more gracefully depending on your app
    throw new Error("Firebase config missing!");
}

const app = initializeApp(firebaseConfig);

// Get references to Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// You can also move your global auth state listener here or use React Context for it
// Example: This would manage the global user state
let currentUser = null;
let userId = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        userId = user.uid;
        // You could dispatch an event or update a global store here if needed
    } else {
        // Handle initial token or anonymous sign-in here if it's truly global app logic
        // This part might still be better in a context provider or specific hook
        try {
            const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
            if (token) {
                await signInWithCustomToken(auth, token);
            } else {
                await signInAnonymously(auth);
            }
        } catch (error) {
            console.error("Initial authentication failed:", error);
        }
    }
});

// You can export other utility functions or the initialized services
// export { app, auth, db }; // Or just export the services you need

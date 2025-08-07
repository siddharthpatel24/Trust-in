// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your Firebase project configuration
// Get this from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
   apiKey: "AIzaSyDnVA5ZcwbzXtaTN8s8u4jgrF-vvz3cQX4",
  authDomain: "trust-in-3dcee.firebaseapp.com",
  projectId: "trust-in-3dcee",
  storageBucket: "trust-in-3dcee.firebasestorage.app",
  messagingSenderId: "200400973666",
  appId: "1:200400973666:web:3776d4a27a251b5ba5463b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Auth (for future use)
export const auth = getAuth(app);

export default app;
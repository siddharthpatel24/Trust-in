import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDnVA5ZcwbzXtaTN8s8u4jgrF-vvz3cQX4",
  authDomain: "trust-in-3dcee.firebaseapp.com",
  projectId: "trust-in-3dcee",
  storageBucket: "trust-in-3dcee.firebasestorage.app",
  messagingSenderId: "200400973666",
  appId: "1:200400973666:web:3776d4a27a251b5ba5463b"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
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
apiKey: "AIzaSyDranJuEY3nGiMtGCnfygdNUDnKRkh5tUI",
  authDomain: "task-tracker-e3a15.firebaseapp.com",
  projectId: "task-tracker-e3a15",
  storageBucket: "task-tracker-e3a15.firebasestorage.app",
  messagingSenderId: "791283701471",
  appId: "1:791283701471:web:f2ffcfd0c67b9774aa3b6a",
  measurementId: "G-HF38EGH52B"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
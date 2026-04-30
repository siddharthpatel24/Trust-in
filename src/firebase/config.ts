import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // apiKey: "AIzaSyDnVA5ZcwbzXtaTN8s8u4jgrF-vvz3cQX4",
  // authDomain: "trust-in-3dcee.firebaseapp.com",
  // projectId: "trust-in-3dcee",
  // storageBucket: "trust-in-3dcee.firebasestorage.app",
  // messagingSenderId: "200400973666",
  // appId: "1:200400973666:web:3776d4a27a251b5ba5463b"
  apiKey: "AIzaSyCcg3Ub2PsVUm5mFgucVndqheIP7KA-PUk",
  authDomain: "roomfund-4cf22.firebaseapp.com",
  projectId: "roomfund-4cf22",
  storageBucket: "roomfund-4cf22.firebasestorage.app",
  messagingSenderId: "661967014609",
  appId: "1:661967014609:web:306c97374edd5acb23d3f0",
  measurementId: "G-W0MHDXHDQ5"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
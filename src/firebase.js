import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCCOeSG6YBMX_SYOYEeVoDCp43MJFDXayc",
  authDomain: "moviehub-31dc7.firebaseapp.com",
  projectId: "moviehub-31dc7",
  storageBucket: "moviehub-31dc7.firebasestorage.app",
  messagingSenderId: "642984020198",
  appId: "1:642984020198:web:40a17c48ac1730e29ed327",
  measurementId: "G-TR2WV0H5F7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification,
};

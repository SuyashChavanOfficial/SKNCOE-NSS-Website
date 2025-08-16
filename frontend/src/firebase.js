// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "skncoe-nss-website.firebaseapp.com",
  projectId: "skncoe-nss-website",
  storageBucket: "skncoe-nss-website.firebasestorage.app",
  messagingSenderId: "695450544728",
  appId: "1:695450544728:web:a62b0463772004be1e382d"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
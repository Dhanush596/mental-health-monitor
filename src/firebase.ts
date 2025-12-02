import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your specific configuration
const firebaseConfig = {
  apiKey: "AIzaSyCs5pOf7ZWCDWc4HmBxzmmWs_drtEifBT0",
  authDomain: "mental-health-monitor-62ace.firebaseapp.com",
  projectId: "mental-health-monitor-62ace",
  storageBucket: "mental-health-monitor-62ace.firebasestorage.app",
  messagingSenderId: "84547005158",
  appId: "1:84547005158:web:31d191a1b83065462c2927",
  measurementId: "G-HXL441ZHSL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the tools so the rest of the app can use them
export const auth = getAuth(app);
export const db = getFirestore(app);
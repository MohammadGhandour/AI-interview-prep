
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyApUYXLFbeSZbEx3FKOLtY5OSblF_D-JiY",
  authDomain: "moejob-c30c5.firebaseapp.com",
  projectId: "moejob-c30c5",
  storageBucket: "moejob-c30c5.firebasestorage.app",
  messagingSenderId: "162982658357",
  appId: "1:162982658357:web:b60297d99ce59db91b0c7c",
  measurementId: "G-8NS5Z09MZR"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

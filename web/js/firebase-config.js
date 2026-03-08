// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-analytics.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Your web app's Firebase configuration (Firebase JS SDK v7.20.0+)
const firebaseConfig = {
  apiKey: "AIzaSyAAyWyYrqnNF0AnCZr3J7P2j4SEeoiUdgw",
  authDomain: "smilegame-f0d54.firebaseapp.com",
  projectId: "smilegame-f0d54",
  storageBucket: "smilegame-f0d54.firebasestorage.app",
  messagingSenderId: "988340998472",
  appId: "1:988340998472:web:191e5786b13588c9d1637d",
  measurementId: "G-63VF99HCCD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Analytics optional – if it fails (e.g. ad blocker, wrong domain), auth still works
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  if (typeof console !== "undefined" && console.warn) {
    console.warn("[Firebase] Analytics not available:", e.message);
  }
}

if (typeof console !== "undefined" && console.debug) {
  console.debug("[Firebase] Using project:", firebaseConfig.projectId);
}

export {
  app,
  analytics,
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
};

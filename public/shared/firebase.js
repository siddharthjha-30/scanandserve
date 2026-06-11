// Firebase initialization — REPLACE the config below with your project values.
// Get them from Firebase console → Project settings → General → Your apps.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";

// TODO: replace with your Firebase project config
export const firebaseConfig = {
  apiKey: "AIzaSyDnKbgwOkAat76Q99T0GSxA9SiZ7Y8dIiI",
  authDomain: "scanandservebyqr.firebaseapp.com",
  projectId: "scanandservebyqr",
  storageBucket: "scanandservebyqr.firebasestorage.app",
  messagingSenderId: "83710558060",
  appId: "1:83710558060:web:09f7334051e6249159fd49",
  measurementId: "G-MNL21TMDL0",
};

let app;
try {
  app = initializeApp(firebaseConfig);
} catch (e) {
  console.warn(
    "[firebase] init failed — using stub config. Replace firebaseConfig in shared/firebase.js.",
    e,
  );
}

export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
export const functions = app ? getFunctions(app) : null;
export { app };

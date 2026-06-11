import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from "./firebase.js";

export const signInEmail = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
export const signUpEmail = (email, pw) => createUserWithEmailAndPassword(auth, email, pw);
export const signInGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
export const signOutUser = () => signOut(auth);

export function onUser(cb) {
  if (!auth) { cb(null); return () => {}; }
  return onAuthStateChanged(auth, cb);
}

export async function loadUserRole(uid) {
  if (!db) return null;
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  
  const data = snap.data();
  // Fetch restaurant name if restaurant_id exists
  if (data.restaurant_id) {
    try {
      const restSnap = await getDoc(doc(db, "restaurants", data.restaurant_id));
      if (restSnap.exists() && restSnap.data().name) {
        data.restaurant_name = restSnap.data().name;
      }
    } catch (e) {
      console.warn("Failed to load restaurant name", e);
    }
  }
  
  return data;
}

export function requireSignedIn(redirectTo = "/admin/index.html") {
  return new Promise((resolve) => {
    onUser((u) => {
      if (!u) window.location.href = redirectTo;
      else resolve(u);
    });
  });
}
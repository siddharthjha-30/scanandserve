import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const fallbackConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo.firebaseapp.com',
  projectId: 'demo-project',
};

const app = initializeApp(globalThis.__SCANANDSERVE_FIREBASE_CONFIG || fallbackConfig);
export const db = getFirestore(app);

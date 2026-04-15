import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyCMmJxRBl0aJGPm1S0s8IJBHvbzNla2r4Y",
  authDomain: "ryan-shee.firebaseapp.com",
  projectId: "ryan-shee",
  storageBucket: "ryan-shee.firebasestorage.app",
  messagingSenderId: "707569392769",
  appId: "1:707569392769:web:116c476bd308b82ffe8180",
  measurementId: "G-DM6QDVNMPE",
};

const app = initializeApp(firebaseConfig);

initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6Le3j-srAAAAAHHagksjgGpnu83FlSeZYaIrilWx"),
  isTokenAutoRefreshEnabled: true,
});

export const db = getFirestore(app);

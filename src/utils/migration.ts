import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  writeBatch,
} from "firebase/firestore";

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
const db = getFirestore(app);

async function migrateCrews() {
  const oldDocRef = doc(db, "dragon-boat", "crews");
  const snapshot = await getDoc(oldDocRef);

  if (!snapshot.exists()) {
    console.error("No existing crews document found.");
    return;
  }

  const oldData = snapshot.data();
  const batch = writeBatch(db);
  let count = 0;

  for (const [id, crew] of Object.entries(oldData)) {
    const newDocRef = doc(collection(db, "crews"), id);
    batch.set(newDocRef, crew);
    count++;
  }

  await batch.commit();
  console.log(`✅ Migrated ${count} crews successfully!`);
}

migrateCrews().catch(console.error);

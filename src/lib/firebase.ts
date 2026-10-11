import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

// De web-config van Firebase is geen geheim: beveiliging zit in de
// Firestore-rules (zie firestore.rules in de repo).
const firebaseConfig = {
  projectId: "actieplatform-politiegeweld",
  appId: "1:475089349106:web:d1a5a135eedb7c4dd4a36b",
  storageBucket: "actieplatform-politiegeweld.firebasestorage.app",
  apiKey: "AIzaSyBxgWg9ADULM4-tYrenaRjNoW7-IuLMMo8",
  authDomain: "actieplatform-politiegeweld.firebaseapp.com",
  messagingSenderId: "475089349106",
};

export function getFirebaseApp(): FirebaseApp {
  return getApps()[0] ?? initializeApp(firebaseConfig);
}

export function getDb(): Firestore {
  // Eigen database-id in plaats van "(default)": die vraagt op dit gratis
  // project om billing, en dat willen we niet.
  return getFirestore(getFirebaseApp(), "default");
}

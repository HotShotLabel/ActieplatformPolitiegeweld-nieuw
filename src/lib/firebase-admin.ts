import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/* Alleen server-side gebruiken (API-routes). De sleutel staat als
   base64-JSON in de env-variabele FIREBASE_SERVICE_ACCOUNT. */

function serviceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT ontbreekt");
  }
  return JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
}

export function getAdminDb(): Firestore {
  const app =
    getApps()[0] ?? initializeApp({ credential: cert(serviceAccount()) });
  // Eigen database-id "default" (niet "(default)"), zie README.
  return getFirestore(app, "default");
}

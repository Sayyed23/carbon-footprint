import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if we should use mock localStorage mode
export let isMockMode = typeof window !== "undefined" && (
  process.env.NEXT_PUBLIC_USE_EMULATORS === "mock" ||
  !firebaseConfig.apiKey ||
  firebaseConfig.apiKey.includes("FakeKey")
);

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

if (typeof window !== "undefined" && !isMockMode) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === "true";
    if (useEmulators && !(auth as any)._emulatorActivated) {
      (auth as any)._emulatorActivated = true;
      const host = "127.0.0.1";
      connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
      connectFirestoreEmulator(db, host, 8080);
      connectStorageEmulator(storage, host, 9199);
      console.log("🔥 Connected to Firebase Emulators at", host);
    }
  } catch (error) {
    console.error("Firebase failed to initialize. Falling back to Mock Mode.", error);
    isMockMode = true;
  }
}

export { app, auth, db, storage };

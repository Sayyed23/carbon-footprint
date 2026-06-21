import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, Firestore } from "firebase/firestore";
import { getStorage, connectStorageEmulator, FirebaseStorage } from "firebase/storage";

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

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (typeof window !== "undefined" && !isMockMode) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === "true";
    if (useEmulators && !(auth as unknown as { _emulatorActivated?: boolean })._emulatorActivated) {
      (auth as unknown as { _emulatorActivated?: boolean })._emulatorActivated = true;
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

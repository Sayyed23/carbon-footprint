import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  UserCredential
} from "firebase/auth";
import { auth, isMockMode } from "./config";

// Interface for simulated user
export interface MockUser {
  uid: string;
  email: string;
  password?: string;
}

// Interface for simulated user credential return
export interface MockUserCredential {
  user: {
    uid: string;
    email: string;
  };
}

/**
 * Custom event dispatcher to notify AuthProvider client-side on mock auth state changes.
 */
export function notifyMockAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mock-auth-changed"));
  }
}

/**
 * Registers a new user account (Firebase Auth or Mock LocalStorage).
 */
export async function signUpUser(email: string, password: string): Promise<MockUserCredential | UserCredential> {
  if (isMockMode) {
    if (typeof window === "undefined") throw new Error("Window is undefined");
    
    const registered = localStorage.getItem("mock_registered_users");
    const users: MockUser[] = registered ? JSON.parse(registered) : [];
    
    const exists = users.find((u: MockUser) => u.email === email);
    if (exists) {
      const err = new Error("This email is already in use.");
      Object.assign(err, { code: "auth/email-already-in-use" });
      throw err;
    }
    
    const uid = `usr_${Math.random().toString(36).substring(2, 11)}`;
    const newUser = { uid, email, password };
    users.push(newUser);
    
    localStorage.setItem("mock_registered_users", JSON.stringify(users));
    localStorage.setItem("mock_current_user", JSON.stringify(newUser));
    notifyMockAuthChange();
    
    return { user: { uid, email } } as MockUserCredential;
  }
  
  if (!auth) throw new Error("Firebase Auth is not initialized");
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Authenticates an existing user account (Firebase Auth or Mock LocalStorage).
 */
export async function signInUser(email: string, password: string): Promise<MockUserCredential | UserCredential> {
  if (isMockMode) {
    if (typeof window === "undefined") throw new Error("Window is undefined");
    
    const registered = localStorage.getItem("mock_registered_users");
    const users: MockUser[] = registered ? JSON.parse(registered) : [];
    
    const user = users.find((u: MockUser) => u.email === email && u.password === password);
    if (!user) {
      const err = new Error("Invalid credentials.");
      Object.assign(err, { code: "auth/invalid-credential" });
      throw err;
    }
    
    localStorage.setItem("mock_current_user", JSON.stringify(user));
    notifyMockAuthChange();
    
    return { user: { uid: user.uid, email: user.email } } as MockUserCredential;
  }
  
  if (!auth) throw new Error("Firebase Auth is not initialized");
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Authenticates via Google Sign-In (Firebase Auth or Mock LocalStorage).
 */
export async function signInWithGoogle(): Promise<MockUserCredential | UserCredential> {
  if (isMockMode) {
    if (typeof window === "undefined") throw new Error("Window is undefined");
    
    const uid = "usr_google_mock";
    const email = "google_user@gmail.com";
    const googleUser = { uid, email };
    
    localStorage.setItem("mock_current_user", JSON.stringify(googleUser));
    notifyMockAuthChange();
    
    return { user: { uid, email } } as MockUserCredential;
  }
  
  if (!auth) throw new Error("Firebase Auth is not initialized");
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

/**
 * Logs out the active user session (Firebase Auth or Mock LocalStorage).
 */
export async function logoutUser(): Promise<void> {
  if (isMockMode) {
    if (typeof window === "undefined") return;
    localStorage.removeItem("mock_current_user");
    notifyMockAuthChange();
    return;
  }
  
  if (!auth) throw new Error("Firebase Auth is not initialized");
  return signOut(auth);
}

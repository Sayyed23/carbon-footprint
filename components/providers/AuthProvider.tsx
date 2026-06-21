"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, isMockMode } from "@/lib/firebase/config";
import { getUserProfile, UserProfile } from "@/lib/firebase/db";

interface AuthContextType {
  user: { uid: string; email: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ uid: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (uid: string) => {
    try {
      const userProfile = await getUserProfile(uid);
      setProfile(userProfile);
    } catch (error) {
      console.error("Error fetching user profile in auth provider:", error);
    }
  };

  useEffect(() => {
    if (isMockMode) {
      // Mock Authentication Listener via local storage
      const checkMockAuth = async () => {
        const session = localStorage.getItem("mock_current_user");
        if (session) {
          const parsedUser = JSON.parse(session);
          setUser({ uid: parsedUser.uid, email: parsedUser.email });
          await fetchProfile(parsedUser.uid);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      };

      checkMockAuth();

      // Listen to auth changes dispatched from authService
      window.addEventListener("mock-auth-changed", checkMockAuth);
      return () => {
        window.removeEventListener("mock-auth-changed", checkMockAuth);
      };
    } else {
      // Standard Firebase Authentication
      if (!auth) {
        setLoading(false);
        return;
      }
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          setUser({ uid: currentUser.uid, email: currentUser.email || "" });
          await fetchProfile(currentUser.uid);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  const refreshProfile = async () => {
    if (user) {
      setLoading(true);
      await fetchProfile(user.uid);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

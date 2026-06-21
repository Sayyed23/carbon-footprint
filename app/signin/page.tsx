"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { signInUser, signInWithGoogle } from "@/lib/firebase/authService";
import { Leaf, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signInUser(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as Error & { code?: string };
      console.error("Login error:", error);
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        setError("Invalid email address or password.");
      } else {
        setError(error.message || "An error occurred during authentication.");
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Google login error:", error);
      setError(error.message || "Google Sign-In failed.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md glass p-8 rounded-3xl shadow-xl relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

          {/* Heading */}
          <div className="text-center mb-6">
            <span className="p-2 bg-primary/10 text-primary rounded-full inline-block mb-2">
              <Leaf className="h-6 w-6" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Sign in to EcoTrace</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back! Continue tracking your sustainability goals.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <label
                  className="text-xs font-bold text-muted-foreground uppercase"
                  htmlFor="email"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label
                  className="text-xs font-bold text-muted-foreground uppercase"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-6"
            >
              <span>{loading ? "Signing In..." : "Sign In"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Social Sign In */}
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-3 text-muted-foreground text-xs font-semibold uppercase">
              Or continue with
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-border bg-card hover:bg-muted py-2.5 rounded-full text-sm font-semibold transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.94 5.94 0 0 1 8 12.63a5.94 5.94 0 0 1 5.99-5.89c1.55 0 2.96.59 4.05 1.556l3.076-3.078A10.02 10.02 0 0 0 13.99 2C8.47 2 4 6.47 4 12s4.47 10 9.99 10c5.77 0 9.77-4.06 9.77-9.93 0-.618-.052-1.22-.153-1.785H12.24z"
              />
            </svg>
            <span>Google Account</span>
          </button>

          <div className="text-center mt-6 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Create one now
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

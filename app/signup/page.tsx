"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { signUpUser, signInWithGoogle } from "@/lib/firebase/authService";
import { saveUserProfile, addActivity, UserProfile } from "@/lib/firebase/db";
import {
  Leaf,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Utensils,
  Users,
} from "lucide-react";
import { DEFAULT_EMISSION_FACTORS } from "@/lib/emissions/engine";

interface GuestCalculations {
  state: string;
  commuteMode: keyof typeof DEFAULT_EMISSION_FACTORS.transport;
  commuteDistance: number;
  electricityBill: number;
  dietType: UserProfile["dietType"];
  householdSize: number;
  calculatedResults: {
    transport: number;
    electricity: number;
    diet: number;
    cooking: number;
    total: number;
  };
}

function SignUpForm() {
  const router = useRouter();

  // Account Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Profile Form State (used if no guest calculator data exists)
  const [state, setState] = useState("Maharashtra");
  const [dietType, setDietType] = useState<UserProfile["dietType"]>("vegetarian");
  const [householdSize, setHouseholdSize] = useState(4);

  const [hasGuestData, setHasGuestData] = useState(false);
  const [guestData, setGuestData] = useState<GuestCalculations | null>(null);

  const statesList = Object.keys(DEFAULT_EMISSION_FACTORS.electricity.byState).sort();

  useEffect(() => {
    // Check if guest calculation data is stored
    const data = sessionStorage.getItem("guestCalculations");
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasGuestData(true);
      setGuestData(JSON.parse(data) as GuestCalculations);
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all account fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userCredential = await signUpUser(email, password);
      const uid = userCredential.user.uid;
      await initializeUserProfileAndData(uid);
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as Error & { code?: string };
      console.error("Signup error:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("This email address is already registered.");
      } else {
        setError(error.message || "An error occurred during registration.");
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      const uid = result.user.uid;
      await initializeUserProfileAndData(uid);
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Google signin error:", error);
      setError(error.message || "Google Sign-In failed.");
      setLoading(false);
    }
  };

  const initializeUserProfileAndData = async (uid: string) => {
    let userState = state;
    let userDiet = dietType;
    let userHousehold = householdSize;

    if (hasGuestData && guestData) {
      userState = guestData.state;
      userDiet = guestData.dietType;
      userHousehold = guestData.householdSize;
    }

    // 1. Create User Profile
    await saveUserProfile(uid, {
      city: "",
      state: userState,
      dietType: userDiet,
      householdSize: userHousehold,
      createdAt: new Date(),
    });

    // 2. If guest calculations exist, migrate them as initial daily logs
    if (hasGuestData && guestData && guestData.calculatedResults) {
      const results = guestData.calculatedResults;
      const today = new Date();

      // Divide weekly transport to a single day log
      await addActivity(uid, {
        category: "transport",
        subType: guestData.commuteMode,
        quantity: Math.round(guestData.commuteDistance / 7),
        unit: "km",
        co2eKg: Number((results.transport / 365).toFixed(2)),
        source: "manual",
        factorVersion: DEFAULT_EMISSION_FACTORS.version,
        loggedAt: today,
        note: "Initial commute log migrated from onboarding calculator",
      });

      // Log daily electricity
      await addActivity(uid, {
        category: "electricity",
        subType: "grid",
        quantity: Number((guestData.electricityBill / 7.5 / 30).toFixed(1)),
        unit: "kWh",
        co2eKg: Number((results.electricity / 365).toFixed(2)),
        source: "manual",
        factorVersion: DEFAULT_EMISSION_FACTORS.version,
        loggedAt: today,
        note: "Initial electricity log migrated from onboarding calculator",
      });

      // Log daily cooking
      await addActivity(uid, {
        category: "cooking",
        subType: "lpg_cylinder",
        quantity: Number((10 / 365 / userHousehold).toFixed(3)),
        unit: "cylinder",
        co2eKg: Number((results.cooking / 365).toFixed(2)),
        source: "manual",
        factorVersion: DEFAULT_EMISSION_FACTORS.version,
        loggedAt: today,
        note: "Initial cooking fuel log migrated from onboarding calculator",
      });

      // Log daily diet
      await addActivity(uid, {
        category: "diet",
        subType: userDiet,
        quantity: 1,
        unit: "day",
        co2eKg: Number((results.diet / 365).toFixed(2)),
        source: "manual",
        factorVersion: DEFAULT_EMISSION_FACTORS.version,
        loggedAt: today,
        note: "Initial diet log migrated from onboarding calculator",
      });

      // Clear guest data from session storage
      sessionStorage.removeItem("guestCalculations");
    }
  };

  return (
    <div className="w-full max-w-md glass p-8 rounded-3xl shadow-xl relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      {/* Heading */}
      <div className="text-center mb-6">
        <span className="p-2 bg-primary/10 text-primary rounded-full inline-block mb-2">
          <Leaf className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Create your EcoTrace Account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {hasGuestData
            ? "Save your baseline calculation and unlock daily tracking"
            : "Start tracking and reducing your carbon footprint"}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Account Credentials */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase" htmlFor="email">
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
            <label className="text-xs font-bold text-muted-foreground uppercase" htmlFor="password">
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

        {/* Profile configuration (shown only if NO guest data exists) */}
        {!hasGuestData && (
          <div className="border-t border-border pt-4 mt-2 space-y-4">
            <span className="text-xs font-bold text-muted-foreground uppercase block">
              Profile Customization
            </span>

            <div className="space-y-1">
              <label htmlFor="pstate" className="flex items-center gap-1.5 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-primary" /> State
              </label>
              <select
                id="pstate"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {statesList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="pdiet" className="flex items-center gap-1.5 text-sm font-semibold">
                <Utensils className="h-4 w-4 text-primary" /> Diet Category
              </label>
              <select
                id="pdiet"
                value={dietType}
                onChange={(e) => setDietType(e.target.value as UserProfile["dietType"])}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian (Typical Indian)</option>
                <option value="eggetarian">Eggetarian</option>
                <option value="non_veg_low">Non-Vegetarian (Low Meat)</option>
                <option value="non_veg_high">Non-Vegetarian (High Meat)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="phousehold"
                className="flex items-center gap-1.5 text-sm font-semibold"
              >
                <Users className="h-4 w-4 text-primary" /> Household Size
              </label>
              <input
                id="phousehold"
                type="number"
                min="1"
                max="10"
                value={householdSize}
                onChange={(e) => setHouseholdSize(Number(e.target.value))}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {hasGuestData && guestData && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-start gap-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p>
              We detected your calculator results! Your baseline and profile state (
              <strong>{guestData.state}</strong>) will be migrated to your account profile
              automatically.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-6"
        >
          <span>{loading ? "Creating Account..." : "Create Account"}</span>
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

      {/* Redirect to Login */}
      <div className="text-center mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/signin" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="w-full max-w-md glass p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center min-h-[400px]">
              <Leaf className="h-10 w-10 text-primary animate-bounce mb-3" />
              <p className="text-sm font-semibold tracking-wide text-muted-foreground animate-pulse">
                Loading registration...
              </p>
            </div>
          }
        >
          <SignUpForm />
        </Suspense>
      </main>
    </div>
  );
}

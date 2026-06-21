"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { saveUserProfile, getActivities, UserProfile } from "@/lib/firebase/db";
import { auth, db, isMockMode } from "@/lib/firebase/config";
import { deleteUser } from "firebase/auth";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { DEFAULT_EMISSION_FACTORS } from "@/lib/emissions/engine";
import Navbar from "@/components/Navbar";
import {
  User,
  MapPin,
  Utensils,
  Users,
  Download,
  Trash2,
  AlertTriangle,
  Check,
  Leaf,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  // Profile fields state
  const [state, setState] = useState("Maharashtra");
  const [dietType, setDietType] = useState<UserProfile["dietType"]>("vegetarian");
  const [householdSize, setHouseholdSize] = useState(4);

  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Danger zone confirmations
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const statesList = Object.keys(DEFAULT_EMISSION_FACTORS.electricity.byState).sort();

  useEffect(() => {
    if (profile) {
      const timer = setTimeout(() => {
        setState(profile.state);
        setDietType(profile.dietType);
        setHouseholdSize(profile.householdSize);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <span className="p-3 bg-primary/10 text-primary rounded-full animate-bounce mb-3">
          <Leaf className="h-8 w-8" />
        </span>
        <p className="text-sm font-semibold tracking-wide text-muted-foreground animate-pulse">
          Loading Settings...
        </p>
      </div>
    );
  }

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await saveUserProfile(user.uid, {
        city: "",
        state,
        dietType,
        householdSize,
        createdAt: profile?.createdAt || new Date(),
      });
      await refreshProfile();
      setSuccessMsg("Profile settings updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setErrorMsg("Failed to save changes.");
    } finally {
      setUpdating(false);
    }
  };

  const handleExportData = async () => {
    try {
      const logs = await getActivities(user.uid);
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(
          JSON.stringify(
            {
              email: user.email,
              profile: {
                state: profile?.state,
                dietType: profile?.dietType,
                householdSize: profile?.householdSize,
              },
              logs: logs,
            },
            null,
            2
          )
        );

      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ecotrace_carbon_data_${user.uid.slice(0, 6)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Export failed:", err);
      setErrorMsg("Failed to export data logs.");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setErrorMsg("Please type 'DELETE' exactly to confirm account termination.");
      return;
    }

    setDeletingAccount(true);
    setErrorMsg(null);

    try {
      const uid = user.uid;

      if (isMockMode) {
        localStorage.removeItem("mock_current_user");
        const registered = localStorage.getItem("mock_registered_users");
        if (registered) {
          const users = JSON.parse(registered);
          const updatedUsers = users.filter((u: { uid: string }) => u.uid !== uid);
          localStorage.setItem("mock_registered_users", JSON.stringify(updatedUsers));
        }
        window.dispatchEvent(new Event("mock-auth-changed"));
      } else {
        if (!db || !auth) {
          throw new Error("Firebase services are not initialized.");
        }

        // 1. Delete all activities in sub-collection
        const activitiesCol = collection(db, "users", uid, "activities");
        const actSnapshot = await getDocs(activitiesCol);
        for (const d of actSnapshot.docs) {
          await deleteDoc(d.ref);
        }

        // 2. Delete all daily summaries
        const dailyCol = collection(db, "users", uid, "dailySummaries");
        const dailySnap = await getDocs(dailyCol);
        for (const d of dailySnap.docs) {
          await deleteDoc(d.ref);
        }

        // 3. Delete all weekly summaries
        const weeklyCol = collection(db, "users", uid, "weeklySummaries");
        const weeklySnap = await getDocs(weeklyCol);
        for (const d of weeklySnap.docs) {
          await deleteDoc(d.ref);
        }

        // 4. Delete user document itself
        const userRef = doc(db, "users", uid);
        await deleteDoc(userRef);

        // 5. Delete authentication user
        const currentUser = auth.currentUser;
        if (currentUser) {
          await deleteUser(currentUser);
        }
      }

      router.push("/");
    } catch (err: unknown) {
      const error = err as Error & { code?: string };
      console.error("Account deletion failed:", error);
      const errCode = error.code || "";
      const errMsg = error.message || "";
      if (
        errCode === "auth/requires-recent-login" ||
        errMsg.includes("auth/requires-recent-login")
      ) {
        setErrorMsg(
          "This action requires a recent authentication login. Please log out, sign in again, and attempt deletion immediately."
        );
      } else {
        setErrorMsg(errMsg || "Wiping database failed. Account status unchanged.");
      }
      setDeletingAccount(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 space-y-8">
        {/* Page Header */}
        <div className="border-b border-border pb-4">
          <h1 className="text-3xl font-extrabold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your carbon profile, export your history, or control your private data.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 rounded-xl flex items-center gap-2.5 text-sm font-semibold">
            <Check className="h-5 w-5" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-2.5 text-sm font-semibold">
            <AlertTriangle className="h-5 w-5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Settings Card */}
        <div className="glass p-6 rounded-2xl border border-border shadow-md">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Profile Configuration
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Region */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> State
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                >
                  {statesList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Diet */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <Utensils className="h-3.5 w-3.5" /> Diet category
                </label>
                <select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value as UserProfile["dietType"])}
                  className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                >
                  <option value="vegan">Vegan</option>
                  <option value="vegetarian">Vegetarian (Typical Indian)</option>
                  <option value="eggetarian">Eggetarian</option>
                  <option value="non_veg_low">Non-Vegetarian (Low Meat)</option>
                  <option value="non_veg_high">Non-Vegetarian (High Meat)</option>
                </select>
              </div>

              {/* Household */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> Household Size
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(Number(e.target.value))}
                  className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-full text-xs hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
            >
              {updating ? "Saving Changes..." : "Save Profile Settings"}
            </button>
          </form>
        </div>

        {/* Data Portability (GDPR export) */}
        <div className="glass p-6 rounded-2xl border border-border shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" /> Data Portability (Export Logs)
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Download a complete, raw backup file containing your profile parameters and entire
                logged activity history in JSON format.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="bg-card hover:bg-muted border border-border font-semibold px-5 py-3 rounded-full text-xs transition-colors whitespace-nowrap"
            >
              Export JSON
            </button>
          </div>
        </div>

        {/* Danger Zone (Account erasure) */}
        <div className="glass p-6 rounded-2xl border border-destructive/20 shadow-md bg-destructive/5 space-y-4">
          <h2 className="text-lg font-bold text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" /> Danger Zone: Delete Account
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Deleting your account will permanently wipe your profile records, transport, energy,
            food, and consumption activity logs, and remove your authentication credentials. This
            action cannot be reversed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-end max-w-md border-t border-destructive/10 pt-4 mt-2">
            <div className="flex-grow w-full space-y-1">
              <label
                className="text-xs text-muted-foreground font-semibold uppercase block"
                htmlFor="delete-confirm"
              >
                Type &quot;DELETE&quot; to confirm account termination
              </label>
              <input
                id="delete-confirm"
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                disabled={deletingAccount}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-destructive"
              />
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={deletingAccount || deleteConfirmText !== "DELETE"}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground font-semibold px-5 py-2.5 rounded-full text-xs hover:bg-destructive/90 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {deletingAccount ? "Wiping Account..." : "Terminate Account"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

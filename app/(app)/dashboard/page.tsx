"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/components/providers/AuthProvider";
import { useUserActivities } from "@/lib/firebase/hooks";
import { addActivity, deleteActivity, Activity } from "@/lib/firebase/db";
import {
  DEFAULT_EMISSION_FACTORS,
  calculateTransportEmissions,
  calculateElectricityEmissions,
  calculateCookingEmissions,
  calculateDietEmissions,
  calculateConsumptionEmissions,
  type EmissionFactors,
} from "@/lib/emissions/engine";
import Navbar from "@/components/Navbar";
import {
  Leaf,
  Sparkles,
  Plus,
  Trash2,
  Flame,
  Car,
  Zap,
  Utensils,
  ShoppingBag,
  X,
  Award,
  FlameKindling,
} from "lucide-react";

// Dynamically import the charts to prevent SSR hydration mismatches
const DashboardCharts = dynamic(() => import("@/components/DashboardCharts"), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full flex items-center justify-center bg-muted/20 border border-border border-dashed rounded-xl animate-pulse">
      <span className="text-sm text-muted-foreground">Loading charts...</span>
    </div>
  ),
});

export default function Dashboard() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  // Fetch real-time data synced to TanStack Query
  const { data: activities = [], isLoading: loadingActivities } = useUserActivities(user?.uid);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  // Modal & Log form states
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [category, setCategory] = useState<Activity["category"]>("transport");
  const [subType, setSubType] = useState("2w_petrol");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  // AI Logging State
  const [aiInput, setAiInput] = useState("");
  const [parsingAi, setParsingAi] = useState(false);
  const [aiWarning, setAiWarning] = useState<string | null>(null);
  const [parsedActivities, setParsedActivities] = useState<
    Omit<Activity, "loggedAt" | "factorVersion">[]
  >([]);

  // Pure rendering date state
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentDate(new Date());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Compute Logging Streak purely from activities and currentDate
  const streakCount = useMemo(() => {
    if (!currentDate || activities.length === 0) return 0;

    // Group unique logged dates (YYYY-MM-DD)
    const loggedDates = new Set(activities.map((a) => a.loggedAt.toISOString().split("T")[0]));

    const sortedDates = Array.from(loggedDates).sort((a, b) => b.localeCompare(a));
    const todayStr = currentDate.toISOString().split("T")[0];
    const yesterdayStr = new Date(currentDate.getTime() - 86400000).toISOString().split("T")[0];

    // Check if user logged today or yesterday
    if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    const checkDate = new Date(sortedDates[0]);

    for (let i = 0; i < sortedDates.length; i++) {
      const checkStr = checkDate.toISOString().split("T")[0];
      if (loggedDates.has(checkStr)) {
        streak++;
        // Go back 1 day
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [activities, currentDate]);

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <span className="p-3 bg-primary/10 text-primary rounded-full animate-bounce mb-3">
          <Leaf className="h-8 w-8" />
        </span>
        <p className="text-sm font-semibold tracking-wide text-muted-foreground animate-pulse">
          Loading profile...
        </p>
      </div>
    );
  }

  // Calculate Emission Impact on the fly for UI feedback
  const getEstimatedCO2 = (cat: Activity["category"], sub: string, qty: number): number => {
    const userState = profile?.state || "Maharashtra";
    switch (cat) {
      case "transport":
        return calculateTransportEmissions(sub as keyof EmissionFactors["transport"], qty);
      case "electricity":
        return calculateElectricityEmissions(qty, userState);
      case "cooking":
        return calculateCookingEmissions(sub as keyof EmissionFactors["cooking"], qty, userState);
      case "diet":
        return calculateDietEmissions(sub as keyof EmissionFactors["diet"], qty);
      case "consumption":
        return calculateConsumptionEmissions(sub as keyof EmissionFactors["consumption"], qty);
      default:
        return 0;
    }
  };

  const currentEstimatedImpact = getEstimatedCO2(category, subType, quantity);

  // Submit manual log
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid positive quantity.");
      return;
    }
    if (quantity > 100000) {
      alert("Quantity is too large. Please enter a value under 100,000.");
      return;
    }
    try {
      const impact = getEstimatedCO2(category, subType, quantity);

      const unit =
        category === "transport"
          ? "km"
          : category === "electricity"
            ? "kWh"
            : category === "cooking"
              ? subType === "lpg_cylinder"
                ? "cylinder"
                : "unit"
              : category === "diet"
                ? "day"
                : "item";

      await addActivity(user.uid, {
        category,
        subType,
        quantity,
        unit,
        co2eKg: impact,
        source: "manual",
        factorVersion: DEFAULT_EMISSION_FACTORS.version,
        loggedAt: new Date(),
        note: note || undefined,
      });

      // Reset form
      setQuantity(1);
      setNote("");
      setLogModalOpen(false);
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  };

  // Submit AI text log to Next.js API parser
  const handleAiParse = async () => {
    if (!aiInput.trim()) return;
    setParsingAi(true);
    setAiWarning(null);
    try {
      const res = await fetch("/api/emissions/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiInput }),
      });
      const data = await res.json();
      if (data.warning) setAiWarning(data.warning);
      if (data.activities) {
        setParsedActivities(data.activities);
      }
    } catch (error) {
      console.error("AI parse failed:", error);
    } finally {
      setParsingAi(false);
    }
  };

  const handleConfirmAiActivities = async () => {
    try {
      for (const act of parsedActivities) {
        const impact = getEstimatedCO2(act.category, act.subType, act.quantity);
        await addActivity(user.uid, {
          category: act.category,
          subType: act.subType,
          quantity: act.quantity,
          unit: act.unit,
          co2eKg: impact,
          source: "ai_parsed",
          factorVersion: DEFAULT_EMISSION_FACTORS.version,
          loggedAt: new Date(),
          note: act.note,
        });
      }
      setParsedActivities([]);
      setAiInput("");
      setAiWarning(null);
    } catch (error) {
      console.error("Error saving AI activities:", error);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      await deleteActivity(user.uid, id);
    } catch (error) {
      console.error("Failed to delete activity:", error);
    }
  };

  // Process activities into Recharts format (group by past 7 days)
  const getChartData = () => {
    if (!currentDate) return [];

    const dataMap: {
      [dateStr: string]: {
        date: string;
        Transport: number;
        Electricity: number;
        Cooking: number;
        Diet: number;
        Consumption: number;
        Total: number;
      };
    } = {};

    // Initialize past 7 days based on currentDate
    for (let i = 6; i >= 0; i--) {
      const d = new Date(currentDate.getTime());
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      dataMap[dateStr] = {
        date: dateStr,
        Transport: 0,
        Electricity: 0,
        Cooking: 0,
        Diet: 0,
        Consumption: 0,
        Total: 0,
      };
    }

    activities.forEach((act) => {
      const dateStr = act.loggedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      if (dataMap[dateStr]) {
        const catKey =
          act.category === "transport"
            ? "Transport"
            : act.category === "electricity"
              ? "Electricity"
              : act.category === "cooking"
                ? "Cooking"
                : act.category === "diet"
                  ? "Diet"
                  : "Consumption";

        dataMap[dateStr][catKey] += act.co2eKg;
        dataMap[dateStr].Total += act.co2eKg;
      }
    });

    return Object.values(dataMap);
  };

  const chartData = getChartData();

  // Compute daily and weekly metrics purely based on currentDate
  const todayEmissions = currentDate
    ? activities
        .filter((a) => a.loggedAt.toDateString() === currentDate.toDateString())
        .reduce((sum, a) => sum + a.co2eKg, 0)
    : 0;

  const weeklyEmissions = currentDate
    ? activities
        .filter((a) => currentDate.getTime() - a.loggedAt.getTime() <= 7 * 86400000)
        .reduce((sum, a) => sum + a.co2eKg, 0)
    : 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">EcoTrace Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Logged in as: <span className="font-semibold">{user.email}</span> • State:{" "}
              <span className="font-semibold text-primary">{profile?.state || "Maharashtra"}</span>
            </p>
          </div>
          <button
            onClick={() => setLogModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            <span>Log Activity</span>
          </button>
        </section>

        {/* Top Indicators / Metrics Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-orange-500/10 text-orange-500 rounded-xl">
              <FlameKindling className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold">
                Logging Streak
              </span>
              <p className="text-2xl font-black">{streakCount} Days</p>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-primary/10 text-primary rounded-xl">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold">
                Logged Today
              </span>
              <p className="text-2xl font-black">{todayEmissions.toFixed(1)} kg CO2e</p>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-blue-500/10 text-blue-500 rounded-xl">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold">
                This Week (Total)
              </span>
              <p className="text-2xl font-black">{weeklyEmissions.toFixed(1)} kg CO2e</p>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-purple-500/10 text-purple-500 rounded-xl">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold">
                Diet Profile
              </span>
              <p className="text-xl font-bold uppercase truncate max-w-[150px]">
                {profile?.dietType || "Vegetarian"}
              </p>
            </div>
          </div>
        </section>

        {/* AI Quick-Logger Console */}
        <section className="glass p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">AI Conversational Logger</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Type what you did today in plain English or Hinglish (e.g.{" "}
            <i>&quot;I rode my electric scooter for 15 km and cooked on LPG cylinder&quot;</i>):
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Record your daily footprints..."
              disabled={parsingAi}
              aria-label="Describe activity in plain English or Hinglish"
              className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleAiParse}
              disabled={parsingAi || !aiInput.trim()}
              className="bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl text-sm hover:bg-primary/90 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {parsingAi ? "Analyzing..." : "Log with AI"}
            </button>
          </div>

          {aiWarning && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 rounded-xl text-xs">
              ⚠️ {aiWarning}
            </div>
          )}

          {parsedActivities.length > 0 && (
            <div className="mt-4 p-4 border border-border bg-muted/40 rounded-xl space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold border-b border-border pb-2">
                Verify AI-Parsed Activities
              </h3>
              <div className="space-y-2">
                {parsedActivities.map((act, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-card p-3 rounded-lg border border-border text-sm"
                  >
                    <div>
                      <span className="font-semibold capitalize text-primary text-xs tracking-wide bg-primary/10 px-2.5 py-0.5 rounded-full inline-block mb-1">
                        {act.category}
                      </span>
                      <p className="font-medium">{act.note}</p>
                      <p className="text-xs text-muted-foreground">
                        Est: {getEstimatedCO2(act.category, act.subType, act.quantity).toFixed(1)}{" "}
                        kg CO2e ({act.quantity} {act.unit})
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setParsedActivities(parsedActivities.filter((_, i) => i !== idx))
                      }
                      className="text-destructive p-1 hover:bg-destructive/10 rounded-md transition-colors"
                      aria-label="Remove parsed activity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-end border-t border-border pt-4">
                <button
                  onClick={() => setParsedActivities([])}
                  className="px-4 py-2 border border-border rounded-xl text-xs hover:bg-muted font-semibold"
                >
                  Discard
                </button>
                <button
                  onClick={handleConfirmAiActivities}
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-full text-xs font-semibold hover:bg-primary/90"
                >
                  Confirm & Log all
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Charts & Visualization */}
        <section>
          <DashboardCharts data={chartData} />
        </section>

        {/* History Table */}
        <section className="glass p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Activity History (Recent logs)</h2>
            <span className="text-xs text-muted-foreground">{activities.length} total logs</span>
          </div>

          {loadingActivities ? (
            <div className="py-12 text-center animate-pulse text-sm text-muted-foreground">
              Loading history...
            </div>
          ) : activities.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No activities logged yet. Click &quot;Log Activity&quot; to start.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Logged Value</th>
                    <th className="py-3 px-4">Emissions</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {activities.map((act) => {
                    const CatIcon =
                      act.category === "transport"
                        ? Car
                        : act.category === "electricity"
                          ? Zap
                          : act.category === "cooking"
                            ? Flame
                            : act.category === "diet"
                              ? Utensils
                              : ShoppingBag;

                    return (
                      <tr key={act.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 whitespace-nowrap">
                          {act.loggedAt.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <CatIcon className="h-4 w-4 text-primary shrink-0" />
                            <span className="capitalize">{act.category}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-foreground">{act.quantity}</span>{" "}
                          <span className="text-xs text-muted-foreground font-medium">
                            {act.unit}
                          </span>
                          {act.note && (
                            <p className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">
                              {act.note}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-foreground">
                          {act.co2eKg.toFixed(1)} kg CO2e
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              act.source === "ai_parsed"
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                : act.source === "bill_ocr"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {act.source === "ai_parsed"
                              ? "AI Log"
                              : act.source === "bill_ocr"
                                ? "Bill Scanner"
                                : "Manual"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteActivity(act.id!)}
                            className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                            aria-label="Delete log"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Manual Activity Log Modal */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border border-border p-6 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setLogModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"
              aria-label="Close log activity modal"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Log Carbon Activity
            </h2>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-1">
                <label
                  className="text-xs font-bold text-muted-foreground uppercase"
                  htmlFor="category"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => {
                    const newCat = e.target.value as Activity["category"];
                    setCategory(newCat);
                    if (newCat === "transport") setSubType("2w_petrol");
                    else if (newCat === "electricity") setSubType("grid");
                    else if (newCat === "cooking") setSubType("lpg_cylinder");
                    else if (newCat === "diet") setSubType("vegetarian");
                    else if (newCat === "consumption") setSubType("delivery_order");
                  }}
                  className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="transport">Transport / Commute</option>
                  <option value="electricity">Electricity Consumption</option>
                  <option value="cooking">Cooking Fuel</option>
                  <option value="diet">Diet & Food</option>
                  <option value="consumption">Shopping & Consumption</option>
                </select>
              </div>

              <div className="space-y-1">
                <label
                  className="text-xs font-bold text-muted-foreground uppercase"
                  htmlFor="subtype"
                >
                  Type
                </label>
                <select
                  id="subtype"
                  value={subType}
                  onChange={(e) => setSubType(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none"
                >
                  {category === "transport" && (
                    <>
                      <option value="2w_petrol">Two-Wheeler (Petrol)</option>
                      <option value="2w_ev">Two-Wheeler (Electric)</option>
                      <option value="3w_cng">Auto-Rickshaw (CNG)</option>
                      <option value="3w_diesel">Auto-Rickshaw (Diesel)</option>
                      <option value="4w_petrol">Private Car (Petrol)</option>
                      <option value="4w_diesel">Private Car (Diesel)</option>
                      <option value="4w_cng">Private Car (CNG)</option>
                      <option value="4w_ev">Private Car (Electric)</option>
                      <option value="bus_diesel">Public Bus (Diesel)</option>
                      <option value="bus_cng_ev">Public Bus (CNG/Electric)</option>
                      <option value="metro_train">Metro / Local Train</option>
                      <option value="flight_domestic">Domestic Flight</option>
                    </>
                  )}
                  {category === "electricity" && <option value="grid">Grid Electricity</option>}
                  {category === "cooking" && (
                    <>
                      <option value="lpg_cylinder">LPG Cylinder (14.2 kg)</option>
                      <option value="png_m3">Piped Natural Gas (PNG)</option>
                      <option value="biomass_kg">Biomass Fuel (Wood/Dung)</option>
                      <option value="electric_kwh">Electric Cooking (Induction)</option>
                    </>
                  )}
                  {category === "diet" && (
                    <>
                      <option value="vegan">Vegan Diet</option>
                      <option value="vegetarian">Vegetarian Diet</option>
                      <option value="eggetarian">Eggetarian Diet</option>
                      <option value="non_veg_low">Non-Vegetarian (Low Meat)</option>
                      <option value="non_veg_high">Non-Vegetarian (High Meat)</option>
                    </>
                  )}
                  {category === "consumption" && (
                    <>
                      <option value="delivery_order">E-Commerce / Food Delivery</option>
                      <option value="fashion_item">Fast Fashion Clothes Item</option>
                      <option value="electronics_device">Electronic Device Purchase</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    className="text-xs font-bold text-muted-foreground uppercase"
                    htmlFor="qty"
                  >
                    Quantity
                  </label>
                  <input
                    id="qty"
                    type="number"
                    min="0.1"
                    step="any"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                    Unit
                  </span>
                  <div className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground">
                    {category === "transport"
                      ? "km"
                      : category === "electricity"
                        ? "kWh"
                        : category === "cooking"
                          ? subType === "lpg_cylinder"
                            ? "cylinder"
                            : "unit"
                          : category === "diet"
                            ? "day"
                            : "item"}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase" htmlFor="note">
                  Notes / Description
                </label>
                <input
                  id="note"
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. commuted to office, dinner with family"
                  className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              {/* Real-time Impact Indicator */}
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-center">
                <span className="text-xs text-muted-foreground block font-semibold uppercase">
                  Estimated Emission Impact
                </span>
                <span className="text-2xl font-black text-primary">
                  {currentEstimatedImpact.toFixed(2)} kg CO2e
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
              >
                Log Activity
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

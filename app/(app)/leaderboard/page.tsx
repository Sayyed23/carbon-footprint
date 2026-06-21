"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import Navbar from "@/components/Navbar";
import { Trophy, Leaf, Users, ShieldAlert } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  cohort: string;
  memberCount: number;
  averageWeeklyCo2e: number;
  status: "low" | "average" | "high";
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  const [activeTab, setActiveTab] = useState<"regional" | "diet">("regional");

  const regionalCohorts: LeaderboardEntry[] = [
    {
      rank: 1,
      cohort: "Himachal Pradesh Grid Cohort",
      memberCount: 156,
      averageWeeklyCo2e: 18.5,
      status: "low",
    },
    {
      rank: 2,
      cohort: "Southern Grid Renewables Cohort (Karnataka/TN)",
      memberCount: 420,
      averageWeeklyCo2e: 22.1,
      status: "low",
    },
    {
      rank: 3,
      cohort: "Maharashtra Professionals Cohort",
      memberCount: 890,
      averageWeeklyCo2e: 31.4,
      status: "average",
    },
    {
      rank: 4,
      cohort: "National Average Baseline (India)",
      memberCount: 1540,
      averageWeeklyCo2e: 36.5,
      status: "average",
    },
    {
      rank: 5,
      cohort: "Delhi/NCR Urban Commuter Cohort",
      memberCount: 650,
      averageWeeklyCo2e: 45.2,
      status: "high",
    },
    {
      rank: 6,
      cohort: "East Zone Coal-Heavy Grid Cohort (WB/Odisha)",
      memberCount: 310,
      averageWeeklyCo2e: 48.9,
      status: "high",
    },
  ];

  const dietCohorts: LeaderboardEntry[] = [
    {
      rank: 1,
      cohort: "Vegan Diet Cohort (All India)",
      memberCount: 88,
      averageWeeklyCo2e: 7.7,
      status: "low",
    },
    {
      rank: 2,
      cohort: "South Indian Vegetarian Cohort",
      memberCount: 340,
      averageWeeklyCo2e: 11.2,
      status: "low",
    },
    {
      rank: 3,
      cohort: "Typical Indian Vegetarian Cohort",
      memberCount: 1100,
      averageWeeklyCo2e: 11.5,
      status: "low",
    },
    {
      rank: 4,
      cohort: "Eggetarian Diet Cohort",
      memberCount: 290,
      averageWeeklyCo2e: 13.3,
      status: "average",
    },
    {
      rank: 5,
      cohort: "Moderate Non-Vegetarian Cohort",
      memberCount: 780,
      averageWeeklyCo2e: 19.6,
      status: "average",
    },
    {
      rank: 6,
      cohort: "Frequent Non-Vegetarian Cohort (High Red Meat/Mutton)",
      memberCount: 410,
      averageWeeklyCo2e: 31.5,
      status: "high",
    },
  ];

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <span className="p-3 bg-primary/10 text-primary rounded-full animate-bounce mb-3">
          <Leaf className="h-8 w-8" />
        </span>
        <p className="text-sm font-semibold tracking-wide text-muted-foreground animate-pulse">
          Loading Leaderboard...
        </p>
      </div>
    );
  }

  const cohorts = activeTab === "regional" ? regionalCohorts : dietCohorts;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12 space-y-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl w-fit mx-auto mb-4">
            <Trophy className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Anonymized Cohort Leaderboard</h1>
          <p className="text-muted-foreground mt-2 text-md">
            Compare carbon aggregates across regional grid zones and dietary patterns in India. No
            individual data is ever shared or exposed.
          </p>
        </div>

        {/* Info Box */}
        <div className="max-w-3xl mx-auto p-4 bg-primary/5 border border-primary/10 rounded-2xl flex gap-3 text-xs leading-relaxed text-muted-foreground">
          <ShieldAlert className="h-5 w-5 text-primary shrink-0" />
          <div>
            <span className="font-bold text-foreground">Privacy Protection Enforced</span>
            <p className="mt-0.5">
              To prevent personal shaming, EcoTrace does not maintain individual-to-individual
              leaderboards. Rankings reflect anonymized cohort averages calculated nightly. Streaks
              are awarded for logging consistency rather than absolute footprints.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center border-b border-border max-w-sm mx-auto">
          <button
            onClick={() => setActiveTab("regional")}
            className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-all ${
              activeTab === "regional"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Grid & Regional Cohorts
          </button>
          <button
            onClick={() => setActiveTab("diet")}
            className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-all ${
              activeTab === "diet"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Dietary Groupings
          </button>
        </div>

        {/* Cohorts Leaderboard Table */}
        <div className="max-w-3xl mx-auto glass border border-border rounded-2xl shadow-xl overflow-hidden">
          <div className="divide-y divide-border">
            {cohorts.map((cohort) => (
              <div
                key={cohort.rank}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-5 hover:bg-muted/20 gap-4"
              >
                <div className="flex items-center gap-4">
                  {/* Rank indicator */}
                  <span
                    className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                      cohort.rank === 1
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-500"
                        : cohort.rank === 2
                          ? "bg-slate-400/20 text-slate-500"
                          : cohort.rank === 3
                            ? "bg-orange-400/20 text-orange-500"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    #{cohort.rank}
                  </span>

                  <div>
                    <span className="font-bold text-sm text-foreground">{cohort.cohort}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {cohort.memberCount} members
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-left sm:text-right">
                    <span className="text-sm font-bold text-foreground block">
                      {cohort.averageWeeklyCo2e} kg CO2e
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                      weekly average
                    </span>
                  </div>

                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      cohort.status === "low"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : cohort.status === "average"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {cohort.status === "low"
                      ? "Low Impact"
                      : cohort.status === "average"
                        ? "Moderate"
                        : "High Impact"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

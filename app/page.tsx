"use client";

import Link from "next/link";
import {
  Leaf,
  ArrowRight,
  BarChart3,
  MessageSquare,
  Zap,
  ShieldCheck,
  Trophy,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <header id="main-content" className="relative overflow-hidden pt-20 pb-16 sm:pb-24 lg:pt-32 lg:pb-32">
        {/* Abstract Glowing Accent */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-1/4 w-[300px] h-[300px] bg-secondary/20 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="h-4 w-4" />
            <span>Built for India • Powered by Google Gemini</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-tight">
            Track and Reduce Your <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
              Carbon Footprint
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
            Most carbon calculators use Western standards. EcoTrace uses India-specific grid mixes,
            commute profiles, LPG cylinders, and local diets for accurate personal carbon
            accounting.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/calculator"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-base font-bold hover:bg-primary/90 transition-all duration-300 shadow-xl shadow-primary/25 hover:scale-[1.02]"
            >
              <span>Calculate in 60s (Free)</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto flex items-center justify-center border border-border bg-card/50 backdrop-blur-sm px-8 py-4 rounded-full text-base font-semibold hover:bg-muted transition-all duration-300 hover:scale-[1.02]"
            >
              Join EcoTrace
            </Link>
          </div>
        </div>
      </header>

      {/* Feature Grid */}
      <section className="py-20 border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Why EcoTrace is Different
            </h2>
            <p className="text-muted-foreground mt-4 text-md">
              A carbon tracker tailored to Indian lifestyles, unified power grids, and
              natural-language interactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass p-8 rounded-2xl shadow-md border border-border flex flex-col justify-between">
              <div>
                <div className="p-3 bg-primary/10 text-primary rounded-xl w-fit mb-6">
                  <Leaf className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Indian Emission Database</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Engineered with state-by-state electricity grid combined margins (average ~0.71
                  kg/kWh), двухколёсными (scooter/auto) transport factors, and regional Indian
                  diets.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="glass p-8 rounded-2xl shadow-md border border-border flex flex-col justify-between">
              <div>
                <div className="p-3 bg-primary/10 text-primary rounded-xl w-fit mb-6">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Conversational Logging</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  No tedious spreadsheets. Simply type or record in plain Hinglish:{" "}
                  <i>&quot;Rode my scooter for 12 km and ate veg thali.&quot;</i> Gemini parses it
                  instantly into activities.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="glass p-8 rounded-2xl shadow-md border border-border flex flex-col justify-between">
              <div>
                <div className="p-3 bg-primary/10 text-primary rounded-xl w-fit mb-6">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Bill Upload Parser</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Snap a photo of your electricity bill. Gemini Vision extracts the consumed units
                  (kWh), matches it to your regional grid factor, and updates your dashboard.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="glass p-8 rounded-2xl shadow-md border border-border flex flex-col justify-between">
              <div>
                <div className="p-3 bg-primary/10 text-primary rounded-xl w-fit mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Privacy & Minimization</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We collect data at state-level granularity (no GPS logs), auto-delete utility bill
                  images after 7 days, and support one-click account deletion and data export.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="glass p-8 rounded-2xl shadow-md border border-border flex flex-col justify-between">
              <div>
                <div className="p-3 bg-primary/10 text-primary rounded-xl w-fit mb-6">
                  <Trophy className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Gamified Badges & Cohorts</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Earn credentials for logging streaks and completed reduction activities. Safely
                  compare progress in anonymized regional cohorts without shaming.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="glass p-8 rounded-2xl shadow-md border border-border flex flex-col justify-between bg-gradient-to-br from-primary/5 to-transparent">
              <div>
                <div className="p-3 bg-primary/10 text-primary rounded-xl w-fit mb-6">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Grounded Carbon Coach</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Receive personalized, specific weekly coaching grounded in your logged habits. No
                  vague generalities — get actionable, regional tips.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">EcoTrace</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex gap-4">
            <Link href="/awareness" className="hover:text-foreground">
              Awareness Hub
            </Link>
            <Link href="/calculator" className="hover:text-foreground">
              Quick Calculator
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

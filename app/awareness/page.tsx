"use client";

import Navbar from "@/components/Navbar";
import { BookOpen, Leaf, Zap, Car, Flame, ShieldAlert, Award } from "lucide-react";

export default function AwarenessPage() {
  const articles = [
    {
      title: "Understanding India's Electricity Grid Factors",
      category: "Energy",
      icon: Zap,
      content: "Electricity grid intensity varies drastically across Indian states depending on the power generation mix. States like West Bengal, Bihar, and Odisha rely heavily on coal-fired thermal power stations, resulting in Combined Margin factors of around 0.78 kg CO2/kWh. In contrast, states with large hydro and solar capacities like Himachal Pradesh, Uttarakhand, and Sikkim have grid factors closer to 0.52 kg CO2/kWh. Understanding your local grid mix helps contextualize why energy savings in certain regions have a higher offset impact.",
    },
    {
      title: "The Footprint of the Indian Commute",
      category: "Transport",
      icon: Car,
      content: "Unlike Western markets dominated by large private passenger cars, urban India's transportation mix is heavily two-wheeler (scooters/motorcycles) and three-wheeler (auto-rickshaws) centric. Standard petrol scooters emit roughly 0.056 kg CO2/km — a fraction of a private petrol car (0.143 kg CO2/km). Commuting by CNG auto-rickshaws reduces this further to ~0.048 kg CO2/km, while public transport systems like metro rails represent the gold standard at 0.018 kg CO2 per passenger-km.",
    },
    {
      title: "LPG, PNG, and the Carbon Footprint of Indian Kitchens",
      category: "Cooking",
      icon: Flame,
      content: "Domestic cooking is a primary source of direct emissions in Indian households. A standard 14.2 kg LPG cylinder emits about 42.5 kg CO2e over its lifespan. Piped Natural Gas (PNG) offers a slightly cleaner alternative at roughly 2.02 kg CO2e per cubic meter. Transitioning to induction cooktops powered by low-carbon electricity grids (such as solar or hydro-heavy state grids) represents the most direct pathway to net-zero cooking in India.",
    },
    {
      title: "Dietary Splits: Milk, Meat, and Indian Food Footprints",
      category: "Diet",
      icon: Leaf,
      content: "Indian diet carbon accounting differs from Western models. Western meat consumption relies heavily on beef, which has a massive carbon factor (25-30+ kg CO2e/kg). In India, sheep/goat meat (mutton) and chicken are the predominant non-vegetarian choices, yielding a lower, yet significant non-vegetarian dietary factor (~2.8 kg CO2e/day). Vegetarian diets, which heavily feature dairy products (ghee, paneer, milk), show average factors around 1.6 kg CO2e/day, while pure plant-based vegan diets sit at 1.1 kg CO2e/day.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl w-fit mx-auto mb-4">
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Awareness & Education Hub</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Learn about localized carbon accounting in India. Demystify the factors behind your electricity bills, daily commute, and food choices.
          </p>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article, idx) => {
            const Icon = article.icon;
            return (
              <article key={idx} className="glass p-8 rounded-2xl border border-border shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full uppercase">
                      {article.category}
                    </span>
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4 tracking-tight">{article.title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">{article.content}</p>
                </div>
                <div className="border-t border-border pt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  <span>Sourced from CEA baseline reports and MoEFCC carbon databases.</span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Guidelines section */}
        <section className="mt-16 glass p-8 rounded-2xl border border-border bg-gradient-to-r from-primary/5 to-transparent flex flex-col md:flex-row gap-6 items-center">
          <div className="p-4 bg-primary/10 text-primary rounded-full shrink-0">
            <Award className="h-10 w-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Make an Impact Today</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
              By logging daily activities, tracking your metrics, and committing to small, actionable tweaks (e.g. taking a metro instead of a taxi or turning off the AC for two hours), you can reduce your personal emission profile. Small collective changes create major national impacts.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

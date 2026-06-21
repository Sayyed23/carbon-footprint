"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { 
  MapPin, 
  Car, 
  Zap, 
  Utensils, 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Leaf, 
  Flame, 
  ShoppingBag,
  TrendingDown,
  Info
} from "lucide-react";
import { 
  DEFAULT_EMISSION_FACTORS, 
  getGridFactor, 
  calculateTransportEmissions, 
  calculateElectricityEmissions, 
  calculateDietEmissions 
} from "@/lib/emissions/engine";

export default function CalculatorPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Form State
  const [state, setState] = useState("Maharashtra");
  const [commuteMode, setCommuteMode] = useState<keyof typeof DEFAULT_EMISSION_FACTORS.transport>("2w_petrol");
  const [commuteDistance, setCommuteDistance] = useState(50); // km/week
  const [electricityBill, setElectricityBill] = useState(1500); // Rs./month
  const [dietType, setDietType] = useState<keyof typeof DEFAULT_EMISSION_FACTORS.diet>("vegetarian");
  const [householdSize, setHouseholdSize] = useState(4);

  // Result state
  const [calculated, setCalculated] = useState(false);
  const [results, setResults] = useState<{
    transport: number;
    electricity: number;
    diet: number;
    cooking: number;
    total: number;
    nationalComparison: number; // % vs national avg (~1900 kg/year)
  } | null>(null);

  const statesList = Object.keys(DEFAULT_EMISSION_FACTORS.electricity.byState).sort();

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      calculateFootprint();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const calculateFootprint = () => {
    // 1. Transport Emissions (weekly to annual: * 52 weeks)
    const annualTransport = calculateTransportEmissions(commuteMode, commuteDistance) * 52;

    // 2. Electricity Emissions: Estimate kWh from monthly bill
    // Average tariff in India is roughly Rs. 7.5 per kWh
    const estimatedKwhPerMonth = electricityBill / 7.5;
    const annualKwh = estimatedKwhPerMonth * 12;
    // Divide shared household electricity by household size
    const sharedAnnualKwh = annualKwh / householdSize;
    const annualElectricity = calculateElectricityEmissions(sharedAnnualKwh, state);

    // 3. Diet Emissions (daily to annual: * 365 days)
    const annualDiet = calculateDietEmissions(dietType) * 365;

    // 4. Cooking Emissions (Household average domestic LPG cylinder: ~10 cylinders per year shared)
    // 1 LPG cylinder = 42.5 kg CO2e
    const annualCooking = (42.5 * 10) / householdSize;

    const total = annualTransport + annualElectricity + annualDiet + annualCooking;
    
    // National average in India is ~1900 kg CO2e per capita per year
    const nationalAvg = 1900;
    const comparison = Math.round(((total - nationalAvg) / nationalAvg) * 100);

    setResults({
      transport: Math.round(annualTransport),
      electricity: Math.round(annualElectricity),
      diet: Math.round(annualDiet),
      cooking: Math.round(annualCooking),
      total: Math.round(total),
      nationalComparison: comparison,
    });

    // Save temporary data in session storage to carry over to Sign Up
    sessionStorage.setItem("guestCalculations", JSON.stringify({
      state,
      commuteMode,
      commuteDistance,
      electricityBill,
      dietType,
      householdSize,
      calculatedResults: {
        transport: Math.round(annualTransport),
        electricity: Math.round(annualElectricity),
        diet: Math.round(annualDiet),
        cooking: Math.round(annualCooking),
        total: Math.round(total),
      }
    }));

    setCalculated(true);
  };

  const handleSaveProgress = () => {
    router.push("/signup?source=calculator");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 flex flex-col justify-center">
        {!calculated ? (
          <div className="w-full max-w-xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <span className="text-sm font-semibold tracking-wide uppercase text-primary">Onboarding Quiz</span>
              <h1 className="text-3xl font-extrabold tracking-tight mt-1">Calculate Your Carbon Footprint</h1>
              <p className="text-muted-foreground mt-2">Get an instant baseline of your ecological impact in India. Takes under 60 seconds.</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-8">
              <div 
                className="bg-primary h-full transition-all duration-300 ease-out" 
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>

            {/* Wizard Steps */}
            <div className="glass p-8 rounded-2xl shadow-xl transition-all duration-300">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Select Your State</h2>
                      <p className="text-sm text-muted-foreground">This helps determine your state's electricity grid carbon intensity.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="state" className="block text-sm font-semibold">Indian State / Union Territory</label>
                    <select
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {statesList.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-xl flex gap-3 text-sm">
                    <Info className="h-5 w-5 text-primary shrink-0" />
                    <p className="text-muted-foreground leading-relaxed">
                      Grid emission factors in India range from <strong>0.52 kg CO2/kWh</strong> in hydro-heavy northern states up to <strong>0.78 kg CO2/kWh</strong> in coal-heavy eastern states.
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl">
                      <Car className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Commute & Transport</h2>
                      <p className="text-sm text-muted-foreground">Tell us how you commuted this past week.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "2w_petrol", label: "Scooter (Petrol)", desc: "Two-wheeler" },
                      { id: "2w_ev", label: "Electric Scooter", desc: "EV Two-wheeler" },
                      { id: "4w_petrol", label: "Car (Petrol)", desc: "Four-wheeler" },
                      { id: "4w_ev", label: "Electric Car", desc: "EV Car" },
                      { id: "3w_cng", label: "CNG Auto", desc: "Three-wheeler" },
                      { id: "metro_train", label: "Metro / Train", desc: "Public Rail" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setCommuteMode(mode.id as any)}
                        className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                          commuteMode === mode.id 
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <span className="font-bold text-sm">{mode.label}</span>
                        <span className="text-xs text-muted-foreground mt-1">{mode.desc}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Weekly Travel Distance</span>
                      <span className="text-primary">{commuteDistance} km</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="500"
                      step="5"
                      value={commuteDistance}
                      onChange={(e) => setCommuteDistance(Number(e.target.value))}
                      className="w-full accent-primary bg-secondary h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5 km</span>
                      <span>150 km</span>
                      <span>500 km</span>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Electricity Bill</h2>
                      <p className="text-sm text-muted-foreground">Estimate your household's average monthly electricity bill.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Monthly Bill Amount</span>
                      <span className="text-primary">₹ {electricityBill}</span>
                    </div>
                    <input
                      type="range"
                      min="300"
                      max="10000"
                      step="100"
                      value={electricityBill}
                      onChange={(e) => setElectricityBill(Number(e.target.value))}
                      className="w-full accent-primary bg-secondary h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>₹ 300</span>
                      <span>₹ 3,000</span>
                      <span>₹ 10,000+</span>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl text-center">
                    <p className="text-xs text-muted-foreground">
                      Roughly translates to <strong>{Math.round(electricityBill / 7.5)} kWh (units)</strong> per month at an average tariff of ₹7.5/unit.
                    </p>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl">
                      <Utensils className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Dietary Habits</h2>
                      <p className="text-sm text-muted-foreground">Select the diet category that best describes your meals.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { id: "vegan", label: "Vegan", desc: "100% plant-based, no dairy or animal derivatives." },
                      { id: "vegetarian", label: "Vegetarian", desc: "No meat or eggs; includes dairy (paneer, milk, ghee)." },
                      { id: "eggetarian", label: "Eggetarian", desc: "Vegetarian diet but includes eggs." },
                      { id: "non_veg_low", label: "Non-Vegetarian (Moderate)", desc: "Consumes chicken/fish occasional days a week." },
                      { id: "non_veg_high", label: "Non-Vegetarian (Frequent)", desc: "Consumes meat (including mutton) daily or almost daily." },
                    ].map((diet) => (
                      <button
                        key={diet.id}
                        type="button"
                        onClick={() => setDietType(diet.id as any)}
                        className={`w-full flex flex-col text-left p-4 rounded-xl border transition-all ${
                          dietType === diet.id 
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <span className="font-bold text-sm">{diet.label}</span>
                        <span className="text-xs text-muted-foreground mt-1">{diet.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Household size</h2>
                      <p className="text-sm text-muted-foreground">How many people share the household bills and cooking fuel?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setHouseholdSize(num)}
                        className={`p-4 rounded-xl border text-center font-bold text-lg transition-all ${
                          householdSize === num
                            ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {num === 5 ? "5+" : num}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Shared footprint elements (LPG cylinders, utility bills) will be divided equally.
                  </p>
                </div>
              )}

              {/* Navigation controls */}
              <div className="flex justify-between mt-8 border-t border-border pt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold transition-colors ${
                    step === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  <span>{step === totalSteps ? "Calculate" : "Next"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl mx-auto glass p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Visual background glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

            <div className="text-center mb-6">
              <span className="p-2.5 bg-primary/10 text-primary rounded-full inline-block mb-3">
                <Leaf className="h-8 w-8 animate-pulse" />
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight">Your Carbon Footprint Baseline</h1>
              <p className="text-muted-foreground mt-1">Based on your quick estimates</p>
            </div>

            {/* Big footprint circle display */}
            <div className="flex flex-col items-center justify-center p-8 bg-muted/40 rounded-2xl border border-border mb-8 text-center">
              <span className="text-5xl font-black text-primary tracking-tight">
                {(results!.total / 1000).toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-muted-foreground mt-1">Tonnes CO2e / Year</span>
              
              <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/15 text-primary">
                <TrendingDown className="h-4 w-4" />
                <span>
                  {results!.nationalComparison <= 0 
                    ? `${Math.abs(results!.nationalComparison)}% below Indian national average`
                    : `${results!.nationalComparison}% above Indian national average`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-3 max-w-sm">
                Equivalent to driving a typical petrol car for {Math.round(results!.total / 0.143)} km or burning {Math.round(results!.total / 2.99)} kg of LPG fuel.
              </p>
            </div>

            {/* Category breakdown bar chart / progress lines */}
            <div className="space-y-4 mb-8">
              <h2 className="text-lg font-bold border-b border-border pb-2">Category Breakdown</h2>

              {[
                { name: "Commute & Transport", value: results!.transport, color: "bg-blue-500", icon: Car },
                { name: "Electricity", value: results!.electricity, color: "bg-yellow-500", icon: Zap },
                { name: "Dietary Choices", value: results!.diet, color: "bg-emerald-500", icon: Utensils },
                { name: "Cooking Fuel", value: results!.cooking, color: "bg-red-500", icon: Flame },
              ].map((cat) => {
                const percent = Math.max(2, Math.round((cat.value / results!.total) * 100));
                const Icon = cat.icon;
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{cat.name}</span>
                      </div>
                      <span className="text-muted-foreground">{cat.value} kg CO2e ({percent}%)</span>
                    </div>
                    <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Call to action card */}
            <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-bold text-md flex items-center justify-center sm:justify-start gap-1 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  Save Progress & Log Daily
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Sign up now to lock in this baseline, activate your daily conversational logger, and start chatting with the Carbon Coach.
                </p>
              </div>
              <button
                onClick={handleSaveProgress}
                className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 whitespace-nowrap"
              >
                Create Account
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

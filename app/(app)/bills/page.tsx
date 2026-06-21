"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";
import { addActivity } from "@/lib/firebase/db";
import { DEFAULT_EMISSION_FACTORS, getGridFactor } from "@/lib/emissions/engine";
import Navbar from "@/components/Navbar";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  Check,
  X,
  Zap,
  MapPin,
  Calendar,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";

export default function BillScannerPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  // Extracted Results State
  const [extractedData, setExtractedData] = useState<{
    state: string;
    billingPeriod: string;
    unitsKwh: number;
  } | null>(null);

  // Editable confirmation states
  const [confirmState, setConfirmState] = useState("Maharashtra");
  const [confirmPeriod, setConfirmPeriod] = useState("");
  const [confirmUnits, setConfirmUnits] = useState(0);

  const statesList = Object.keys(DEFAULT_EMISSION_FACTORS.electricity.byState).sort();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setWarning(null);
    setExtractedData(null);

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Limit file size to 4MB
      if (file.size > 4 * 1024 * 1024) {
        setError("File size exceeds 4MB. Please upload a smaller image.");
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!imageFile || !imagePreview) return;

    setAnalyzing(true);
    setError(null);
    setWarning(null);

    try {
      // Get base64 string without data prefix
      const base64Content = imagePreview.split(",")[1];
      const mimeType = imageFile.type;

      const res = await fetch("/api/emissions/bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Content,
          mimeType: mimeType,
        }),
      });

      const responseData = await res.json();
      if (responseData.error) {
        throw new Error(responseData.error);
      }

      if (responseData.warning) {
        setWarning(responseData.warning);
      }

      if (responseData.data) {
        const data = responseData.data;
        setExtractedData(data);
        setConfirmState(data.state || profile?.state || "Maharashtra");
        setConfirmPeriod(data.billingPeriod || "");
        setConfirmUnits(data.unitsKwh || 0);
      }
    } catch (err: unknown) {
      console.error("Bill scan error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to parse bill. Please check image quality and try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmLog = async () => {
    if (!user) return;
    try {
      const gridFactor = getGridFactor(confirmState);
      const co2eKg = Number((confirmUnits * gridFactor).toFixed(2));

      await addActivity(user.uid, {
        category: "electricity",
        subType: "grid",
        quantity: confirmUnits,
        unit: "kWh",
        co2eKg,
        source: "bill_ocr",
        factorVersion: DEFAULT_EMISSION_FACTORS.version,
        loggedAt: new Date(),
        note: `Electricity bill for period: ${confirmPeriod} (${confirmState})`,
      });

      // Clear state and return to dashboard
      handleReset();
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to log activity:", err);
      setError("Failed to commit log. Please try again.");
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setExtractedData(null);
    setError(null);
    setWarning(null);
  };

  const currentGridFactor = getGridFactor(confirmState);
  const currentCalculatedImpact = Number((confirmUnits * currentGridFactor).toFixed(1));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 space-y-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl w-fit mx-auto mb-4">
            <Zap className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Utility Bill Scanner</h1>
          <p className="text-muted-foreground mt-2 text-md">
            Scan your electricity bill using Gemini Vision. It extracts consumed units (kWh) and
            logs them based on regional grid carbon intensities.
          </p>
        </div>

        {error && (
          <div className="max-w-xl mx-auto p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-start gap-2.5 text-sm font-medium">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {warning && (
          <div className="max-w-xl mx-auto p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 rounded-xl flex items-start gap-2.5 text-sm font-medium">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <span>⚠️ {warning}</span>
          </div>
        )}

        {/* Upload Container */}
        {!imagePreview && (
          <div className="max-w-xl mx-auto">
            <label
              htmlFor="bill-file-input"
              className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 bg-card/50 hover:bg-muted/40 transition-all rounded-3xl p-12 cursor-pointer text-center group"
            >
              <UploadCloud className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors mb-4" />
              <span className="font-bold text-sm">Select Bill Image</span>
              <span className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, or WebP up to 4MB
              </span>
              <input
                id="bill-file-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                aria-label="Select bill image file"
              />
            </label>
          </div>
        )}

        {/* Preview & Processing */}
        {imagePreview && !extractedData && (
          <div className="max-w-xl mx-auto glass p-6 rounded-3xl shadow-xl flex flex-col items-center gap-6">
            <div className="relative w-full max-h-64 rounded-xl overflow-hidden border border-border">
              <Image
                src={imagePreview}
                alt="Bill Preview"
                unoptimized
                width={500}
                height={256}
                className="object-contain w-full max-h-64 bg-black/5"
              />
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={handleReset}
                disabled={analyzing}
                aria-label="Reset bill scanner"
                className="flex-1 py-3 border border-border hover:bg-muted rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleUploadAndAnalyze}
                disabled={analyzing}
                aria-label="Scan utility bill"
                className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-full text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>OCR Scanning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Scan Bill</span>
                  </>
                )}
              </button>
            </div>

            {analyzing && (
              <p className="text-xs text-muted-foreground animate-pulse text-center leading-relaxed">
                Gemini is examining the bill layout, isolating units consumed (kWh), and detecting
                state-level billing markers.
              </p>
            )}
          </div>
        )}

        {/* Results Confirmation */}
        {extractedData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Image Preview Side */}
            <div className="glass p-6 rounded-3xl border border-border shadow-md flex items-center justify-center">
              <Image
                src={imagePreview!}
                alt="Original Bill Image"
                unoptimized
                width={500}
                height={350}
                className="object-contain max-h-[350px] w-full rounded-lg bg-black/5"
              />
            </div>

            {/* Editing Form Side */}
            <div className="glass p-6 rounded-3xl border border-border shadow-md flex flex-col justify-between space-y-6">
              <div>
                <h2 className="text-lg font-bold border-b border-border pb-3 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Confirm Extracted Data
                </h2>

                <div className="space-y-4">
                  {/* State Select */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> State / Grid Zone
                    </label>
                    <select
                      value={confirmState}
                      onChange={(e) => setConfirmState(e.target.value)}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none"
                    >
                      {statesList.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Billing Period Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Billing Period
                    </label>
                    <input
                      type="text"
                      value={confirmPeriod}
                      onChange={(e) => setConfirmPeriod(e.target.value)}
                      placeholder="e.g. May 2026"
                      className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>

                  {/* Units Billed Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5" /> Units Consumed (kWh)
                    </label>
                    <input
                      type="number"
                      value={confirmUnits}
                      onChange={(e) => setConfirmUnits(Number(e.target.value))}
                      className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Carbon Calculation Display */}
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs text-muted-foreground font-semibold">
                  <span>Grid Intensity Factor ({confirmState})</span>
                  <span>{currentGridFactor.toFixed(2)} kg CO2e / kWh</span>
                </div>
                <div className="flex justify-between items-center border-t border-border/40 pt-2">
                  <span className="text-sm font-bold">Total Emission Impact</span>
                  <span className="text-xl font-black text-primary">
                    {currentCalculatedImpact} kg CO2e
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 border border-border hover:bg-muted rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleConfirmLog}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground font-bold rounded-full text-xs hover:bg-primary/90 transition-colors shadow-md shadow-primary/25 flex items-center justify-center gap-1"
                >
                  <Check className="h-4 w-4" />
                  <span>Confirm & Log</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

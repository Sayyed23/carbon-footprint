import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "Image data (base64) and mimeType are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured. Returning mock utility bill extraction.");
      return NextResponse.json({
        data: {
          state: "Maharashtra",
          billingPeriod: "May 2026",
          unitsKwh: 342,
        },
        warning:
          "Running in mock mode. Set GEMINI_API_KEY in .env.local to enable real OCR parsing.",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            state: { type: SchemaType.STRING },
            billingPeriod: { type: SchemaType.STRING },
            unitsKwh: { type: SchemaType.NUMBER },
          },
          required: ["state", "billingPeriod", "unitsKwh"],
        },
      },
    });

    const prompt = `You are a utility bill parser for Indian electricity boards (MSEDCL, Tata Power, BESCOM, Adani, BSES, etc.).
Extract the following structured data from this electricity bill photo:
1. Consumer State (e.g. "Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "Gujarat") - match to closest standard Indian state.
2. Billing Cycle Period / Billing Month (e.g. "May 2026", "April-May 2026")
3. Total Units Consumed in kWh (often labeled as "Units", "Units Billed", "Total kWh", "Consumption", "Current Reading - Previous Reading" calculation).

Only extract what is present in the image. Return units as a clean number.`;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedJson = JSON.parse(responseText);
    return NextResponse.json({ data: parsedJson });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Utility Bill Vision OCR failed:", err);
    return NextResponse.json({ error: err.message || "Failed to analyze image" }, { status: 500 });
  }
}

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Callable function that triggers Gemini Vision to OCR and extract billing data.
 */
export const parseUtilityBill = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }

  const { imageBase64, mimeType } = request.data;
  if (!imageBase64 || !mimeType) {
    throw new HttpsError("invalid-argument", "imageBase64 and mimeType parameters are required.");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new HttpsError("failed-precondition", "Gemini API key is not configured on the server.");
  }

  try {
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
            unitsKwh: { type: SchemaType.NUMBER }
          },
          required: ["state", "billingPeriod", "unitsKwh"]
        }
      }
    });

    const prompt = `You are a utility bill parser for Indian electricity boards.
Extract the following structured data from this electricity bill photo:
1. Consumer State (standard Indian state).
2. Billing Cycle Period (e.g. "May 2026", "April-May 2026")
3. Total Units Consumed in kWh (clean number).`;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    if (!responseText) {
      throw new HttpsError("internal", "Received empty response from Gemini API.");
    }

    const parsedJson = JSON.parse(responseText);
    return { data: parsedJson };

  } catch (error: any) {
    console.error("Gemini Vision OCR Cloud Function failed:", error);
    throw new HttpsError("internal", error.message || "Failed to process bill image scanner.");
  }
});

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Callable function that parses natural-language text into structured carbon activities.
 */
export const parseActivityText = onCall({ secrets: ["GEMINI_API_KEY"] }, async (request) => {
  // Ensure authenticated call
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }

  const text = request.data.text;
  if (!text) {
    throw new HttpsError("invalid-argument", "Text parameter is required.");
  }

  // Retrieve Gemini API Key from environment or Google Secret Manager
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
            activities: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  category: { 
                    type: SchemaType.STRING, 
                    enum: ["transport", "electricity", "cooking", "diet", "consumption"],
                    format: "enum"
                  },
                  subType: { type: SchemaType.STRING },
                  quantity: { type: SchemaType.NUMBER },
                  unit: { type: SchemaType.STRING },
                  note: { type: SchemaType.STRING }
                },
                required: ["category", "subType", "quantity", "unit", "note"]
              }
            }
          },
          required: ["activities"]
        }
      }
    });

    const prompt = `You are a carbon footprint activity parser for the Indian market.
Parse the user's natural language daily log text into one or more structured activity entries.
User log: "${text}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    if (!responseText) {
      throw new HttpsError("internal", "Received empty response from Gemini API.");
    }

    const parsedJson = JSON.parse(responseText);
    return { activities: parsedJson.activities };

  } catch (error: unknown) {
    const err = error as Error;
    console.error("Gemini Cloud Function parse failed:", err);
    throw new HttpsError("internal", err.message || "Failed to process text parser.");
  }
});

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured. Returning mock parsed activities.");
      return NextResponse.json({ 
        activities: mockParse(text),
        warning: "Running in mock mode. Set GEMINI_API_KEY in .env.local to enable real AI parsing."
      });
    }

    // Initialize Google Generative AI SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using gemini-2.5-flash for speed and lower token costs
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
The text may contain Hinglish or regional Indian terms (e.g. "auto", "rickshaw", "share-auto", "activa", "scooter", "two-wheeler", "metro", "local train", "veg thali", "paneer", "biryani", "chicken", "AC for 4 hours", "biomass", "cylinder").

User log: "${text}"

Translate regional vehicles or items into standard subtypes from this set:
- Transport: "2w_petrol", "2w_ev", "3w_cng", "3w_diesel", "4w_petrol", "4w_diesel", "4w_cng", "4w_ev", "bus_diesel", "bus_cng_ev", "metro_train", "flight_domestic"
- Electricity: "grid" (quantity in kWh)
- Cooking: "lpg_cylinder", "png_m3", "biomass_kg", "electric_kwh"
- Diet: "vegan", "vegetarian", "eggetarian", "non_veg_low", "non_veg_high"
- Consumption: "delivery_order", "fashion_item", "electronics_device"

Only extract what is explicitly stated or strongly implied. Set reasonable default quantities if units are not specified (e.g. 1 day of diet, typical 10 km auto ride).`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedJson = JSON.parse(responseText);
    return NextResponse.json({ activities: parsedJson.activities });

  } catch (error: any) {
    console.error("Gemini parse error:", error);
    return NextResponse.json({ error: error.message || "Failed to parse text" }, { status: 500 });
  }
}

// Fallback Mock Parser for zero-setup local runs
function mockParse(text: string) {
  const lowercase = text.toLowerCase();
  const activities = [];

  if (lowercase.includes("scooter") || lowercase.includes("activa") || lowercase.includes("2w") || lowercase.includes("two wheeler") || lowercase.includes("bike")) {
    activities.push({
      category: "transport",
      subType: "2w_petrol",
      quantity: 15,
      unit: "km",
      note: "Scooter travel (estimated 15km)"
    });
  } else if (lowercase.includes("car") || lowercase.includes("taxi") || lowercase.includes("cab")) {
    activities.push({
      category: "transport",
      subType: "4w_petrol",
      quantity: 20,
      unit: "km",
      note: "Car commute (estimated 20km)"
    });
  } else if (lowercase.includes("auto") || lowercase.includes("rickshaw")) {
    activities.push({
      category: "transport",
      subType: "3w_cng",
      quantity: 8,
      unit: "km",
      note: "CNG Auto-rickshaw ride (estimated 8km)"
    });
  } else if (lowercase.includes("metro") || lowercase.includes("train")) {
    activities.push({
      category: "transport",
      subType: "metro_train",
      quantity: 25,
      unit: "km",
      note: "Metro train commute (estimated 25km)"
    });
  }

  if (lowercase.includes("veg") || lowercase.includes("thali") || lowercase.includes("paneer") || lowercase.includes("roti") || lowercase.includes("dal")) {
    activities.push({
      category: "diet",
      subType: "vegetarian",
      quantity: 1,
      unit: "day",
      note: "Vegetarian meals"
    });
  } else if (lowercase.includes("chicken") || lowercase.includes("biryani") || lowercase.includes("non-veg") || lowercase.includes("egg") || lowercase.includes("fish")) {
    activities.push({
      category: "diet",
      subType: lowercase.includes("egg") ? "eggetarian" : "non_veg_low",
      quantity: 1,
      unit: "day",
      note: lowercase.includes("egg") ? "Eggetarian diet log" : "Non-vegetarian meal (low-meat)"
    });
  }

  if (lowercase.includes("ac") || lowercase.includes("air conditioner")) {
    activities.push({
      category: "electricity",
      subType: "grid",
      quantity: 6,
      unit: "kWh",
      note: "Air conditioner running (estimated 6 kWh)"
    });
  }

  if (activities.length === 0) {
    activities.push({
      category: "diet",
      subType: "vegetarian",
      quantity: 1,
      unit: "day",
      note: "Default vegetarian diet log (from context)"
    });
  }

  return activities;
}

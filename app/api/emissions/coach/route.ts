import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface CoachMessage {
  role: string;
  content: string;
}

interface CoachActivity {
  category: string;
  subType: string;
  quantity: number;
  unit: string;
  co2eKg: number;
}

interface CoachProfile {
  state?: string;
  dietType?: string;
  householdSize?: number;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, activities, profile } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured. Returning mock Carbon Coach response.");
      return NextResponse.json({
        response: mockCoachResponse(messages, activities, profile),
        warning:
          "Running in mock mode. Set GEMINI_API_KEY in .env.local to enable real AI coaching.",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format recent activities for prompt grounding
    const formattedActivities =
      activities && Array.isArray(activities) && activities.length > 0
        ? activities
            .slice(0, 10)
            .map(
              (a: CoachActivity) =>
                `- Category: ${a.category}, Type: ${a.subType}, Qty: ${a.quantity} ${a.unit}, Impact: ${a.co2eKg} kg CO2e`
            )
            .join("\n")
        : "No recent activities logged yet.";

    const systemPrompt = `You are the EcoTrace Carbon Coach, an expert sustainability adviser specializing in carbon footprint reduction in India. 
Your tone is friendly, encouraging, and highly specific.

USER PROFILE:
- Location: ${profile?.state || "Unknown State"}, India
- Diet: ${profile?.dietType || "Vegetarian"}
- Household Size: ${profile?.householdSize || 4}

USER'S RECENT LOGGED ACTIVITIES:
${formattedActivities}

GUIDELINES:
1. Ground your advice in the user's actual logs. For example, if they have high transport emissions from petrol cars, suggest ride-sharing, metro rails, or switching to an EV scooter. If their diet is non-veg, discuss substituting high-footprint meat days.
2. Ensure suggestions reflect Indian lifestyles (e.g. domestic LPG cylinders, induction cooking, local rail/metros, two-wheeler Activis/scooters, regional vegetarian diets).
3. Do not invent facts or numbers. If giving emission numbers, explain how they relate to typical Indian averages (national grid average is ~0.71 kg CO2/kWh).
4. Be brief. Keep responses to 2-3 short paragraphs.
5. If the user asks about unrelated topics (e.g., programming, gossip, recipes not related to carbon footprint), politely decline to answer, keeping focus strictly on carbon tracking, environment, and climate action.`;

    // Map message history to Gemini format (user/model)
    const chatHistory = messages.slice(0, -1).map((msg: CoachMessage) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();

    return NextResponse.json({ response: responseText });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Carbon Coach API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate coaching response" },
      { status: 500 }
    );
  }
}

function mockCoachResponse(
  messages: CoachMessage[],
  activities: CoachActivity[],
  profile: CoachProfile
) {
  const lastMsg = messages[messages.length - 1].content.toLowerCase();

  if (
    lastMsg.includes("commute") ||
    lastMsg.includes("travel") ||
    lastMsg.includes("car") ||
    lastMsg.includes("scooter")
  ) {
    return `Based on your transport log, switching from a private petrol car (~0.14 kg CO2e/km) to a two-wheeler (~0.05 kg CO2e/km) or public metro rail (~0.018 kg CO2e/km) cuts emissions significantly. Since you live in ${profile?.state || "Maharashtra"}, commuting via local rail or bus lines twice a week could reduce your travel footprint by up to 15 kg CO2e weekly!`;
  }

  if (
    lastMsg.includes("electricity") ||
    lastMsg.includes("bill") ||
    lastMsg.includes("ac") ||
    lastMsg.includes("power")
  ) {
    return `In ${profile?.state || "Maharashtra"}, the electricity grid emits about 0.74 kg CO2e per kWh (Combined Margin). Reducing your AC run-time by just 2 hours daily can save around 2-3 kWh of energy. Over a month, that reduces your footprint by 45 kg CO2e and lowers your utility bill by ₹300-₹400!`;
  }

  if (
    lastMsg.includes("food") ||
    lastMsg.includes("diet") ||
    lastMsg.includes("veg") ||
    lastMsg.includes("meat")
  ) {
    return `Your diet is currently profile-configured as ${profile?.dietType || "Vegetarian"}. A vegetarian diet averages ~1.6 kg CO2e/day, whereas a vegan diet is ~1.1 kg CO2e/day. Substituting dairy-heavy products like paneer with tofu or plant-based alternatives a couple of times a week is a great way to step down your footprint!`;
  }

  return `Hello! As your EcoTrace Carbon Coach, I'm here to help you navigate carbon tracking in India. Looking at your profile in ${profile?.state || "Maharashtra"}, your daily logs are the key to unlocking custom suggestions. Let me know if you want to explore reduction tips for transport, home energy, or dietary impacts!`;
}

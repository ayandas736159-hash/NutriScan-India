
import { GoogleGenAI, Type } from "@google/genai";
import { NutritionAnalysis, Language } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  // In Vercel, Vite might stringify missing env vars as "undefined"
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("API_KEY_MISSING: The Gemini API Key is not configured. Go to Vercel Project Settings > Environment Variables, add 'API_KEY', and then trigger a NEW DEPLOYMENT (Redeploy).");
  }
  return new GoogleGenAI({ apiKey: apiKey });
};

const LOCALIZED_STRING_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    en: { type: Type.STRING },
    bn: { type: Type.STRING },
    hi: { type: Type.STRING }
  },
  required: ["en", "bn", "hi"]
};

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { ...LOCALIZED_STRING_SCHEMA },
          portion: { ...LOCALIZED_STRING_SCHEMA },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fats: { type: Type.NUMBER },
          notes: { ...LOCALIZED_STRING_SCHEMA },
          status: { type: Type.STRING, enum: ["PASS", "FAIL", "WARNING"] }
        },
        required: ["name", "portion", "calories", "protein", "carbs", "fats", "notes", "status"]
      }
    },
    totalCalories: { type: Type.NUMBER },
    totalProtein: { type: Type.NUMBER },
    totalCarbs: { type: Type.NUMBER },
    totalFats: { type: Type.NUMBER },
    healthRating: { type: Type.NUMBER },
    advice: { ...LOCALIZED_STRING_SCHEMA }
  },
  required: ["items", "totalCalories", "totalProtein", "totalCarbs", "totalFats", "healthRating", "advice"]
};

const NUTRITION_CACHE_PREFIX = 'nutryscan_v7_';

async function computeImageHash(base64: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(base64.substring(0, 1000));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return 'simple_' + base64.length;
  }
}

export const analyzeFoodImage = async (base64Image: string, lang: Language): Promise<NutritionAnalysis> => {
  // Switched to gemini-3-flash-preview as requested to avoid quota exhaustion.
  const model = "gemini-3-flash-preview"; 

  const imageHash = await computeImageHash(base64Image);
  const cacheKey = NUTRITION_CACHE_PREFIX + imageHash;

  // 1. Cache Check
  try {
    const cachedItem = localStorage.getItem(cacheKey);
    if (cachedItem) {
      const parsed = JSON.parse(cachedItem);
      return parsed.data || parsed;
    }
  } catch (e) {}

  // 2. API Call
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            },
            {
              text: `Act as a specialized Bengali & Indian Nutritionist. 
              Image Context: Bengali Household Thali / Indian Street Food.
              
              Identify every item on the plate. Estimate calories precisely.
              Note hidden calories: 
              - Oil soak in "Alu Bhaja" or "Beguni".
              - Sugar in "Chutney" or "Mishti".
              - Refined carb density in white rice/maida roti.
              
              Provide 'name', 'portion', 'notes', and 'advice' in 'en', 'bn', and 'hi'.
              If no food is detected, return empty items list and 0 calories.`
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        temperature: 0.1,
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) throw new Error("API_ERROR: The model returned an empty response.");
    
    const result = JSON.parse(jsonStr) as NutritionAnalysis;

    // Cache the result
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: result }));
    } catch (e) {}

    return result;
  } catch (err: any) {
    console.error("Gemini Vision Error:", err);
    
    // Check for specific API Key errors
    if (err.message?.includes("403") || err.message?.includes("API key")) {
      throw new Error("INVALID_API_KEY: The API key provided is invalid or has expired. Please update it in Vercel.");
    }
    
    if (err.message?.includes("429") || err.message?.includes("quota")) {
      throw new Error("LIMIT_EXCEEDED: You've reached the free tier limit. Please wait 1 minute and try again.");
    }

    throw new Error(err.message || "Something went wrong while communicating with Gemini. Please try again.");
  }
};

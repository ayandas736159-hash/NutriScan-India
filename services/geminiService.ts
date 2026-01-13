
/// <reference types="node" />
import { GoogleGenAI, Type } from "@google/genai";
import { NutritionAnalysis, Language } from "../types";

// Initialize the Google GenAI client using the API key from process.env.
// In Vite, this is replaced at build time by the 'define' config.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the food item." },
          portion: { type: Type.STRING, description: "Estimated portion size." },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fats: { type: Type.NUMBER },
          notes: { type: Type.STRING, description: "Observations on cooking style or ingredients." },
          status: { type: Type.STRING, enum: ["PASS", "FAIL", "WARNING"], description: "PASS for balanced, WARNING for high calorie/oil, FAIL for extremely unhealthy portions." }
        },
        required: ["name", "portion", "calories", "protein", "carbs", "fats", "notes", "status"]
      }
    },
    totalCalories: { type: Type.NUMBER },
    totalProtein: { type: Type.NUMBER },
    totalCarbs: { type: Type.NUMBER },
    totalFats: { type: Type.NUMBER },
    healthRating: { type: Type.NUMBER },
    advice: { type: Type.STRING }
  },
  required: ["items", "totalCalories", "totalProtein", "totalCarbs", "totalFats", "healthRating", "advice"]
};

export const analyzeFoodImage = async (base64Image: string, lang: Language): Promise<NutritionAnalysis> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const model = "gemini-3-flash-preview";
  
  const langContext = {
    en: "English",
    bn: "Bengali (বাংলা)",
    hi: "Hindi (हिन्दी)"
  };

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          text: `You are GovGuide India's Nutrition Auditor. 
          Task: Perform a 'Zero-Error' nutritional audit of this Indian/Bengali meal.
          
          Language: Respond ONLY in ${langContext[lang]}.
          
          Guidelines:
          1. Detect items like Luchi, Chholar Dal, Kosha Mangsho, Macher Jhol, etc.
          2. Audit based on standard household cooking (e.g., use of mustard oil, ghee, sugar).
          3. Verification Status Rules:
             - PASS: High protein/fiber, low processed oil.
             - WARNING: Deep fried (Luchi/Bhaja) or high carb (Large Rice portion).
             - FAIL: Excessive sugar (Mishti) or oil-soaked items.
          
          Return JSON format adhering to the schema.`
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA,
      temperature: 0.1,
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from AI model.");
  }

  return JSON.parse(text) as NutritionAnalysis;
};

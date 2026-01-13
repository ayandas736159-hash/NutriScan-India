
import { GoogleGenAI, Type } from "@google/genai";
import { NutritionAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the food item (e.g., Luchi, Macher Jhol, Chholar Dal)." },
          portion: { type: Type.STRING, description: "Estimated portion size (e.g., 2 pieces, 1 bowl)." },
          calories: { type: Type.NUMBER, description: "Calories in kcal." },
          protein: { type: Type.NUMBER, description: "Protein in grams." },
          carbs: { type: Type.NUMBER, description: "Carbohydrates in grams." },
          fats: { type: Type.NUMBER, description: "Fats in grams." },
          notes: { type: Type.STRING, description: "Specific details about ingredients detected (e.g., contains mustard oil)." }
        },
        required: ["name", "portion", "calories", "protein", "carbs", "fats"]
      }
    },
    totalCalories: { type: Type.NUMBER },
    totalProtein: { type: Type.NUMBER },
    totalCarbs: { type: Type.NUMBER },
    totalFats: { type: Type.NUMBER },
    healthRating: { type: Type.NUMBER, description: "A score from 1-10 on how balanced this meal is." },
    advice: { type: Type.STRING, description: "A short, helpful tip for the user regarding this specific meal." }
  },
  required: ["items", "totalCalories", "totalProtein", "totalCarbs", "totalFats", "healthRating", "advice"]
};

export const analyzeFoodImage = async (base64Image: string): Promise<NutritionAnalysis> => {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Analyze this photo of an Indian/Bengali meal. 
            Identify all items (e.g., Rice, Dal, Bhaja, Macher Jhol, Luchi, Mishti, etc.). 
            Provide precise nutritional estimation based on standard Bengali household cooking styles.
            Return the result in JSON format.`
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
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

  const result = JSON.parse(response.text || "{}");
  return result as NutritionAnalysis;
};

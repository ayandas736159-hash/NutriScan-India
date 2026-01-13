
/// <reference types="node" />
import { GoogleGenAI, Type } from "@google/genai";
import { NutritionAnalysis } from "../types";

// Initialize the Google GenAI client using the API key from process.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the structured schema for nutrition analysis to ensure the model returns data in a predictable format.
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
        // Include all mandatory fields to ensure strict adherence to the expected JSON structure.
        required: ["name", "portion", "calories", "protein", "carbs", "fats", "notes"]
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
  // Use gemini-3-flash-preview for efficient image-to-text nutritional auditing.
  const model = "gemini-3-flash-preview";
  
  // Use the recommended contents structure with parts for a single-turn multimodal request.
  const response = await ai.models.generateContent({
    model,
    contents: {
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
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA,
      temperature: 0.1,
    }
  });

  // The text property returns the generated string directly.
  const result = JSON.parse(response.text || "{}");
  return result as NutritionAnalysis;
};

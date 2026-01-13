import { GoogleGenAI, Type } from "@google/genai";
import { NutritionAnalysis, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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
          name: { ...LOCALIZED_STRING_SCHEMA, description: "Food name in English, Bengali, and Hindi" },
          portion: { ...LOCALIZED_STRING_SCHEMA, description: "Portion size in English, Bengali, and Hindi" },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fats: { type: Type.NUMBER },
          notes: { ...LOCALIZED_STRING_SCHEMA, description: "Nutritional notes in English, Bengali, and Hindi" },
          status: { type: Type.STRING, enum: ["PASS", "FAIL", "WARNING"], description: "PASS for balanced, WARNING for high oil/carb, FAIL for unhealthy portions." }
        },
        required: ["name", "portion", "calories", "protein", "carbs", "fats", "notes", "status"]
      }
    },
    totalCalories: { type: Type.NUMBER },
    totalProtein: { type: Type.NUMBER },
    totalCarbs: { type: Type.NUMBER },
    totalFats: { type: Type.NUMBER },
    healthRating: { type: Type.NUMBER },
    advice: { ...LOCALIZED_STRING_SCHEMA, description: "A blunt, honest health tip in English, Bengali, and Hindi." }
  },
  required: ["items", "totalCalories", "totalProtein", "totalCarbs", "totalFats", "healthRating", "advice"]
};

const NUTRITION_CACHE_PREFIX = 'nutryscan_v3_multi_';

/**
 * Robust SHA-256 hashing to ensure exact same images generate the exact same cache key.
 * Falls back to a simple hash if Crypto API is unavailable.
 */
async function computeImageHash(base64: string): Promise<string> {
  try {
    // Use Web Crypto API for collision-resistant hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(base64);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    console.warn("Crypto API unavailable, using fallback hash", e);
    // Fallback: Simple DJB2-like string hash
    let hash = 5381;
    for (let i = 0; i < base64.length; i++) {
      hash = ((hash << 5) + hash) + base64.charCodeAt(i); /* hash * 33 + c */
    }
    return 'simple_' + hash.toString();
  }
}

/**
 * Save to localStorage with quota management.
 * If quota is exceeded, clears old NutryScan cache entries.
 */
function saveToCache(key: string, data: NutritionAnalysis) {
  try {
    const cacheEntry = JSON.stringify({
      timestamp: Date.now(),
      data
    });
    localStorage.setItem(key, cacheEntry);
    console.log("Analysis cached successfully.");
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
      console.warn("LocalStorage quota exceeded. Clearing old NutryScan cache...");
      // Clear all keys starting with our prefix to make space
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(NUTRITION_CACHE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      
      // Retry saving
      try {
        localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
        console.log("Analysis cached after cleanup.");
      } catch (retryErr) {
        console.error("Failed to cache analysis even after cleanup:", retryErr);
      }
    } else {
      console.error("LocalStorage error:", e);
    }
  }
}

export const analyzeFoodImage = async (base64Image: string, lang: Language): Promise<NutritionAnalysis> => {
  const model = "gemini-3-flash-preview";
  
  // Note: We generate content for ALL languages regardless of the requested 'lang'.
  // 'lang' might be used for logging or initial preference if needed, but the output structure covers all.

  const refusalMessages = {
    en: "Content cannot be analyzed. NutryScan India does not provide analysis for illegal, harmful, or socially disapproved items.",
    bn: "বিশ্লেষণ করা সম্ভব নয়। NutryScan India অবৈধ, ক্ষতিকারক, বা সামাজিকভাবে অস্বীকৃত জিনিসপত্রের জন্য বিশ্লেষণ প্রদান করে না।",
    hi: "सामग्री का विश्लेषण नहीं किया जा सकता। NutryScan India अवैध, हानिकारक, या सामाजिक रूप से अस्वीকৃত वस्तुओं के लिए विश्लेषण प्रदान नहीं करता है।"
  };

  // 1. Generate a robust hash for the image
  const imageHash = await computeImageHash(base64Image);
  // Cache key is now language-agnostic because we store all languages
  const cacheKey = NUTRITION_CACHE_PREFIX + imageHash;

  // 2. Check Cache
  try {
    const cachedItem = localStorage.getItem(cacheKey);
    if (cachedItem) {
      const parsed = JSON.parse(cachedItem);
      const analysisData = parsed.data || parsed; 
      
      // Basic validation
      if (analysisData && analysisData.totalCalories !== undefined) {
        console.log('CACHE HIT: Returning stored analysis for hash', imageHash.substring(0, 8));
        return analysisData as NutritionAnalysis;
      }
    }
  } catch (e) {
    console.warn("Cache read failed:", e);
  }

  console.log('CACHE MISS: Calling Gemini API for hash', imageHash.substring(0, 8));

  // 3. Call API if not cached
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          text: `You are NutryScan India's Health Companion. 
          Mission: "Homemade ≠ Low Calorie. Help people see the hidden calories."
          
          Task: Perform an 'Honest Health Check' of this Indian/Bengali household meal.
          
          **Strict Protocols:**
          1. **Multilingual Output:** You MUST provide the 'name', 'portion', 'notes', and 'advice' fields in English ('en'), Bengali ('bn'), and Hindi ('hi') simultaneously.
          2. **Consistency:** Numerical values (calories, protein, etc.) apply to the food item and remain constant across languages.
          3. **Safety & Ethics (ZERO TOLERANCE):** If the image clearly depicts any illegal substances, alcohol, tobacco, non-food items, or harmful content, you **MUST NOT** perform analysis. Return a JSON with empty items and the localized refusal messages in the 'advice' field.

          Focus areas for edible items:
          1. The 'Rice' Trap: Is the carbohydrate portion too large compared to proteins?
          2. Invisible Oil: Estimate how much oil (Mustard oil/Ghee) was absorbed in fries ('Bhaja') or curries.
          3. Protein Deficiency: Is there enough Dal, Egg, Fish, or Meat?
          4. Sugar Alert: Detect hidden sugars.
          
          Return JSON format strictly matching the provided schema.`
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
      temperature: 0.0, // Set to 0.0 for maximum determinism
    }
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from AI model.");
  
  try {
    const analysisResult = JSON.parse(text) as NutritionAnalysis;
    
    // Safety check fallback if model returns refusal logic via empty items but valid JSON
    if (analysisResult.items.length === 0 && analysisResult.totalCalories === 0) {
        analysisResult.advice = refusalMessages;
    }

    // 4. Save to Cache
    saveToCache(cacheKey, analysisResult);

    return analysisResult;
  } catch (parseError) {
    console.error("Failed to parse AI response:", text, parseError);
    throw new Error("Invalid response format from AI. Please try again.");
  }
};
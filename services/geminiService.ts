import { GoogleGenAI, Type } from "@google/genai";
import { NutritionAnalysis, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the food item using regional terms (e.g., 'Bhaat', 'Roti')." },
          portion: { type: Type.STRING, description: "Estimated portion size." },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fats: { type: Type.NUMBER },
          notes: { type: Type.STRING, description: "Observations on things like oil absorption or hidden sugars." },
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
    advice: { type: Type.STRING, description: "A blunt, honest health tip about the meal's balance." }
  },
  required: ["items", "totalCalories", "totalProtein", "totalCarbs", "totalFats", "healthRating", "advice"]
};

const NUTRITION_CACHE_PREFIX = 'nutryscan_cache_v2_';

/**
 * Robust SHA-256 hashing to ensure exact same images generate the exact same cache key.
 * Falls back to a simple hash if Crypto API is unavailable.
 */
async function computeImageHash(base64: string): Promise<string> {
  try {
    // Use Web Crypto API for collision-resistant hashing
    const encoder = new TextEncoder();
    // Use a view of the string if possible to avoid massive allocation, 
    // but encode() requires string. 
    // Modern browsers handle this efficiently.
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
  
  const langContext = {
    en: "English (Indian Household terms)",
    bn: "Bengali (বাংলা) - use 'Bhaat', 'Sorsher Tel', 'Bhaja'",
    hi: "Hindi (हिन्दी) - use 'Ghee', 'Roti', 'Teekha'"
  };

  const refusalMessages = {
    en: "Content cannot be analyzed. NutryScan India does not provide analysis for illegal, harmful, or socially disapproved items.",
    bn: "বিশ্লেষণ করা সম্ভব নয়। NutryScan India অবৈধ, ক্ষতিকারক, বা সামাজিকভাবে অস্বীকৃত জিনিসপত্রের জন্য বিশ্লেষণ প্রদান করে না।",
    hi: "सामग्री का विश्लेषण नहीं किया जा सकता। NutryScan India अवैध, हानिकारक, या सामाजिक रूप से अस्वीকৃত वस्तुओं के लिए विश्लेषण प्रदान नहीं करता है।"
  };

  // 1. Generate a robust hash for the image
  const imageHash = await computeImageHash(base64Image);
  const cacheKey = NUTRITION_CACHE_PREFIX + imageHash + '_' + lang;

  // 2. Check Cache
  try {
    const cachedItem = localStorage.getItem(cacheKey);
    if (cachedItem) {
      const parsed = JSON.parse(cachedItem);
      // Support legacy cache format or new format with timestamp
      const analysisData = parsed.data || parsed; 
      
      // Basic validation to ensure cached data isn't corrupted
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
          1. **Consistency:** Your output JSON structure and numerical values MUST be consistent for the same edible items or images. Aim for deterministic results with the given temperature setting (0.0).
          2. **Safety & Ethics (ZERO TOLERANCE):** If the image clearly depicts any illegal substances (e.g., drugs), alcohol, tobacco, non-food items, or any content that is harmful, socially disapproved, or inherently unhealthy beyond typical food (e.g., highly processed junk food explicitly requested as "unhealthy"), you **MUST NOT** perform nutritional analysis. In such cases, return a JSON object with the following exact structure:
             - \`items\`: []
             - \`totalCalories\`: 0
             - \`totalProtein\`: 0
             - \`totalCarbs\`: 0
             - \`totalFats\`: 0
             - \`healthRating\`: 0
             - \`advice\`: "${refusalMessages[lang]}" (use the exact localized message for the current language)

          Language Protocol: Respond ONLY in ${langContext[lang]}.
          
          Focus areas for edible items:
          1. The 'Rice' Trap: Is the carbohydrate portion too large compared to proteins?
          2. Invisible Oil: Estimate how much oil (Mustard oil/Ghee) was absorbed in fries ('Bhaja') or curries.
          3. Protein Deficiency: Is there enough Dal, Egg, Fish, or Meat for a proper meal?
          4. Sugar Alert: Detect hidden sugars in tea or sweets.
          
          Return JSON format strictly.`
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
    
    // 4. Save to Cache
    saveToCache(cacheKey, analysisResult);

    return analysisResult;
  } catch (parseError) {
    console.error("Failed to parse AI response:", text, parseError);
    throw new Error("Invalid response format from AI. Please try again.");
  }
};
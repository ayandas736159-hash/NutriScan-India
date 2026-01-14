
import { GoogleGenAI, Type } from "@google/genai";
import { NutritionAnalysis, Language } from "../types";

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    const apiKey = process.env.API_KEY;
    // Handle Vite's "undefined" stringification or missing env var
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      throw new Error("API Key is missing. Please ensure API_KEY is set in your Vercel Environment Variables and redeploy.");
    }
    ai = new GoogleGenAI({ apiKey: apiKey });
  }
  return ai;
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

const NUTRITION_CACHE_PREFIX = 'nutryscan_v5_';

async function computeImageHash(base64: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(base64);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    let hash = 5381;
    for (let i = 0; i < base64.length; i++) {
      hash = ((hash << 5) + hash) + base64.charCodeAt(i);
    }
    return 'simple_' + hash.toString();
  }
}

function saveToCache(key: string, data: NutritionAnalysis) {
  try {
    const cacheEntry = JSON.stringify({ timestamp: Date.now(), data });
    localStorage.setItem(key, cacheEntry);
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(NUTRITION_CACHE_PREFIX)) keysToRemove.push(k);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      try {
        localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
      } catch (retryErr) {}
    }
  }
}

export const analyzeFoodImage = async (base64Image: string, lang: Language): Promise<NutritionAnalysis> => {
  // Use gemini-3-flash-preview for multimodal analysis and native JSON support
  const model = "gemini-3-flash-preview"; 
  
  const refusalMessages = {
    en: "Content cannot be analyzed. This image does not contain edible food. NutryScan India only provides analysis for Indian and Bengali meals. Please scan a thali or meal.",
    bn: "বিশ্লেষণ করা সম্ভব নয়। এই ছবিতে কোনও খাবার নেই। NutryScan India শুধুমাত্র ভারতীয় এবং বাঙালি খাবারের বিশ্লেষণ প্রদান করে। আপনার থালি বা খাবারের ছবি স্ক্যান করুন।",
    hi: "सामग्री का विश्लेषण नहीं किया जाएगा। इस तस्वीर में कोई खाद्य पदार्थ नहीं है। NutryScan India केवल भारतीय और बंगाली भोजन का विश्लेषण प्रदान करता है। कृपया अपनी थाली या भोजन की तस्वीर स्कैन करें।"
  };

  const imageHash = await computeImageHash(base64Image);
  const cacheKey = NUTRITION_CACHE_PREFIX + imageHash;

  try {
    const cachedItem = localStorage.getItem(cacheKey);
    if (cachedItem) {
      const parsed = JSON.parse(cachedItem);
      const analysisData = parsed.data || parsed; 
      if (analysisData && (analysisData.items || analysisData.totalCalories !== undefined)) {
        return analysisData as NutritionAnalysis;
      }
    }
  } catch (e) {}

  try {
    const aiInstance = getAI();
    const response = await aiInstance.models.generateContent({
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
              text: `You are NutryScan India's Health Companion. 
              Mission: "Homemade ≠ Low Calorie. Help people see the hidden calories."
              
              **URGENT: NON-FOOD DETECTION PROTOCOL**
              - If the image contains ANY non-food household item (furniture, fabrics, skin with no food, etc.), return 0 items.
              - Do NOT hallucinate food.
              
              **FOOD ANALYSIS PROTOCOL (ONLY if food is clearly present):**
              1. Provide 'name', 'portion', 'notes', and 'advice' in 'en', 'bn', and 'hi'.
              2. Audit carbohydrate-heavy Bengali/Indian thalis (Rice/Roti traps).
              3. Account for oil soak in 'Bhaja', 'Luchi', or curries.
              4. Estimate portions based on standard household thali dimensions.`
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
    if (!jsonStr) throw new Error("Empty response from AI model.");
    
    try {
      const analysisResult = JSON.parse(jsonStr) as NutritionAnalysis;
      
      // Safety check for non-food or empty detections
      if (!analysisResult.items || analysisResult.items.length === 0) {
          analysisResult.items = [];
          analysisResult.totalCalories = 0;
          analysisResult.totalProtein = 0;
          analysisResult.totalCarbs = 0;
          analysisResult.totalFats = 0;
          analysisResult.healthRating = 0;
          analysisResult.advice = refusalMessages;
      }

      saveToCache(cacheKey, analysisResult);
      return analysisResult;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw Response:", jsonStr);
      throw new Error("Invalid response format from AI. Please try again.");
    }
  } catch (apiError: any) {
    console.error("Gemini API Error:", apiError);
    if (apiError.message && (apiError.message.includes("API key") || apiError.message.includes("API Key"))) {
        throw new Error("System configuration error: Invalid or missing API Key. Please check Vercel environment variables and REDEPLOY.");
    }
    throw new Error(apiError.message || "Failed to communicate with AI. Please check your internet connection.");
  }
};

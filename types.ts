
export type Language = 'en' | 'bn' | 'hi' | 'as';

export type VerificationStatus = 'PASS' | 'FAIL' | 'WARNING';

export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';

export interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  weight: number; // kg
  height: number; // cm
  activityLevel: ActivityLevel;
  tdee: number; // Total Daily Energy Expenditure
}

export interface LocalizedText {
  en: string;
  bn: string;
  hi: string;
  as: string;
}

export interface FoodItem {
  name: LocalizedText;
  portion: LocalizedText;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  notes: LocalizedText;
  status: VerificationStatus;
}

export interface NutritionAnalysis {
  items: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  healthRating: number; // 1-10
  advice: LocalizedText;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

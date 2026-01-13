
export type Language = 'en' | 'bn' | 'hi';

export type VerificationStatus = 'PASS' | 'FAIL' | 'WARNING';

export interface LocalizedText {
  en: string;
  bn: string;
  hi: string;
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

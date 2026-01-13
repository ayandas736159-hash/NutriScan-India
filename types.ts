
export type Language = 'en' | 'bn' | 'hi';

export type VerificationStatus = 'PASS' | 'FAIL' | 'WARNING';

export interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  notes: string;
  status: VerificationStatus;
}

export interface NutritionAnalysis {
  items: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  healthRating: number; // 1-10
  advice: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

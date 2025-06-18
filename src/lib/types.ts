export interface FoodItem {
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: string;
}

export interface CalorieEntry {
  id: string;
  timestamp: string;
  input: string;
  items: FoodItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  confidence: "high" | "medium" | "low";
  reasoning: string;
}

export interface DailyTotal {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  entries: number;
}

export interface UserSettings {
  openai_api_key?: string;
  daily_goal?: number;
  theme?: "light" | "dark";
}

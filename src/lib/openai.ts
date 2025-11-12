import OpenAI from "openai";
import { CalorieEntry, FoodItem } from "./types";

const FOOD_ANALYSIS_PROMPT = `
Analyze this food description and extract calorie and macro information. Return valid JSON only with this exact structure:

{
  "items": [
    {
      "food": "specific food name",
      "calories": estimated_calories_as_number,
      "protein": protein_grams_as_number,
      "carbs": carbs_grams_as_number,
      "fat": fat_grams_as_number,
      "quantity": "portion description"
    }
  ],
  "total_calories": total_calories_number,
  "total_protein": total_protein_grams,
  "total_carbs": total_carbs_grams,
  "total_fat": total_fat_grams,
  "confidence": "high|medium|low",
  "reasoning": "Brief explanation of how you estimated the calories and macros"
}

Food description: {USER_INPUT}

Be specific with food names and realistic with calorie and macro estimates. Include your reasoning for the estimates.
`;

export async function analyzeFood(
  description: string,
  apiKey: string
): Promise<CalorieEntry> {
  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: FOOD_ANALYSIS_PROMPT.replace("{USER_INPUT}", description),
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(content);

    // Validate the response structure
    if (!parsed.items || !Array.isArray(parsed.items)) {
      throw new Error("Invalid response format");
    }

    const entry: CalorieEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      input: description,
      items: parsed.items as FoodItem[],
      total_calories: parsed.total_calories || 0,
      total_protein: parsed.total_protein || 0,
      total_carbs: parsed.total_carbs || 0,
      total_fat: parsed.total_fat || 0,
      confidence: parsed.confidence || "medium",
      reasoning: parsed.reasoning || "No reasoning provided",
    };

    return entry;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to analyze food. Please try again.");
  }
}

export function validateApiKey(key: string): boolean {
  // OpenAI API keys start with 'sk-' followed by alphanumeric characters, hyphens, and underscores
  // Modern keys are longer and have different formats
  return /^sk-[a-zA-Z0-9\-_]{20,}$/.test(key);
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

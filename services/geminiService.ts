
import { GoogleGenAI, Type } from "@google/genai";
import { DiseaseAnalysis } from "../types";

// Ensure the API key is accessed safely in both local and production environments
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (typeof process !== 'undefined' && process.env.API_KEY) return process.env.API_KEY;
  
  // For Vite production builds, check import.meta.env
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  
  return '';
};

export const analyzePlantDisease = async (base64Image: string): Promise<DiseaseAnalysis> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable in Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          {
            text: `You are an expert botanist and plant health monitoring AI integrated into a smart horticulture platform called FloraVision AI.

Your task is to analyze plant images captured from a live camera (mobile or laptop) and provide a complete plant health assessment.

Instructions:
1. Identify the plant (if possible).
2. Analyze visible symptoms in detail:
   - Leaf color changes (yellowing, browning)
   - Spots, fungus, or infections
   - Wilting or dryness
   - Pest signs
3. Determine the plant’s health status:
   - Healthy / Early Stress / Critical Condition
4. Predict the most likely cause:
   - Overwatering
   - Underwatering
   - Lack of sunlight
   - Disease (specify type if possible)
   - Nutrient deficiency
5. Provide a clear treatment plan:
   - Step-by-step actions
   - Watering advice
   - Sunlight requirements
   - Any medicines or care tips
6. Give a “Plant Health Score” from 0 to 100.
7. Keep response structured and concise for app display.

Important:
- Do NOT give generic answers.
- Base your response only on visible evidence from the image.
- If unsure, state assumptions clearly.
- Be practical and actionable.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plantName: { type: Type.STRING },
          healthStatus: { 
            type: Type.STRING,
            enum: ["Healthy", "Early Stress", "Critical Condition"]
          },
          healthScore: { type: Type.NUMBER },
          issuesDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
          cause: { type: Type.STRING },
          treatment: { type: Type.ARRAY, items: { type: Type.STRING } },
          confidence: { type: Type.STRING },
        },
        required: ["plantName", "healthStatus", "healthScore", "issuesDetected", "cause", "treatment", "confidence"],
      },
    },
  });

  const jsonStr = response.text?.trim() || "{}";
  return JSON.parse(jsonStr) as DiseaseAnalysis;
};

export const getPlantMask = async (base64Image: string) => {
  return null; 
};

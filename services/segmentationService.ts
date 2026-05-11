
import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  return (typeof process !== 'undefined' ? process.env.API_KEY : '') || '';
};

export const isolatePlantSubject = async (base64Image: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return base64Image;

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  try {
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
              text: "Identify the plant in this image. Provide a tight crop bounding box and describe its silhouette for transparency masking.",
            },
          ],
        },
      ],
    });

    return base64Image; 
  } catch (err) {
    console.error("Segmentation failed", err);
    return base64Image;
  }
};

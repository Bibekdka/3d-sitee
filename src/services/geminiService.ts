import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getProductRecommendations(userInterests: string[]) {
  if (!process.env.GEMINI_API_KEY) return null;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on these interests: ${userInterests.join(', ')}, suggest 3 types of 3D printed products that would be futuristic and cool. Return as a short bulleted list.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}

import { GoogleGenAI } from "@google/genai";

export async function getProductRecommendations(userInterests: string[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("Gemini API key is not configured. AI recommendations will be unavailable.");
    return null;
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
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

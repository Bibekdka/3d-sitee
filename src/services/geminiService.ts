import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      genAI = new GoogleGenAI({ apiKey });
    }
  }
  return genAI;
}

export async function getProductRecommendations(userInterests: string[]) {
  const fallbacks = [
    "Futuristic Kinetic Sculptures - Modular desk ornaments with magnetic fluid dynamics.",
    "Bioluminescent Planters - 3D printed with translucent bio-polymers for soft ambient glow.",
    "Modular Tech Organizers - Carbon-fiber reinforced docking stations with customizable slots."
  ];

  const ai = getGenAI();
  if (!ai) {
    console.warn("GEMINI_API_KEY is missing. Using static manifestation logs.");
    return fallbacks.join('\n');
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on these interests: ${userInterests.join(', ')}, suggest 3 types of 3D printed products that would be futuristic and cool. Return as a short bulleted list.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return fallbacks.join('\n');
  }
}

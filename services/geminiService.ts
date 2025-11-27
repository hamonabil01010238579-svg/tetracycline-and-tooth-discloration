import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PHANTOM_SYSTEM_INSTRUCTION } from "../constants";
import { Attachment } from "../types";

const apiKey = process.env.API_KEY;

// Initialize client
// Note: We create a fresh instance per call if needed, but keeping a singleton is fine for simple usage
// provided we don't need to change keys dynamically (unless handled).
const ai = new GoogleGenAI({ apiKey: apiKey });

export const generateMedicalResponse = async (
  prompt: string,
  attachment?: Attachment
): Promise<string> => {
  try {
    const modelId = "gemini-2.5-flash"; // Multimodal support

    const parts: any[] = [];
    
    // Add image if present
    if (attachment) {
      // Remove data url prefix if present (e.g., "data:image/png;base64,")
      const base64Data = attachment.data.split(',')[1] || attachment.data;
      
      parts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: base64Data
        }
      });
    }

    // Add text prompt
    // If analyzing image without prompt, provide a default prompt
    const textPrompt = prompt.trim() === "" && attachment 
      ? "Analyze this medical image/prescription. Extract the text and explain the purpose, dosage, and any warnings." 
      : prompt;

    parts.push({ text: textPrompt });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: PHANTOM_SYSTEM_INSTRUCTION,
        temperature: 0.4, // Lower temperature for medical accuracy
        maxOutputTokens: 1024,
      }
    });

    return response.text || "Error: No response generated from Phantom core.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Critical Error: Unable to process request. Please verify network connection or API quota.";
  }
};

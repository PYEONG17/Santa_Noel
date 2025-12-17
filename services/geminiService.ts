import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize the client once. 
// Note: In a real app, you might handle empty API keys more gracefully in the UI.
const ai = new GoogleGenAI({ apiKey });

// Helper function for exponential backoff retry
async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // Check for 429 or RESOURCE_EXHAUSTED codes
    // The error object might be complex, so we check various properties
    const isQuotaError = 
      error?.code === 429 || 
      error?.status === 429 || 
      error?.status === 'RESOURCE_EXHAUSTED' ||
      error?.message?.includes('429') ||
      error?.message?.includes('quota') ||
      error?.error?.code === 429; // Handle nested error object

    if (retries > 0 && isQuotaError) {
      console.warn(`Quota exceeded. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const chatWithSanta = async (history: { role: string; text: string }[], newMessage: string): Promise<string> => {
  if (!apiKey) {
    return "Ho ho... ôi trời! Đường truyền liên lạc của ta có vấn đề (Thiếu API Key).";
  }

  try {
    const model = 'gemini-2.5-flash';
    
    const systemInstruction = `
      You are Santa Claus. 
      Language: Vietnamese.
      Persona: Jolly, warm, kind, slightly old-fashioned but tech-savvy enough to use a tracker.
      Audience: Could be a child or an adult. Keep it family-friendly and magical.
      Context: The user is on a "Santa Tracker" dashboard.
      Tasks: Answer questions about Christmas, your reindeer, elves, or your current status.
      Style: Use Christmas emojis (🎅, 🎄, 🦌, 🎁). Keep responses concise (under 50 words) unless asked for a story.
    `;

    // Construct the prompt history
    let conversation = "";
    history.forEach(msg => {
      conversation += `${msg.role === 'user' ? 'Child' : 'Santa'}: ${msg.text}\n`;
    });
    conversation += `Child: ${newMessage}\nSanta:`;

    // Use retry logic
    const response = await callWithRetry(async () => {
        return await ai.models.generateContent({
          model,
          contents: conversation,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
    });

    return response.text || "Ho ho ho! Ta không nghe rõ lắm.";
  } catch (error: any) {
    // Identify if it's a quota error to handle it gracefully without scary logs
    const isQuotaError = 
      error?.code === 429 || 
      error?.status === 'RESOURCE_EXHAUSTED' || 
      error?.message?.includes('429') || 
      error?.message?.includes('quota') ||
      error?.error?.code === 429;

    if (isQuotaError) {
        console.warn("Gemini API Quota Exceeded (Handled gracefully)");
        return "Ho ho ho! Hộp thư Bắc Cực đang nhận được quá nhiều thư lúc này. Tuần lộc đang nghỉ ngơi một chút, cháu hãy thử lại sau vài giây nhé! 🦌💤";
    }

    console.error("Error chatting with Santa:", error);
    return "Ôi chà! Bão tuyết đang làm nhiễu tín hiệu. Cháu nói lại được không?";
  }
};

export const generateSantaStatus = async (location: string): Promise<string> => {
  if (!apiKey) return "Đang bay cao!";
  
  try {
    // Use retry logic
    const response = await callWithRetry(async () => {
        return await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Generate a short, funny, one-sentence status update in Vietnamese for Santa Claus who is currently near ${location}. Example: "Đang cho tuần lộc ăn cà rốt."`,
        });
    });
    return response.text || "Đang kiểm tra danh sách lần hai.";
  } catch (e) {
    // Fallback messages to keep the UI alive even if API fails completely
    // We suppress errors here as this is a background ticker
    const fallbacks = [
        "Đang điều chỉnh dây cương tuần lộc.",
        "Đang uống một cốc sữa nóng.",
        "Đang kiểm tra lại danh sách quà tặng.",
        "Đang bay qua những đám mây tuyết.",
        "Đang vẫy tay chào các bạn nhỏ bên dưới."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
};
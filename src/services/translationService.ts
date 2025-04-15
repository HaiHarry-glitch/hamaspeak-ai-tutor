
import { fetchWithTimeout, retryAsync, withFallback } from '@/utils/apiUtils';

/**
 * Translate text with Gradio client
 * @param text Text to translate
 * @returns Promise resolving to the translated text
 */
export const translateWithGradio = async (text: string): Promise<string> => {
  try {
    // Dynamic import to avoid build issues
    const { Client } = await import('@gradio/client');
    
    // Connect with timeout
    const connectPromise = new Promise<any>((resolve, reject) => {
      Client.connect("HAi-Star1/Nga-ngo")
        .then(resolve)
        .catch(reject);
        
      // Set connection timeout  
      setTimeout(() => reject(new Error("Connection timeout")), 5000);
    });
    
    const client = await connectPromise;
    
    // Predict with timeout
    const predictPromise = new Promise<any>((resolve, reject) => {
      client.predict("/predict", { text })
        .then(resolve)
        .catch(reject);
        
      // Set prediction timeout
      setTimeout(() => reject(new Error("Prediction timeout")), 8000);
    });
    
    const result = await predictPromise;
    return result.data as string;
  } catch (error) {
    console.error("Gradio translation error:", error);
    throw error;
  }
};

/**
 * Translate text with Gemini API
 * @param text Text to translate
 * @returns Promise resolving to the translated text
 */
export const translateWithGemini = async (text: string): Promise<string> => {
  try {
    const response = await fetchWithTimeout(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDtrDZDuhNPmGDdRr7eEAXNRYiuEOgkAPA",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Translate the following English text to Vietnamese. Only return the translation, nothing else:
                  
                  "${text}"`
                },
              ],
            },
          ],
        }),
      },
      8000 // 8 second timeout
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Lỗi dịch';
  } catch (error) {
    console.error("Gemini translation error:", error);
    throw error;
  }
};

/**
 * Translate text using multiple services with fallback
 * @param text Text to translate
 * @returns Promise resolving to the translated text
 */
export const translate = async (text: string): Promise<string> => {
  // Try Gradio with retry, then fall back to Gemini
  return withFallback(
    retryAsync(
      () => translateWithGradio(text),
      2, // 2 retries
      1000, // 1 second delay between retries
      (attempt, error) => console.log(`Retry ${attempt} for Gradio translation: ${error.message}`)
    ),
    () => translateWithGemini(text)
  ).catch(() => {
    // Last resort fallback
    return `[${text}]`;
  });
};

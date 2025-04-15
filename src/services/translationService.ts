
import { fetchWithTimeout, retryAsync, withFallback } from '@/utils/apiUtils';

/**
 * Translate text using Gemini API
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
                  text: `Dịch câu sau sang tiếng Việt và không trả lời gì thêm:
                  
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
 * Translate text directly - uses Gemini for simplicity and reliability
 * @param text Text to translate
 * @returns Promise resolving to the translated text
 */
export const translate = async (text: string): Promise<string> => {
  try {
    // Use Gemini directly since it's more reliable
    return await retryAsync(
      () => translateWithGemini(text),
      2, // 2 retries
      1000, // 1 second delay between retries
      (attempt, error) => console.log(`Retry ${attempt} for translation: ${error.message}`)
    );
  } catch (error) {
    console.error("Translation failed completely:", error);
    // Last resort fallback
    return `[${text}]`;
  }
};

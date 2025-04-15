
import { fetchWithTimeout, retryAsync } from '../utils/apiUtils';

/**
 * Translate text using Gemini API with fallback handling
 */
export const translate = async (text: string): Promise<string> => {
  try {
    // Use retryAsync to handle rate limiting with exponential backoff
    return await retryAsync(
      async () => {
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
                      text: `Dịch câu sau sang tiếng việt và ko trả lời gì thêm:

"${text}"`
                    },
                  ],
                },
              ],
            }),
          },
          15000 // 15 second timeout
        );

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error(`Rate limit exceeded, retrying...`);
          }
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '[Lỗi dịch]';
      },
      3, // 3 retries
      2000, // Start with 2s delay and increase exponentially
      (attempt, error) => console.log(`Translation retry ${attempt}: ${error.message}`)
    );
  } catch (error) {
    console.error("Translation error:", error);
    
    // Fallback for emergencies - return a placeholder message
    return '[Lỗi dịch - vui lòng thử lại sau]';
  }
};


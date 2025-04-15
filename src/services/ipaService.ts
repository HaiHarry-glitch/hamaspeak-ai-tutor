
import { fetchWithTimeout, retryAsync } from '../utils/apiUtils';

export const getIpaTranscription = async (text: string): Promise<string> => {
  try {
    // Use retryAsync for better reliability
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
                      text: `Generate the IPA (International Phonetic Alphabet) transcription for this English text. Only return the IPA, nothing else: "${text}"`
                    },
                  ],
                },
              ],
            }),
          },
          10000 // 10 second timeout
        );

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error(`Rate limit exceeded, retrying...`);
          }
          throw new Error('IPA generation failed');
        }

        const data = await response.json();
        const ipa = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return ipa.replace(/[[\]\/]/g, '').trim();
      },
      2, // 2 retries maximum for IPA
      1500, // 1.5s initial delay
      (attempt, error) => console.log(`IPA retry ${attempt}: ${error.message}`)
    );
  } catch (error) {
    console.error('IPA error:', error);
    // Return empty string on failure
    return '';
  }
};


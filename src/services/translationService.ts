
/**
 * Translate text using Gemini API
 */
export const translate = async (text: string): Promise<string> => {
  try {
    const response = await fetch(
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
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '[Lỗi dịch]';
  } catch (error) {
    console.error("Translation error:", error);
    return '[Lỗi dịch]';
  }
};

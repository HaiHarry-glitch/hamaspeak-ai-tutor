
export const getIpaTranscription = async (text: string): Promise<string> => {
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
                  text: `Generate the IPA (International Phonetic Alphabet) transcription for this English text. Only return the IPA, nothing else: "${text}"`
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error('IPA generation failed');
    }

    const data = await response.json();
    const ipa = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return ipa.replace(/[[\]\/]/g, '').trim();
  } catch (error) {
    console.error('IPA error:', error);
    return '';
  }
};

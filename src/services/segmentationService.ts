
interface SegmentationResult {
  phrases: string[];
  sentences: string[];
}

export const segmentText = async (text: string): Promise<SegmentationResult> => {
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
                  text: `Analyze this English text and do two things:
1. Break it into meaningful phrases and collocations (one per line)
2. Break it into complete sentences (one per line)

Respond in this format only:
---PHRASES---
[phrases one per line]
---SENTENCES---
[sentences one per line]

Text to analyze: "${text}"`
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Gemini API error');
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse response
    const [phrasesSection, sentencesSection] = content.split('---SENTENCES---');
    const phrases = phrasesSection
      .replace('---PHRASES---', '')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    const sentences = sentencesSection
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    return {
      phrases,
      sentences
    };
  } catch (error) {
    console.error('Segmentation error:', error);
    return {
      phrases: [text],
      sentences: [text]
    };
  }
};

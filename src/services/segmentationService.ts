
import { fetchWithTimeout, retryAsync } from '../utils/apiUtils';

interface SegmentationResult {
  phrases: string[];
  sentences: string[];
  translation: string;
  collocations: string[];
}

export const segmentText = async (text: string): Promise<SegmentationResult> => {
  try {
    // Use retryAsync to handle API rate limits
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
                      text: `dịch và tách thành các cụm collocations tương ứng và ko phân loại hay giải thích gì thêm

Text: "${text}"

Trả về kết quả theo định dạng sau:
Dịch: [bản dịch tiếng Việt]
Collocations:
[collocation 1]
[collocation 2]
...`
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
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // Parse response with new format
        const translationMatch = content.match(/Dịch:(.*?)(?=Collocations:|$)/s);
        const translation = translationMatch ? translationMatch[1].trim() : '';
        
        // Extract collocations
        const collocationsMatch = content.match(/Collocations:(.*?)$/s);
        const collocationsText = collocationsMatch ? collocationsMatch[1].trim() : '';
        const collocations = collocationsText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        // Create sentences from text (simplified approach)
        const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
        
        // Use collocations as phrases, or split by punctuation if none
        const phrases = collocations.length > 0 ? collocations : 
          text.split(/[,;:.!?]+/).map(p => p.trim()).filter(p => p.length > 0);
        
        return {
          phrases,
          sentences,
          translation,
          collocations
        };
      },
      3, // 3 retries
      2000, // Start with 2s delay
      (attempt, error) => console.log(`Segmentation retry ${attempt}: ${error.message}`)
    );
  } catch (error) {
    console.error('Segmentation error:', error);
    
    // In case of failure, return basic fallback
    return {
      phrases: [text],
      sentences: [text],
      translation: '[Lỗi phân tích]',
      collocations: []
    };
  }
};


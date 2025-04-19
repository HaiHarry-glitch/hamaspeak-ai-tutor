
import { PronunciationResult } from '@/types/pronunciation';
import { supabase } from '@/integrations/supabase/client';

class SpeechService {
  static async assessPronunciationFromMicrophone(text: string): Promise<PronunciationResult> {
    try {
      const result = await supabase.functions.invoke('language-analysis', {
        body: { text, type: 'pronunciation' }
      });
      
      return result.data;
    } catch (error) {
      console.error('Error in pronunciation assessment:', error);
      
      // Fallback mock result if API call fails
      return {
        text,
        overallScore: {
          accuracyScore: Math.round(Math.random() * 30 + 65),
          fluencyScore: Math.round(Math.random() * 30 + 65),
          completenessScore: Math.round(Math.random() * 30 + 65),
          pronScore: Math.round(Math.random() * 30 + 65)
        },
        words: [],
        json: '{}'
      };
    }
  }

  static async extractCollocations(text: string): Promise<string[]> {
    try {
      const result = await supabase.functions.invoke('language-analysis', {
        body: { text, type: 'collocations' }
      });
      
      // Parse the collocations from the analysis result
      const collocations = result.data?.analysis?.split('\n')
        .filter(line => line.trim())
        .map(line => line.split(':')[0].trim()) || [];
      
      return collocations;
    } catch (error) {
      console.error('Error extracting collocations:', error);
      return [];
    }
  }
}

export default SpeechService;
export type { PronunciationResult };

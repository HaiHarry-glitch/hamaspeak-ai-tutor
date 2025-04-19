
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
      throw error;
    }
  }
}

export default SpeechService;
export type { PronunciationResult };

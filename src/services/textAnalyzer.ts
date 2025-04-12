
import { segmentTextIntoPhrases, translateText } from '@/utils/speechUtils';

export interface AnalyzedPhrase {
  id: string;
  english: string;
  vietnamese: string; 
  fillInBlanks: string;
  attempts: number;
}

export interface TextAnalysisResult {
  originalText: string;
  phrases: AnalyzedPhrase[];
}

export const analyzeText = async (text: string): Promise<TextAnalysisResult> => {
  try {
    // Segment the text into phrases using a more intelligent algorithm
    const phrases = segmentTextIntoPhrases(text);
    
    // Process each phrase
    const analyzedPhrases: AnalyzedPhrase[] = [];
    
    for (const [index, phrase] of phrases.entries()) {
      // Get Vietnamese translation
      const translation = await translateText(phrase);
      
      // Create fill-in-the-blanks version
      const fillInBlanks = phrase
        .split(' ')
        .map((word, i) => i % 3 === 0 && word.length > 3 ? '____' : word)
        .join(' ');
      
      analyzedPhrases.push({
        id: `phrase-${index}`,
        english: phrase,
        vietnamese: translation,
        fillInBlanks: fillInBlanks,
        attempts: 0
      });
    }
    
    return {
      originalText: text,
      phrases: analyzedPhrases
    };
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw new Error('Failed to analyze text');
  }
};

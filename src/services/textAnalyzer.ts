
import { segmentTextIntoPhrases, translateText, generateFillInTheBlanks } from '@/utils/speechUtils';

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
  sentences: AnalyzedSentence[];
}

export interface AnalyzedSentence {
  id: string;
  english: string;
  vietnamese: string;
  fillInBlanks: string;
  attempts: number;
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
      const fillInBlanks = generateFillInTheBlanks(phrase);
      
      analyzedPhrases.push({
        id: `phrase-${index}`,
        english: phrase,
        vietnamese: translation,
        fillInBlanks: fillInBlanks,
        attempts: 0
      });
    }
    
    // Extract sentences for later steps (5-8)
    const sentences = extractSentences(text);
    const analyzedSentences: AnalyzedSentence[] = [];
    
    for (const [index, sentence] of sentences.entries()) {
      // Skip very short sentences
      if (sentence.length < 5) continue;
      
      // Get Vietnamese translation
      const translation = await translateText(sentence);
      
      // Create fill-in-the-blanks version
      const fillInBlanks = generateFillInTheBlanks(sentence);
      
      analyzedSentences.push({
        id: `sentence-${index}`,
        english: sentence,
        vietnamese: translation,
        fillInBlanks,
        attempts: 0
      });
    }
    
    return {
      originalText: text,
      phrases: analyzedPhrases,
      sentences: analyzedSentences
    };
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw new Error('Failed to analyze text');
  }
};

// Helper function to extract sentences from text
function extractSentences(text: string): string[] {
  // Split by sentence-ending punctuation followed by space or end of string
  return text
    .replace(/([.!?])\s+/g, "$1|")
    .split("|")
    .map(s => s.trim())
    .filter(s => s.length > 0);
}


import { v4 as uuidv4 } from 'uuid';
import { segmentText } from './segmentationService';
import { translate } from './translationService';
import { getIpaTranscription } from './ipaService';
import { generateFillInBlanks } from './fillBlanksService';

export interface AnalyzedPhrase {
  id: string;
  english: string;
  vietnamese: string;
  fillInBlanks: string;
  attempts: number;
  ipa?: string;
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
  ipa?: string;
}

export const analyzeText = async (text: string): Promise<TextAnalysisResult> => {
  try {
    const { phrases, sentences } = await segmentText(text);
    
    // Process phrases in parallel
    const analyzedPhrases = await Promise.all(
      phrases.map(async (phrase): Promise<AnalyzedPhrase> => {
        const [translation, ipa] = await Promise.all([
          translate(phrase),
          getIpaTranscription(phrase)
        ]);
        
        return {
          id: `phrase-${uuidv4()}`,
          english: phrase,
          vietnamese: translation,
          fillInBlanks: generateFillInBlanks(phrase),
          attempts: 0,
          ipa
        };
      })
    );
    
    // Process sentences in parallel
    const analyzedSentences = await Promise.all(
      sentences.map(async (sentence): Promise<AnalyzedSentence> => {
        const [translation, ipa] = await Promise.all([
          translate(sentence),
          getIpaTranscription(sentence)
        ]);
        
        return {
          id: `sentence-${uuidv4()}`,
          english: sentence,
          vietnamese: translation,
          fillInBlanks: generateFillInBlanks(sentence),
          attempts: 0,
          ipa
        };
      })
    );
    
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

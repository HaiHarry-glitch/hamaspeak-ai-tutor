
import { v4 as uuidv4 } from 'uuid';
import { segmentText } from './segmentationService';
import { translate } from './translationService';
import { getIpaTranscription } from './ipaService';
import { generateFillInBlanks } from './fillBlanksService';
import { useToast } from '@/hooks/use-toast';

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
    // Use the new segmentText function that returns both Vietnamese translation and collocations
    const segmentationResult = await segmentText(text);
    
    // Extract collocations as phrases
    const phrases = segmentationResult.phrases;
    const sentences = segmentationResult.sentences;
    
    // Process phrases in parallel with error handling for each
    const analyzedPhrases = await Promise.all(
      phrases.map(async (phrase): Promise<AnalyzedPhrase> => {
        try {
          // Get Vietnamese translation and IPA in parallel
          const [phraseTranslation, ipa] = await Promise.all([
            translate(phrase),
            getIpaTranscription(phrase)
          ]);
          
          return {
            id: `phrase-${uuidv4()}`,
            english: phrase,
            vietnamese: phraseTranslation,
            fillInBlanks: generateFillInBlanks(phrase),
            attempts: 0,
            ipa
          };
        } catch (error) {
          console.error(`Error processing phrase "${phrase}":`, error);
          // Return basic info with error indicators if API calls fail
          return {
            id: `phrase-${uuidv4()}`,
            english: phrase,
            vietnamese: '[Lỗi dịch]',
            fillInBlanks: generateFillInBlanks(phrase),
            attempts: 0,
            ipa: ''
          };
        }
      })
    );
    
    // Process sentences in parallel with error handling
    const analyzedSentences = await Promise.all(
      sentences.map(async (sentence): Promise<AnalyzedSentence> => {
        try {
          // Get Vietnamese translation and IPA in parallel
          const [sentenceTranslation, ipa] = await Promise.all([
            translate(sentence),
            getIpaTranscription(sentence)
          ]);
          
          return {
            id: `sentence-${uuidv4()}`,
            english: sentence,
            vietnamese: sentenceTranslation,
            fillInBlanks: generateFillInBlanks(sentence),
            attempts: 0,
            ipa
          };
        } catch (error) {
          console.error(`Error processing sentence "${sentence}":`, error);
          // Return basic info with error indicators if API calls fail
          return {
            id: `sentence-${uuidv4()}`,
            english: sentence,
            vietnamese: '[Lỗi dịch]',
            fillInBlanks: generateFillInBlanks(sentence),
            attempts: 0,
            ipa: ''
          };
        }
      })
    );
    
    return {
      originalText: text,
      phrases: analyzedPhrases,
      sentences: analyzedSentences
    };
  } catch (error) {
    console.error('Error analyzing text:', error);
    // Return a minimal result with the original text
    return {
      originalText: text,
      phrases: [{
        id: `phrase-error-${uuidv4()}`,
        english: text,
        vietnamese: '[Lỗi phân tích]',
        fillInBlanks: text,
        attempts: 0
      }],
      sentences: [{
        id: `sentence-error-${uuidv4()}`,
        english: text,
        vietnamese: '[Lỗi phân tích]',
        fillInBlanks: text,
        attempts: 0
      }]
    };
  }
};


import { segmentTextIntoPhrases, translateText, generateFillInTheBlanks } from '@/utils/speechUtils';
import { extractCollocations, CollocationResult } from '@/utils/collocationUtils';

export interface AnalyzedPhrase {
  id: string;
  english: string;
  vietnamese: string; 
  fillInBlanks: string;
  attempts: number;
  ipa?: string; // Added IPA transcription
}

export interface TextAnalysisResult {
  originalText: string;
  phrases: AnalyzedPhrase[];
  sentences: AnalyzedSentence[];
  collocations?: string[]; // Added collocations
}

export interface AnalyzedSentence {
  id: string;
  english: string;
  vietnamese: string;
  fillInBlanks: string;
  attempts: number;
  ipa?: string; // Added IPA transcription
}

// Helper function to get IPA transcription
const getIpaForPhrase = async (phrase: string): Promise<string> => {
  try {
    const words = phrase.split(/\s+/);
    const ipaParts = [];
    
    for (const word of words) {
      // Skip very short words
      if (word.length <= 2) {
        ipaParts.push('');
        continue;
      }
      
      // Use the getIpaTranscription function from speechUtils
      // We'll simulate it here with a simple implementation
      const cleanWord = word.replace(/[.,!?;:]/g, '');
      const ipaMap: {[key: string]: string} = {
        "hello": "həˈloʊ",
        "world": "wɜːld",
        "help": "help",
        "important": "ɪmˈpɔːrtənt",
        "our": "ˈaʊər",
        "also": "ˈɔːlsoʊ",
        "language": "ˈlæŋɡwɪdʒ",
        "english": "ˈɪŋɡlɪʃ",
        "practice": "ˈpræktɪs",
        "speak": "spiːk",
        "learn": "lɜːrn"
      };
      
      ipaParts.push(ipaMap[cleanWord.toLowerCase()] || '');
    }
    
    return ipaParts.filter(p => p).join(' ');
  } catch (error) {
    console.error('Error getting IPA:', error);
    return '';
  }
};

export const analyzeText = async (text: string): Promise<TextAnalysisResult> => {
  try {
    // Use improved segmentTextIntoPhrases function for better chunking
    const phrases = segmentTextIntoPhrases(text);
    
    // Process each phrase with enhanced Vietnamese translation and IPA
    const analyzedPhrases: AnalyzedPhrase[] = [];
    
    for (const [index, phrase] of phrases.entries()) {
      // Skip empty or very short phrases
      if (phrase.trim().length < 2) continue;
      
      // Get Vietnamese translation using the improved translation function
      const translation = await translateText(phrase);
      
      // Create fill-in-the-blanks version
      const fillInBlanks = generateFillInTheBlanks(phrase);
      
      // Get IPA transcription
      const ipa = await getIpaForPhrase(phrase);
      
      analyzedPhrases.push({
        id: `phrase-${index}`,
        english: phrase,
        vietnamese: translation,
        fillInBlanks: fillInBlanks,
        attempts: 0,
        ipa: ipa
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
      
      // Get IPA transcription
      const ipa = await getIpaForPhrase(sentence);
      
      analyzedSentences.push({
        id: `sentence-${index}`,
        english: sentence,
        vietnamese: translation,
        fillInBlanks,
        attempts: 0,
        ipa: ipa
      });
    }

    // Extract collocations from the text
    let collocations: string[] = [];
    try {
      const collocationsResult = await extractCollocations(text);
      collocations = collocationsResult.collocations;
    } catch (error) {
      console.error('Error extracting collocations:', error);
      // Continue with empty collocations if there's an error
    }
    
    return {
      originalText: text,
      phrases: analyzedPhrases,
      sentences: analyzedSentences,
      collocations: collocations
    };
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw new Error('Failed to analyze text');
  }
};

// Improved function to extract sentences from text
function extractSentences(text: string): string[] {
  // First, identify sentence boundaries with more precision
  const withMarkers = text
    .replace(/([.!?])\s+/g, "$1|")
    .replace(/([.!?])"(\s|$)/g, "$1\"|")
    .replace(/\r?\n/g, "|");  // Consider line breaks as potential sentence breaks
    
  // Split by markers
  const rawSentences = withMarkers.split("|");
  
  // Clean up and filter out empty or invalid sentences
  const cleanSentences = rawSentences
    .map(s => s.trim())
    .filter(s => {
      // Must be reasonable length and contain at least one letter
      return s.length > 2 && /[a-z]/i.test(s);
    });
    
  return cleanSentences;
}

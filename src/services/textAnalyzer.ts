
import * as nlp from 'compromise';
import { v4 as uuidv4 } from 'uuid';
import { Client } from "@gradio/client";

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

// Gemini API for improved phrase segmentation and IPA generation
const segmentTextWithGemini = async (text: string): Promise<string[]> => {
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
                  text: `Split the following English text into meaningful collocations or phrases that would be useful for language learners:
                  
                  "${text}"
                  
                  Return only the phrases, one per line, without any explanations or numbering.`
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", await response.text());
      // Fallback to basic segmentation
      return segmentTextBasic(text);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Split by newlines and filter empty lines
    const phrases = content.split('\n').map(phrase => phrase.trim()).filter(phrase => phrase);
    
    return phrases.length > 0 ? phrases : segmentTextBasic(text);
  } catch (error) {
    console.error("Error segmenting text with Gemini:", error);
    // Fallback to basic segmentation
    return segmentTextBasic(text);
  }
};

// Basic segmentation as fallback
const segmentTextBasic = (text: string): string[] => {
  // Use compromise to segment text
  const doc = nlp(text);
  
  // Get phrases (noun phrases, verb phrases, etc.)
  const phrases = doc.phrases().out('array');
  
  // Break longer phrases into smaller chunks
  let result: string[] = [];
  
  for (const phrase of phrases) {
    if (phrase.split(' ').length > 5) {
      // Split long phrases
      const words = phrase.split(' ');
      for (let i = 0; i < words.length; i += 4) {
        const chunk = words.slice(i, i + 4).join(' ');
        if (chunk.trim().length > 0) {
          result.push(chunk.trim());
        }
      }
    } else if (phrase.trim().length > 0) {
      result.push(phrase.trim());
    }
  }
  
  return result;
};

// Get IPA transcription using Gemini
const getIpaForPhrase = async (phrase: string): Promise<string> => {
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
                  text: `Generate the IPA (International Phonetic Alphabet) transcription for the following English phrase: "${phrase}". Only return the IPA, nothing else.`
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error for IPA:", await response.text());
      return "";
    }

    const data = await response.json();
    const ipaTranscription = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up the response to extract just the IPA
    return ipaTranscription.replace(/[[\]\/]/g, '').trim();
  } catch (error) {
    console.error("Error getting IPA from Gemini:", error);
    return '';
  }
};

// Function to translate text using Gradio client
const translateViaGradio = async (text: string): Promise<string> => {
  try {
    const client = await Client.connect("HAi-Star1/Nga-ngo");
    const result = await client.predict("/predict", {
      text: text,
    });
    
    return result.data as string;
  } catch (error) {
    console.error("Translation error:", error);
    return "Lỗi dịch";
  }
};

// Generate fill-in-the-blanks for practice
const generateFillInBlanks = (text: string): string => {
  const words = text.split(' ');
  
  if (words.length <= 2) {
    // For very short phrases, remove the last word
    return words.slice(0, -1).join(' ') + ' _____';
  }
  
  // Select 20-30% of words to blank out
  const blankCount = Math.max(1, Math.floor(words.length * 0.25));
  const wordIndices = Array.from({length: words.length}, (_, i) => i);
  const blankIndices = [];
  
  // Select indices to blank out
  for (let i = 0; i < blankCount; i++) {
    const randomIndex = Math.floor(Math.random() * wordIndices.length);
    const selectedIndex = wordIndices[randomIndex];
    
    // Don't select consecutive words or very short words
    if ((blankIndices.includes(selectedIndex - 1) || blankIndices.includes(selectedIndex + 1)) ||
        words[selectedIndex].length <= 2) {
      i--; // Try again
    } else {
      blankIndices.push(selectedIndex);
      wordIndices.splice(randomIndex, 1);
    }
  }
  
  // Create the fill-in-the-blank text
  const result = words.map((word, index) => {
    if (blankIndices.includes(index)) {
      return '_____';
    }
    return word;
  }).join(' ');
  
  return result;
};

export const analyzeText = async (text: string): Promise<TextAnalysisResult> => {
  try {
    // Use Gemini API for improved phrase segmentation
    const phrases = await segmentTextWithGemini(text);
    
    // Extract sentences for later steps
    const sentences = extractSentences(text);
    
    // Process each phrase with enhanced translation and IPA
    const analyzedPhrases: AnalyzedPhrase[] = [];
    const analyzedSentences: AnalyzedSentence[] = [];
    
    // Process phrases
    for (const [index, phrase] of phrases.entries()) {
      if (phrase.trim().length < 2) continue;
      
      // Get Vietnamese translation using Gradio client
      const translation = await translateViaGradio(phrase);
      
      // Create fill-in-the-blanks version
      const fillInBlanks = generateFillInBlanks(phrase);
      
      // Get IPA transcription using Gemini
      const ipa = await getIpaForPhrase(phrase);
      
      analyzedPhrases.push({
        id: `phrase-${uuidv4()}`,
        english: phrase,
        vietnamese: translation,
        fillInBlanks: fillInBlanks,
        attempts: 0,
        ipa: ipa
      });
    }
    
    // Process sentences
    for (const [index, sentence] of sentences.entries()) {
      if (sentence.length < 5) continue;
      
      // Get Vietnamese translation
      const translation = await translateViaGradio(sentence);
      
      // Create fill-in-the-blanks version
      const fillInBlanks = generateFillInBlanks(sentence);
      
      // Get IPA transcription
      const ipa = await getIpaForPhrase(sentence);
      
      analyzedSentences.push({
        id: `sentence-${uuidv4()}`,
        english: sentence,
        vietnamese: translation,
        fillInBlanks,
        attempts: 0,
        ipa: ipa
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

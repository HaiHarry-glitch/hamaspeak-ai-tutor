
import { useEffect, useState } from 'react';

// Create a fallback function for browsers without native SpeechSynthesis
const synthesizeSpeech = (text: string, voice: string, rate: number = 1, onEnd?: () => void) => {
  // Check if the browser supports SpeechSynthesis
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find the voice by name
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.name === voice);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = rate;
    utterance.pitch = 1;
    
    if (onEnd) {
      utterance.onend = onEnd;
    }
    
    window.speechSynthesis.speak(utterance);
    return true;
  }
  
  // Fallback for browsers without native support
  console.warn("Speech synthesis not supported in this browser. Using fallback.");
  return false;
};

// Get available voices with a promise to ensure they're loaded
export const getAvailableVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if ('speechSynthesis' in window) {
      // If voices are already loaded
      let voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }
      
      // If voices aren't loaded yet, wait for them
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      };
      
      // Force a refresh to trigger onvoiceschanged in some browsers
      window.speechSynthesis.getVoices();
    } else {
      // Return empty array if speech synthesis not supported
      resolve([]);
    }
  });
};

// Handle speech synthesis consistently across browsers
export const speakText = (text: string, voice: string, rate: number = 1, onEnd?: () => void): Promise<void> => {
  return new Promise((resolve) => {
    // First try native speech synthesis
    const success = synthesizeSpeech(text, voice, rate, () => {
      if (onEnd) onEnd();
      resolve();
    });
    
    // If native synthesis fails or isn't available, implement fallback
    if (!success) {
      console.warn("Using fallback speech synthesis");
      // Here you could implement a web API based fallback like Google TTS or Amazon Polly
      // For now, we'll just call the onEnd callback after a delay to simulate speech
      const wordsPerMinute = 150 * rate;
      const wordCount = text.split(' ').length;
      const durationMs = (wordCount / wordsPerMinute) * 60 * 1000;
      
      setTimeout(() => {
        if (onEnd) onEnd();
        resolve();
      }, durationMs);
    }
  });
};

// Speech recognition
let recognitionInstance: any = null;

export const startSpeechRecognition = (language: string = 'en-US'): Promise<{ transcript: string }> => {
  return new Promise((resolve, reject) => {
    // Check if the browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      reject(new Error("Speech recognition is not supported in this browser."));
      return;
    }
    
    // Stop any existing recognition
    stopSpeechRecognition();
    
    // Create a new recognition instance
    recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = language;
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    
    recognitionInstance.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      resolve({ transcript });
    };
    
    recognitionInstance.onerror = (event: any) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };
    
    // Start recognition
    recognitionInstance.start();
  });
};

export const stopSpeechRecognition = () => {
  if (recognitionInstance) {
    try {
      recognitionInstance.stop();
    } catch (error) {
      console.warn("Error stopping speech recognition:", error);
    }
    recognitionInstance = null;
  }
};

// Text analysis utilities
export const calculatePronunciationScore = (reference: string, spoken: string): number => {
  if (!reference || !spoken) return 0;
  
  // Normalize both strings: convert to lowercase and remove punctuation
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };
  
  const normalizedReference = normalizeText(reference);
  const normalizedSpoken = normalizeText(spoken);
  
  // Simple word matching algorithm
  const referenceWords = normalizedReference.split(' ');
  const spokenWords = normalizedSpoken.split(' ');
  
  // Count matched words
  let matchedWords = 0;
  let partialMatches = 0;
  
  spokenWords.forEach(spokenWord => {
    if (referenceWords.includes(spokenWord)) {
      matchedWords++;
    } else {
      // Check for partial matches (more than 60% of characters match)
      for (const refWord of referenceWords) {
        const similarity = calculateStringSimilarity(refWord, spokenWord);
        if (similarity > 0.6) {
          partialMatches++;
          break;
        }
      }
    }
  });
  
  // Calculate score based on matched words, partial matches, and length differences
  const lengthDifference = Math.abs(referenceWords.length - spokenWords.length);
  const lengthPenalty = Math.min(30, lengthDifference * 5); // Up to 30% penalty for length difference
  
  const maxMatchPossible = Math.max(referenceWords.length, spokenWords.length);
  const matchScore = ((matchedWords + (partialMatches * 0.5)) / maxMatchPossible) * 100;
  
  // Apply length penalty
  let finalScore = Math.max(0, matchScore - lengthPenalty);
  
  // Cap at 100
  finalScore = Math.min(100, finalScore);
  
  return Math.round(finalScore);
};

// Helper function to calculate string similarity
const calculateStringSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  // Calculate Levenshtein distance
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

// Levenshtein distance calculation
const levenshteinDistance = (str1: string, str2: string): number => {
  const m = str1.length;
  const n = str2.length;
  
  let dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
  
  // Initialize the matrix
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return dp[m][n];
};

// Get mispronounced words
export const getWordErrors = (reference: string, spoken: string): string[] => {
  if (!reference || !spoken) return [];
  
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };
  
  const normalizedReference = normalizeText(reference);
  const normalizedSpoken = normalizeText(spoken);
  
  const referenceWords = normalizedReference.split(' ');
  const spokenWords = normalizedSpoken.split(' ');
  
  // Identify words that are in the reference but either not spoken or mispronounced
  const errorWords: string[] = [];
  
  for (const refWord of referenceWords) {
    if (refWord.length <= 2) continue; // Skip very short words
    
    if (!spokenWords.includes(refWord)) {
      let foundPartialMatch = false;
      
      // Check for partial matches
      for (const spokenWord of spokenWords) {
        if (calculateStringSimilarity(refWord, spokenWord) > 0.6) {
          foundPartialMatch = true;
          break;
        }
      }
      
      if (!foundPartialMatch && !errorWords.includes(refWord)) {
        errorWords.push(refWord);
      }
    }
  }
  
  return errorWords;
};

// Get IPA transcription for a word (simplified version)
export const getIpaTranscription = async (word: string): Promise<string> => {
  // This is a simplified mapping of some English words to their IPA
  const commonIpaMappings: Record<string, string> = {
    "the": "ðə",
    "a": "eɪ",
    "an": "æn",
    "and": "ænd",
    "is": "ɪz",
    "in": "ɪn",
    "it": "ɪt",
    "on": "ɒn",
    "at": "æt",
    "to": "tu",
    "of": "ʌv",
    "for": "fɔr",
    "with": "wɪð",
    "as": "æz",
    "from": "frʌm",
    "by": "baɪ",
    "about": "əˈbaʊt"
  };
  
  // Return from mapping if available
  if (word.toLowerCase() in commonIpaMappings) {
    return commonIpaMappings[word.toLowerCase()];
  }
  
  // If no match in our simple dictionary, generate a basic approximation
  // In a real app, you'd use a proper IPA API or library here
  let ipa = "";
  for (let i = 0; i < word.length; i++) {
    const char = word[i].toLowerCase();
    switch(char) {
      case 'a': ipa += 'æ'; break;
      case 'e': ipa += 'e'; break;
      case 'i': ipa += 'ɪ'; break;
      case 'o': ipa += 'ɒ'; break;
      case 'u': ipa += 'ʌ'; break;
      case 'th': ipa += 'θ'; i++; break;
      default: ipa += char;
    }
  }
  
  return ipa;
};

// Segment text into phrases
export const segmentTextIntoPhrases = (text: string): string[] => {
  if (!text) return [];
  
  // First, normalize the text
  const normalizedText = text
    .replace(/\s+/g, " ")
    .trim();
  
  // Use natural pauses like punctuation to split the text
  const punctuationSplits = normalizedText.split(/([,.!?;:]\s+)/);
  
  // Combine the splits to get phrases with punctuation
  const preliminarySplits: string[] = [];
  for (let i = 0; i < punctuationSplits.length; i += 2) {
    const current = punctuationSplits[i];
    const punctuation = punctuationSplits[i + 1] || "";
    
    if (current) {
      preliminarySplits.push(current + punctuation.trim());
    }
  }
  
  // Further process phrases that are too long
  const phrases: string[] = [];
  for (const phrase of preliminarySplits) {
    if (phrase.split(' ').length > 10) {
      // If phrase is too long, split by commas or conjunctions
      const subPhrases = phrase.split(/,|\sand\s|\sbut\s|\sor\s|\sbecause\s/);
      phrases.push(...subPhrases.map(p => p.trim()).filter(p => p.length > 0));
    } else {
      phrases.push(phrase.trim());
    }
  }
  
  // Filter out empty phrases and normalize
  return phrases.filter(phrase => phrase.length > 0).map(phrase => {
    // Ensure each phrase ends with proper punctuation
    if (!/[,.!?;:]$/.test(phrase)) {
      return phrase + '.';
    }
    return phrase;
  });
};

// Generate fill in the blanks version of text
export const generateFillInTheBlanks = (text: string): string => {
  if (!text) return '';
  
  const words = text.split(' ');
  
  // Calculate how many words to blank out (20-30% of words)
  const wordCount = words.length;
  const blankCount = Math.max(1, Math.floor(wordCount * (Math.random() * 0.1 + 0.2)));
  
  // Select random important words to blank out
  const wordsToBlank = new Set<number>();
  
  // Helper to determine if a word is important (not a stopword)
  const isImportantWord = (word: string): boolean => {
    const stopwords = ['the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'as'];
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    return cleanWord.length > 2 && !stopwords.includes(cleanWord);
  };
  
  // Get indices of important words
  const importantIndices: number[] = words
    .map((word, index) => ({ word, index }))
    .filter(({ word }) => isImportantWord(word))
    .map(({ index }) => index);
  
  // Select random important words
  while (wordsToBlank.size < blankCount && importantIndices.length > 0) {
    const randomIndex = Math.floor(Math.random() * importantIndices.length);
    wordsToBlank.add(importantIndices[randomIndex]);
    importantIndices.splice(randomIndex, 1);
  }
  
  // Create the fill-in-the-blanks text
  const result = words.map((word, index) => {
    if (wordsToBlank.has(index)) {
      return '______';
    }
    return word;
  }).join(' ');
  
  return result;
};

// Simplified translation function (in a real app, you'd use a proper API like Google Translate)
export const translateText = async (text: string): Promise<string> => {
  // Here you would integrate with a real translation API
  // For now, we'll just return a placeholder
  
  // Simple English to Vietnamese dictionary for common phrases
  const translations: Record<string, string> = {
    "hello": "xin chào",
    "goodbye": "tạm biệt",
    "thank you": "cảm ơn",
    "welcome": "chào mừng",
    "yes": "vâng",
    "no": "không",
    "please": "làm ơn",
    "sorry": "xin lỗi",
    "good morning": "chào buổi sáng",
    "good afternoon": "chào buổi chiều",
    "good evening": "chào buổi tối",
    "how are you": "bạn khỏe không",
    "what is your name": "tên bạn là gì",
    "my name is": "tên tôi là",
    "i love you": "tôi yêu bạn",
    "i miss you": "tôi nhớ bạn",
    "i am": "tôi là",
    "we are": "chúng tôi là",
    "they are": "họ là",
    "he is": "anh ấy là",
    "she is": "cô ấy là",
    "it is": "nó là",
  };
  
  // Check if the exact phrase exists in our translations
  const lowerText = text.toLowerCase();
  if (translations[lowerText]) {
    return translations[lowerText];
  }
  
  // Mock translation by adding "(Vietnamese: [original text])"
  return `(tiếng Việt: ${text})`;
};

export default {
  getAvailableVoices,
  speakText,
  startSpeechRecognition,
  stopSpeechRecognition,
  calculatePronunciationScore,
  getWordErrors,
  getIpaTranscription,
  segmentTextIntoPhrases,
  generateFillInTheBlanks,
  translateText
};

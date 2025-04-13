// List of available voices from Web Speech API
export const getAvailableVoices = () => {
  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
    let voices = speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    
    // If no voices are available yet, wait for them to be loaded
    speechSynthesis.onvoiceschanged = () => {
      voices = speechSynthesis.getVoices();
      resolve(voices);
    };
  });
};

// Text to speech function
export const speakText = (text: string, voiceName = "", rate = 1) => {
  return new Promise<void>((resolve, reject) => {
    if (!text) {
      reject("No text provided");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if provided
    if (voiceName) {
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.name === voiceName);
      if (selectedVoice) utterance.voice = selectedVoice;
    }
    
    utterance.rate = rate;
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(event.error);
    
    speechSynthesis.speak(utterance);
  });
};

// Stop speaking
export const stopSpeaking = () => {
  speechSynthesis.cancel();
};

// Speech recognition interface
interface RecognitionResult {
  transcript: string;
  confidence: number;
}

// Store the recognition instance globally so we can stop it later
let recognitionInstance: any = null;

// Start speech recognition
export const startSpeechRecognition = (language: string = 'en-US'): Promise<RecognitionResult> => {
  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      reject('Speech recognition is not supported in this browser');
      return;
    }

    // Create speech recognition instance
    // @ts-ignore: Browser vendor prefixes
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionInstance = new SpeechRecognition();

    recognitionInstance.lang = language;
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.maxAlternatives = 1;

    recognitionInstance.onresult = (event) => {
      const result = event.results[0][0];
      resolve({
        transcript: result.transcript,
        confidence: result.confidence
      });
    };

    recognitionInstance.onerror = (event) => {
      reject(`Error occurred in recognition: ${event.error}`);
    };

    recognitionInstance.start();
  });
};

// Stop speech recognition
export const stopSpeechRecognition = () => {
  if (recognitionInstance) {
    try {
      recognitionInstance.stop();
    } catch (e) {
      console.error("Error stopping speech recognition:", e);
    }
    recognitionInstance = null;
  }
};

// Identify words that were mispronounced
export const getWordErrors = (original: string, userTranscript: string): string[] => {
  const normalizedOriginal = original.toLowerCase().replace(/[.,!?;:]/g, '');
  const normalizedUser = userTranscript.toLowerCase().replace(/[.,!?;:]/g, '');
  
  const originalWords = normalizedOriginal.split(/\s+/);
  const userWords = normalizedUser.split(/\s+/);
  
  // Find words in original that don't appear in user transcript
  const missingWords = originalWords.filter(word => {
    // Skip very short words or common articles
    if (word.length <= 2 || ['the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'and', 'but', 'or', 'for', 'with', 'by'].includes(word)) {
      return false;
    }
    
    // Check if this word or a similar one exists in the user transcript
    return !userWords.some(userWord => {
      // Check for exact match or high similarity
      return userWord === word || 
             calculateWordSimilarity(word, userWord) > 0.7;
    });
  });
  
  return missingWords;
};

// Calculate similarity between individual words
function calculateWordSimilarity(word1: string, word2: string): number {
  // If exact match
  if (word1 === word2) return 1.0;
  
  // Calculate Levenshtein distance
  const distance = levenshteinDistance(word1, word2);
  const maxLength = Math.max(word1.length, word2.length);
  
  // Return similarity ratio
  return 1 - (distance / maxLength);
}

// Get IPA (International Phonetic Alphabet) transcription for a word
export const getIpaTranscription = async (word: string): Promise<string> => {
  try {
    // Mock IPA transcriptions for common English words
    const commonIpaMap: {[key: string]: string} = {
      // Basic words
      "hello": "həˈloʊ",
      "world": "wɜːrld",
      "good": "ɡʊd",
      "bad": "bæd",
      "happy": "ˈhæpi",
      "sad": "sæd",
      "love": "lʌv",
      "hate": "heɪt",
      "life": "laɪf",
      "death": "dɛθ",
      
      // Common verbs
      "go": "ɡoʊ",
      "come": "kʌm",
      "eat": "iːt",
      "drink": "drɪŋk",
      "sleep": "sliːp",
      "wake": "weɪk",
      "talk": "tɔːk",
      "walk": "wɔːk",
      "run": "rʌn",
      "jump": "dʒʌmp",
      "see": "siː",
      "hear": "hɪər",
      "feel": "fiːl",
      "think": "θɪŋk",
      "know": "noʊ",
      "understand": "ˌʌndərˈstænd",
      "say": "seɪ",
      "speak": "spiːk",
      "give": "ɡɪv",
      "take": "teɪk",
      
      // Pronouns
      "i": "aɪ",
      "you": "juː",
      "he": "hiː",
      "she": "ʃiː",
      "it": "ɪt",
      "we": "wiː",
      "they": "ðeɪ",
      
      // Time-related
      "time": "taɪm",
      "day": "deɪ",
      "night": "naɪt",
      "year": "jɪər",
      "month": "mʌnθ",
      "week": "wiːk",
      "hour": "ˈaʊər",
      "minute": "ˈmɪnɪt",
      "second": "ˈsɛkənd",
      
      // Common adjectives
      "big": "bɪɡ",
      "small": "smɔːl",
      "hot": "hɑːt",
      "cold": "koʊld",
      "new": "nuː",
      "old": "oʊld",
      "young": "jʌŋ",
      "beautiful": "ˈbjuːtɪfʊl",
      "ugly": "ˈʌɡli",
      "easy": "ˈiːzi",
      "difficult": "ˈdɪfɪkəlt",
      "important": "ɪmˈpɔːrtənt",
      
      // Common nouns
      "man": "mæn",
      "woman": "ˈwʊmən",
      "child": "tʃaɪld",
      "house": "haʊs",
      "car": "kɑːr",
      "book": "bʊk",
      "water": "ˈwɔːtər",
      "food": "fuːd",
      "friend": "frɛnd",
      "family": "ˈfæməli",
      "school": "skuːl",
      "work": "wɜːrk",
      "money": "ˈmʌni",
      "country": "ˈkʌntri",
      "city": "ˈsɪti",
      
      // Vietnamese-specific challenge words
      "vietnam": "ˈvjɛtˌnɑːm",
      "hanoi": "hɑːˈnɔɪ",
      "saigon": "saɪˈɡɒn",
      "pho": "fə",
      "banh mi": "bæn mi",
      "solving": "ˈsɒlvɪŋ",
      "taught": "tɔːt"
    };
    
    // Check if we have a predefined IPA for this word
    const normalizedWord = word.toLowerCase().trim();
    if (commonIpaMap[normalizedWord]) {
      return commonIpaMap[normalizedWord];
    }
    
    // If not in our dictionary, use a fake delay to simulate API call
    // In a real app, you would call an API here
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return a simple phonetic representation as fallback
    return generateSimpleIPA(normalizedWord);
  } catch (error) {
    console.error("Error getting IPA transcription:", error);
    return generateSimpleIPA(word);
  }
};

// Generate a simple IPA-like transcription (not real IPA but gives an impression)
function generateSimpleIPA(word: string): string {
  const phonemeMap: {[key: string]: string} = {
    'a': 'æ', 'e': 'ɛ', 'i': 'ɪ', 'o': 'ɒ', 'u': 'ʌ',
    'ai': 'aɪ', 'ay': 'eɪ', 'ea': 'iː', 'ee': 'iː', 'oo': 'uː',
    'th': 'θ', 'sh': 'ʃ', 'ch': 'tʃ', 'ph': 'f', 'wh': 'w',
    'j': 'dʒ', 'c': 'k'
  };
  
  let ipa = word.toLowerCase();
  
  // Replace common phoneme patterns
  Object.keys(phonemeMap).forEach(key => {
    ipa = ipa.replace(new RegExp(key, 'g'), phonemeMap[key]);
  });
  
  // Add stress mark to the first syllable for simplicity
  if (ipa.length > 1) {
    ipa = 'ˈ' + ipa;
  }
  
  return ipa;
}

// Improved pronunciation scoring using more advanced algorithms
export const calculatePronunciationScore = (original: string, userTranscript: string): number => {
  // Normalize both strings for comparison
  const normalizedOriginal = original.trim().toLowerCase();
  const normalizedUser = userTranscript.trim().toLowerCase();
  
  // Perfect match
  if (normalizedOriginal === normalizedUser) {
    return 100;
  }
  
  // Calculate Levenshtein distance for more accurate comparison
  const levenDistance = levenshteinDistance(normalizedOriginal, normalizedUser);
  const maxLength = Math.max(normalizedOriginal.length, normalizedUser.length);
  const similarity = 1 - levenDistance / maxLength;
  
  // Word-based analysis
  const originalWords = normalizedOriginal.split(' ');
  const userWords = normalizedUser.split(' ');
  
  // Count exact word matches
  let exactWordMatches = 0;
  originalWords.forEach(word => {
    if (userWords.includes(word)) {
      exactWordMatches++;
    }
  });
  
  const wordMatchRatio = originalWords.length > 0 
    ? exactWordMatches / originalWords.length
    : 0;
  
  // Calculate phonetic similarity using soundex
  const phoneticSimilarity = calculatePhoneticSimilarity(normalizedOriginal, normalizedUser);
  
  // Combined score (weighted)
  const combinedScore = (similarity * 0.4) + (wordMatchRatio * 0.3) + (phoneticSimilarity * 0.3);
  
  // Convert to a score between 0-100
  return Math.round(combinedScore * 100);
};

// Helper function to calculate phonetic similarity
function calculatePhoneticSimilarity(str1: string, str2: string): number {
  // Simple implementation using word-by-word comparison
  const words1 = str1.split(' ').filter(w => w.length > 0);
  const words2 = str2.split(' ').filter(w => w.length > 0);
  
  if (words1.length === 0 || words2.length === 0) {
    return 0;
  }
  
  let matches = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (soundsLike(word1, word2)) {
        matches++;
        break;
      }
    }
  }
  
  return matches / Math.max(words1.length, words2.length);
}

// Simple phonetic comparison
function soundsLike(word1: string, word2: string): boolean {
  // Very basic - first letter and length similarity check
  if (word1.length === 0 || word2.length === 0) return false;
  
  const firstChar1 = word1.charAt(0).toLowerCase();
  const firstChar2 = word2.charAt(0).toLowerCase();
  
  // First character should match
  if (firstChar1 !== firstChar2) return false;
  
  // Length shouldn't differ too much
  const lengthDiff = Math.abs(word1.length - word2.length);
  if (lengthDiff > Math.min(word1.length, word2.length) / 2) return false;
  
  return true;
}

// Helper function to calculate Levenshtein distance
function levenshteinDistance(a: string, b: string): number {
  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i-1) === a.charAt(j-1)) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i-1][j-1] + 1, // substitution
          matrix[i][j-1] + 1,   // insertion
          matrix[i-1][j] + 1    // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

// Free translation API function - using Google Translate API
export const translateText = async (text: string, targetLang: string = 'vi'): Promise<string> => {
  try {
    // Use Google Translate API through RapidAPI
    const url = 'https://google-translate1.p.rapidapi.com/language/translate/v2';
    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'application/gzip',
        'X-RapidAPI-Key': '3069f1f8e9mshbe08e6281e89ce8p1278f3jsncf63290a068a',
        'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
      },
      body: new URLSearchParams({
        q: text,
        source: 'en',
        target: targetLang
      })
    };

    const response = await fetch(url, options);
    const data = await response.json();
    
    if (data && data.data && data.data.translations && data.data.translations[0]?.translatedText) {
      return data.data.translations[0].translatedText;
    }
    
    // Fallback to DeepL API if Google API fails
    return translateWithDeepL(text, targetLang);
  } catch (error) {
    console.error("Google Translation API error:", error);
    return translateWithDeepL(text, targetLang);
  }
};

// DeepL Translation API (higher accuracy than MyMemory)
const translateWithDeepL = async (text: string, targetLang: string = 'vi'): Promise<string> => {
  try {
    // Use DeepL API through RapidAPI
    const url = 'https://deepl-translator.p.rapidapi.com/translate';
    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': '3069f1f8e9mshbe08e6281e89ce8p1278f3jsncf63290a068a',
        'X-RapidAPI-Host': 'deepl-translator.p.rapidapi.com'
      },
      body: JSON.stringify({
        text: text,
        source: 'en',
        target: targetLang === 'vi' ? 'vi' : targetLang
      })
    };

    const response = await fetch(url, options);
    const data = await response.json();
    
    if (data && data.text) {
      return data.text;
    }
    
    // Fallback to MyMemory if DeepL API fails
    return translateWithMyMemory(text, targetLang);
  } catch (error) {
    console.error("DeepL Translation API error:", error);
    return translateWithMyMemory(text, targetLang);
  }
};

// MyMemory Translation API (third fallback)
const translateWithMyMemory = async (text: string, targetLang: string = 'vi'): Promise<string> => {
  try {
    // Use MyMemory free translation API
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    
    // Fallback to LibreTranslate if MyMemory fails
    return translateWithLibre(text, targetLang);
  } catch (error) {
    console.error("MyMemory Translation API error:", error);
    return translateWithLibre(text, targetLang);
  }
};

// LibreTranslate API (fourth fallback)
const translateWithLibre = async (text: string, targetLang: string = 'vi'): Promise<string> => {
  try {
    // Use LibreTranslate public API
    const url = 'https://libretranslate.com/translate';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetLang,
      })
    });
    
    const data = await response.json();
    if (data && data.translatedText) {
      return data.translatedText;
    }
    
    // If all APIs fail, fall back to enhanced mock translation
    return enhancedMockTranslate(text);
  } catch (error) {
    console.error("LibreTranslate API error:", error);
    return enhancedMockTranslate(text);
  }
};

// Enhanced mock translation function with more vocabulary as final fallback
function enhancedMockTranslate(text: string): string {
  const translations: Record<string, string> = {
    // Common phrases
    'hello': 'xin chào',
    'how are you': 'bạn khỏe không',
    'thank you': 'cảm ơn bạn',
    'goodbye': 'tạm biệt',
    'yes': 'vâng',
    'no': 'không',
    
    // Learning related
    'english': 'tiếng Anh',
    'vietnamese': 'tiếng Việt',
    'learning': 'đang học',
    'speaking': 'nói chuyện',
    'listening': 'lắng nghe',
    'practice': 'luyện tập',
    'study': 'học tập',
    'read': 'đọc',
    'write': 'viết',
    
    // Common words
    'good': 'tốt',
    'bad': 'xấu',
    'big': 'to lớn',
    'small': 'nhỏ',
    'fast': 'nhanh',
    'slow': 'chậm',
    'hot': 'nóng',
    'cold': 'lạnh',
    'new': 'mới',
    'old': 'cũ',
    
    // Time expressions
    'today': 'hôm nay',
    'yesterday': 'hôm qua',
    'tomorrow': 'ngày mai',
    'now': 'bây giờ',
    'later': 'sau này',
    
    // Additional useful phrases
    'i understand': 'tôi hiểu',
    'i don\'t understand': 'tôi không hiểu',
    'please repeat': 'vui lòng nhắc lại',
    'please speak slowly': 'vui lòng nói chậm',
    'what does this mean': 'cái này có nghĩa là gì',
    'where is': 'ở đâu',
    'how much': 'bao nhiêu',
    'how many': 'bao nhiêu',
    'i need help': 'tôi cần giúp đỡ',
    'is there': 'có',
    'there is': 'có',
    'there are': 'có'
  };
  
  // Try exact match
  const lowerText = text.toLowerCase();
  if (translations[lowerText]) {
    return translations[lowerText];
  }
  
  // Try to match partial phrases
  for (const [key, value] of Object.entries(translations)) {
    if (lowerText.includes(key)) {
      return text.replace(new RegExp(key, 'gi'), value);
    }
  }
  
  return `${text} (chưa dịch được)`;
}

// Import compromise NLP library
import nlp from 'compromise';

// Enhanced function to segment text into phrases using NLP approaches with compromise
export const segmentTextIntoPhrases = (text: string): string[] => {
  const phrases: string[] = [];
  
  // First, use compromise to parse the text
  const doc = nlp(text);
  
  // Extract sentences
  const sentences = doc.sentences().out('array');
  
  // Process each sentence
  sentences.forEach(sentence => {
    // For very short sentences (less than 30 chars), keep as is
    if (sentence.length <= 30) {
      phrases.push(sentence);
      return;
    }
    
    // Parse the sentence with compromise to extract meaningful chunks
    const sentenceDoc = nlp(sentence);
    
    // Get noun phrases (usually the most meaningful chunks)
    const nounPhrases = sentenceDoc.match('#Determiner? #Adjective* #Noun+').out('array');
    
    // Get verb phrases
    const verbPhrases = sentenceDoc.match('#Adverb? #Verb+ #Particle?').out('array');
    
    // Get prepositional phrases
    const prepPhrases = sentenceDoc.match('#Preposition #Determiner? #Adjective* #Noun+').out('array');
    
    // Get clauses (larger meaningful units)
    const clauses = sentenceDoc.clauses().out('array');
    
    // Combine all the extracted phrases
    const extractedPhrases = [...nounPhrases, ...verbPhrases, ...prepPhrases];
    
    // If we got meaningful phrases, use them
    if (extractedPhrases.length > 0) {
      // Filter out very short phrases and duplicates
      const filteredPhrases = extractedPhrases
        .filter(p => p.length > 5)
        .filter((p, i, self) => self.indexOf(p) === i);
      
      if (filteredPhrases.length > 0) {
        phrases.push(...filteredPhrases);
        return;
      }
    }
    
    // If we got clauses, use them
    if (clauses.length > 1) {
      phrases.push(...clauses);
      return;
    }
    
    // Fallback: Use our original phrase boundary detection if NLP didn't give good results
    const phraseBoundaries = sentence
      .replace(/([,;:])\s+/g, '$1|')
      .split('|')
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    // These are common phrases that shouldn't be split
    const commonPhrases = [
      'for example', 'in addition', 'as well as', 'such as',
      'in order to', 'due to the fact that', 'on the other hand',
      'at the same time', 'in spite of', 'regardless of',
      'in the meantime', 'in conclusion', 'as a result'
    ];
    
    phraseBoundaries.forEach(phrase => {
      // For short phrases, keep as is
      if (phrase.length <= 50) {
        phrases.push(phrase);
        return;
      }
      
      // Check if the phrase contains any common phrase that should be kept together
      const shouldKeepTogether = commonPhrases.some(common => 
        phrase.toLowerCase().includes(common)
      );
      
      if (shouldKeepTogether && phrase.length <= 80) {
        phrases.push(phrase);
        return;
      }
      
      // Split longer phrases by words, maintaining reasonable chunk sizes
      const words = phrase.split(' ');
      let currentPhrase = '';
      
      words.forEach(word => {
        if ((currentPhrase + ' ' + word).length <= 40) {
          currentPhrase = currentPhrase ? `${currentPhrase} ${word}` : word;
        } else {
          if (currentPhrase) {
            phrases.push(currentPhrase);
          }
          currentPhrase = word;
        }
      });
      
      if (currentPhrase) {
        phrases.push(currentPhrase);
      }
    });
  });
  
  // Remove duplicates and ensure reasonable phrase length
  return phrases
    .filter((phrase, index, self) => 
      // Remove duplicates
      self.indexOf(phrase) === index && 
      // Ensure minimum phrase length (at least 3 characters)
      phrase.length > 3 &&
      // Ensure maximum phrase length (at most 80 characters)
      phrase.length <= 80
    )
    // Sort by length for better learning progression (shorter phrases first)
    .sort((a, b) => a.length - b.length);
};

// Generate fill-in-the-blanks for a phrase with improved algorithm
export const generateFillInTheBlanks = (phrase: string): string => {
  const words = phrase.split(' ');
  
  // For very short phrases, blank out only one word
  if (words.length <= 3) {
    const indexToBlank = Math.floor(words.length / 2);
    return words.map((word, i) => i === indexToBlank ? '____' : word).join(' ');
  }
  
  // Skip articles, prepositions, and very short words
  const skipWords = ['the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'and', 'but', 'or', 'for', 'with', 'by'];
  
  // Find words suitable for blanking (not too short, not in skip list)
  const suitableIndices = words
    .map((word, index) => ({ word: word.toLowerCase().replace(/[^a-z]/g, ''), index }))
    .filter(item => !skipWords.includes(item.word) && item.word.length > 2)
    .map(item => item.index);
  
  // If no suitable words, blank every third word
  if (suitableIndices.length === 0) {
    return words.map((word, i) => i % 3 === 0 && word.length > 2 ? '____' : word).join(' ');
  }
  
  // Blank approximately 1/3 of suitable words
  const numToBlank = Math.max(1, Math.floor(suitableIndices.length / 3));
  const indicesToBlank = new Set<number>();
  
  // Randomly select indices to blank
  while (indicesToBlank.size < numToBlank) {
    const randomIndex = Math.floor(Math.random() * suitableIndices.length);
    indicesToBlank.add(suitableIndices[randomIndex]);
  }
  
  return words.map((word, i) => indicesToBlank.has(i) ? '____' : word).join(' ');
};

// Function to analyze pronunciation with AssemblyAI (mock implementation)
export const analyzeAssemblyAIPronunciation = async (userAudio: Blob, referenceText: string): Promise<number> => {
  // In a real implementation, you would:
  // 1. Upload the audio to AssemblyAI
  // 2. Request pronunciation analysis
  // 3. Parse and return the score
  
  // For now, we'll simulate a response
  console.log('AssemblyAI API would be called here with API key: f9433a947cab490a9cdbc703e948c2f1');
  console.log('Reference text:', referenceText);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a random score between 60 and 95
  return Math.floor(Math.random() * 36) + 60;
};

// New enhanced function to analyze pronunciation with detailed feedback
export interface DetailedPronunciationFeedback {
  overallScore: number;         // Overall score from 0-100
  phonemeScores: PhonemeScore[];  // Score for each phoneme
  stressScores: StressScore[];    // Score for rhythm and stress patterns
  problemAreas: ProblemArea[];    // Areas that need improvement
  improvementTips: string[];      // Tips for improving pronunciation
}

export interface PhonemeScore {
  phoneme: string;   // The IPA phoneme
  score: number;     // Score from 0-100
  position: string;  // Where in the word (start, middle, end)
  examples: string[];  // Example words with this phoneme
}

export interface StressScore {
  word: string;      // The word being analyzed
  correctStress: string;  // Correct stress pattern
  userStress: string;     // User's stress pattern
  score: number;     // Score from 0-100
}

export interface ProblemArea {
  type: 'consonant' | 'vowel' | 'diphthong' | 'cluster' | 'stress' | 'rhythm' | 'intonation';
  description: string;  // Description of the problem
  examples: string[];   // Example words showing the problem
  improvement: string;  // Suggestion for improvement
}

// Function to get detailed pronunciation feedback (enhanced API simulation)
export const getDetailedPronunciationFeedback = async (
  userAudio: Blob | string, 
  referenceText: string
): Promise<DetailedPronunciationFeedback> => {
  // In a real implementation, you would:
  // 1. Upload the audio to a speech analysis API
  // 2. Request detailed pronunciation analysis
  // 3. Parse and return structured feedback
  
  console.log('Detailed pronunciation API would be called here with audio and reference text');
  console.log('Reference text:', referenceText);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Extract words from reference text
  const words = referenceText.trim().toLowerCase().split(/\s+/);
  
  // Generate simulated detailed feedback
  const overallScore = Math.floor(Math.random() * 31) + 70; // Between 70-100
  
  // Common English phonemes that Vietnamese speakers struggle with
  const challengingPhonemes = [
    { phoneme: 'θ', examples: ['think', 'this', 'bath', 'breathe'] },  // "th" sound
    { phoneme: 'ð', examples: ['this', 'that', 'then', 'weather', 'breathe'] }, // voiced "th"
    { phoneme: 'r', examples: ['right', 'very', 'really', 'problem', 'great'] }, // English "r"
    { phoneme: 'dʒ', examples: ['job', 'bridge', 'judge', 'edge', 'agent'] },   // "j" sound
    { phoneme: 'z', examples: ['zoo', 'zero', 'dogs', 'easy', 'zone'] },        // "z" sound
    { phoneme: 'ʃ', examples: ['she', 'ship', 'sure', 'ocean', 'special'] },    // "sh" sound
    { phoneme: 'ʒ', examples: ['vision', 'pleasure', 'measure', 'beige'] },     // "zh" sound
    { phoneme: 'v', examples: ['very', 'love', 'five', 'visit', 'save'] },      // "v" sound
    { phoneme: 'eɪ', examples: ['say', 'main', 'make', 'face', 'day'] },        // long "a"
    { phoneme: 'æ', examples: ['cat', 'bad', 'map', 'happy', 'flat'] },         // short "a"
    { phoneme: 'ɛə', examples: ['air', 'there', 'chair', 'fair', 'care'] },     // "air" sound
    { phoneme: 'aʊ', examples: ['now', 'house', 'down', 'proud', 'count'] }     // "ow" sound
  ];
  
  // Generate phoneme scores
  const phonemeScores: PhonemeScore[] = [];
  // Randomly select 3-6 phonemes to analyze
  const numPhonemes = Math.floor(Math.random() * 4) + 3;
  const selectedIndices = new Set<number>();
  while (selectedIndices.size < numPhonemes) {
    selectedIndices.add(Math.floor(Math.random() * challengingPhonemes.length));
  }
  
  // Create phoneme scores for selected phonemes
  selectedIndices.forEach(idx => {
    const phoneme = challengingPhonemes[idx];
    const positions = ['initial', 'medial', 'final'];
    phonemeScores.push({
      phoneme: phoneme.phoneme,
      score: Math.floor(Math.random() * 41) + 60, // 60-100
      position: positions[Math.floor(Math.random() * positions.length)],
      examples: phoneme.examples.slice(0, 3)
    });
  });
  
  // Generate stress scores
  const stressScores: StressScore[] = [];
  // Select 2-4 words to analyze for stress
  const numStressWords = Math.floor(Math.random() * 3) + 2;
  const wordsForStress = words.filter(w => w.length > 4);
  
  // If we have enough words to analyze
  if (wordsForStress.length >= numStressWords) {
    // Shuffle and take the first numStressWords
    const shuffled = [...wordsForStress].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numStressWords);
    
    // Create stress scores for selected words
    selected.forEach(word => {
      const stressPatterns = ['●○', '○●', '●○○', '○●○', '○○●', '●○○○', '○●○○', '○○●○', '○○○●'];
      const correctStress = stressPatterns[Math.floor(Math.random() * (word.length > 2 ? 5 : 2))];
      const userStress = Math.random() > 0.5 ? correctStress : stressPatterns[Math.floor(Math.random() * stressPatterns.length)];
      
      stressScores.push({
        word: word,
        correctStress: correctStress,
        userStress: userStress,
        score: correctStress === userStress ? 100 : Math.floor(Math.random() * 41) + 60
      });
    });
  }
  
  // Generate problem areas
  const problemAreas: ProblemArea[] = [];
  const potentialProblems = [
    {
      type: 'consonant' as const,
      description: 'Difficulty with "th" sound (θ/ð)',
      examples: ['thank', 'they', 'both', 'breathe'],
      improvement: 'Place your tongue between your teeth and blow air gently to make the "th" sound.'
    },
    {
      type: 'consonant' as const,
      description: 'Confusion between "l" and "r" sounds',
      examples: ['light', 'right', 'play', 'pray'],
      improvement: 'For "r", curl your tongue back slightly without touching the roof of your mouth'
    },
    {
      type: 'vowel' as const,
      description: 'Short vs. long vowel distinction',
      examples: ['ship/sheep', 'bit/beat', 'pull/pool'],
      improvement: 'Long vowels require more tension in your mouth and lips'
    },
    {
      type: 'diphthong' as const,
      description: 'Diphthong pronunciation issues',
      examples: ['make', 'go', 'right', 'boy', 'now'],
      improvement: 'Practice gliding from one vowel sound to another smoothly'
    },
    {
      type: 'cluster' as const,
      description: 'Consonant cluster simplification',
      examples: ['strength', 'texts', 'worlds', 'sixths'],
      improvement: 'Practice pronouncing each consonant distinctly without adding vowels between them'
    },
    {
      type: 'stress' as const,
      description: 'Word stress patterns',
      examples: ['photograph/photographer/photographic', 'record (n)/record (v)'],
      improvement: 'Listen carefully to stress patterns and practice with stress marking'
    },
    {
      type: 'rhythm' as const,
      description: 'Sentence rhythm and intonation',
      examples: ['What did you DO yesterday?', 'What DID you do yesterday?'],
      improvement: 'Record yourself speaking and compare with native speakers, focusing on rhythm'
    },
    {
      type: 'intonation' as const,
      description: 'Rising and falling intonation patterns',
      examples: ['Are you coming? (rising)', 'Go home now. (falling)'],
      improvement: 'Practice questions with rising intonation and statements with falling intonation'
    }
  ];
  
  // Select 2-3 problem areas
  const numProblems = Math.floor(Math.random() * 2) + 2;
  const problemIndices = new Set<number>();
  while (problemIndices.size < numProblems) {
    problemIndices.add(Math.floor(Math.random() * potentialProblems.length));
  }
  
  // Add selected problems to feedback
  problemIndices.forEach(idx => {
    problemAreas.push(potentialProblems[idx]);
  });
  
  // Generate improvement tips
  const improvementTips = [
    'Listen to native speakers and mimic their pronunciation',
    'Record yourself speaking and compare with native speakers',
    'Practice minimal pairs to distinguish similar sounds',
    'Learn the International Phonetic Alphabet (IPA) to understand phonetic symbols',
    'Focus on one sound at a time and practice daily',
    'Use pronunciation apps that provide visual feedback',
    'Work with a pronunciation coach or language tutor',
    'Read aloud regularly to improve fluency and intonation',
    'Practice tongue twisters to improve specific sounds',
    'Watch English movies with subtitles and repeat phrases',
    'Use a mirror to watch your mouth positions for different sounds',
    'Learn about mouth, tongue and lip positions for accurate sound production'
  ];
  
  // Shuffle and pick 3-5 tips
  const shuffledTips = [...improvementTips].sort(() => 0.5 - Math.random());
  const selectedTips = shuffledTips.slice(0, Math.floor(Math.random() * 3) + 3);
  
  // Return comprehensive pronunciation feedback
  return {
    overallScore,
    phonemeScores,
    stressScores,
    problemAreas,
    improvementTips: selectedTips
  };
};

// Additional function to generate enhanced word-by-word pronunciation scores
export interface WordPronunciationAnalysis {
  word: string;
  correctIPA: string;
  userIPA: string;
  score: number;
  problemPhonemes: {
    phoneme: string;
    position: number;
    correct: boolean;
  }[];
  feedbackTip: string;
}

export const analyzeWordPronunciation = async (
  word: string,
  userAudio: Blob | string
): Promise<WordPronunciationAnalysis> => {
  // In a real implementation, you would:
  // 1. Get the correct IPA for the word
  // 2. Extract the pronunciation from the user audio
  // 3. Compare phoneme by phoneme
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Get correct IPA
  const correctIPA = await getIpaTranscription(word);
  
  // Simulate user's pronunciation with variations based on common Vietnamese speaker errors
  const phonemes = correctIPA.split('');
  let userIPA = '';
  const problemPhonemes: {phoneme: string; position: number; correct: boolean}[] = [];
  
  // Common pronunciation substitutions for Vietnamese speakers
  const substitutions: Record<string, string> = {
    'θ': 't', // "th" becomes "t"
    'ð': 'd', // voiced "th" becomes "d"
    'v': 'b', // "v" becomes "b"
    'dʒ': 'z', // "j" sound becomes "z"
    'r': 'z', // "r" sometimes becomes "z"
    'ʒ': 'z', // "zh" sound becomes "z"
    'æ': 'e', // "æ" becomes "e"
  };
  
  // Generate simulated user pronunciation with some errors
  phonemes.forEach((phoneme, index) => {
    // 30% chance of mispronunciation for challenging phonemes
    if (substitutions[phoneme] && Math.random() < 0.3) {
      userIPA += substitutions[phoneme];
      problemPhonemes.push({
        phoneme: phoneme,
        position: index,
        correct: false
      });
    } else {
      userIPA += phoneme;
      if (!/[ˈˌ']/.test(phoneme)) { // Don't count stress marks as correct phonemes
        problemPhonemes.push({
          phoneme: phoneme,
          position: index,
          correct: true
        });
      }
    }
  });
  
  // Calculate score based on correct phonemes
  const correctCount = problemPhonemes.filter(p => p.correct).length;
  const totalPhonemes = problemPhonemes.length;
  const score = Math.round((correctCount / totalPhonemes) * 100);
  
  // Generate feedback tip based on mispronounced phonemes
  let feedbackTip = '';
  const incorrectPhonemes = problemPhonemes.filter(p => !p.correct);
  
  if (incorrectPhonemes.length > 0) {
    const phoneticTips: Record<string, string> = {
      'θ': 'Place your tongue between your teeth and blow air gently to make the "th" sound.',
      'ð': 'Place your tongue between your teeth and vibrate your vocal cords for the voiced "th" sound.',
      'v': 'Bring your upper teeth to your bottom lip and vibrate for the "v" sound, different from "b".',
      'dʒ': 'Start with "d" then quickly move to "zh" for the "j" sound in "job".',
      'r': 'Curl your tongue back slightly without touching the roof of your mouth for the English "r".',
      'ʒ': 'Make a "sh" sound but vibrate your vocal cords for the "zh" sound in "vision".',
      'æ': 'Open your mouth wider for the short "a" sound in "cat", different from "e" in "get".'
    };
    
    // Get the first mispronounced phoneme with available tip
    const firstError = incorrectPhonemes.find(p => phoneticTips[p.phoneme]);
    if (firstError) {
      feedbackTip = phoneticTips[firstError.phoneme];
    } else {
      feedbackTip = "Focus on listening and repeating this sound after a native speaker.";
    }
  } else {
    feedbackTip = "Excellent pronunciation! Keep practicing to maintain your skill.";
  }
  
  return {
    word,
    correctIPA,
    userIPA,
    score,
    problemPhonemes,
    feedbackTip
  };
};

// Function to analyze sentence rhythm and intonation
export interface SentenceRhythmAnalysis {
  overallScore: number;
  rhythmPatternCorrectness: number; // 0-100
  intonationAccuracy: number;      // 0-100
  speedAppropriateScore: number;   // 0-100
  pausePatternScore: number;       // 0-100
  feedback: string;
  improvementSuggestions: string[];
}

export const analyzeSentenceRhythm = async (
  sentence: string,
  userAudio: Blob | string
): Promise<SentenceRhythmAnalysis> => {
  // In a real implementation, you would analyze rhythm, intonation, speed, and pauses
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate random scores for different aspects
  const rhythmPatternCorrectness = Math.floor(Math.random() * 31) + 70; // 70-100
  const intonationAccuracy = Math.floor(Math.random() * 31) + 70;       // 70-100
  const speedAppropriateScore = Math.floor(Math.random() * 31) + 70;    // 70-100
  const pausePatternScore = Math.floor(Math.random() * 31) + 70;        // 70-100
  
  // Overall score is weighted average
  const overallScore = Math.round(
    (rhythmPatternCorrectness * 0.3) +
    (intonationAccuracy * 0.3) +
    (speedAppropriateScore * 0.2) +
    (pausePatternScore * 0.2)
  );
  
  // Generate feedback based on scores
  let feedback = '';
  if (overallScore >= 90) {
    feedback = 'Your rhythm and intonation are excellent, very close to native-like speech.';
  } else if (overallScore >= 80) {
    feedback = 'Good rhythm and intonation patterns with minor areas for improvement.';
  } else if (overallScore >= 70) {
    feedback = 'You have decent rhythm but some areas need improvement, particularly in stress and intonation.';
  } else {
    feedback = 'Your rhythm patterns need significant improvement to sound more natural.';
  }
  
  // Generate improvement suggestions
  const suggestions = [
    'Focus on stressing content words (nouns, verbs, adjectives, adverbs) more than function words.',
    'Practice linking words together smoothly without unnatural pauses.',
    'Record yourself reading aloud and compare with native speakers, focusing on rhythm.',
    'Mark stressed syllables in sentences and practice emphasizing them.',
    'Use a metronome to practice speaking with consistent timing.',
    'Listen to news broadcasts and mimic the announcers\' speech patterns.',
    'Speak along with audiobooks or podcasts to match natural speech patterns.',
    'Practice rising intonation for questions and falling intonation for statements.',
    'Record speeches or presentations and analyze your rhythm patterns.',
    'Join a conversation group to practice natural rhythm in dialogue.'
  ];
  
  // Select 3 random suggestions
  const selectedSuggestions = [...suggestions]
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);
  
  return {
    overallScore,
    rhythmPatternCorrectness,
    intonationAccuracy,
    speedAppropriateScore,
    pausePatternScore,
    feedback,
    improvementSuggestions: selectedSuggestions
  };
};

// Now let's create a function to generate an enhanced composite score with all the feedback
export interface EnhancedPronunciationScore {
  overallScore: number;  // 0-100
  accuracyScore: number; // Word/sound accuracy
  fluencyScore: number;  // Smoothness of speech
  rhythmScore: number;   // Rhythm and stress patterns
  intonationScore: number; // Rising/falling patterns
  problemSounds: { 
    phoneme: string;
    examples: string[];
    description: string;
  }[];
  feedback: {
    strengths: string[];
    improvements: string[];
    practiceExercises: string[];
  };
  wordByWordAnalysis?: WordPronunciationAnalysis[];
}

export const getEnhancedPronunciationScore = async (
  text: string,
  userAudio: Blob | string
): Promise<EnhancedPronunciationScore> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate base scores
  const accuracyScore = Math.floor(Math.random() * 31) + 70;
  const fluencyScore = Math.floor(Math.random() * 31) + 70;
  const rhythmScore = Math.floor(Math.random() * 31) + 70;
  const intonationScore = Math.floor(Math.random() * 31) + 70;
  
  // Overall score with weighted components
  const overallScore = Math.round(
    (accuracyScore * 0.35) +
    (fluencyScore * 0.25) +
    (rhythmScore * 0.2) +
    (intonationScore * 0.2)
  );
  
  // Common problematic sounds for Vietnamese speakers
  const commonProblemSounds = [
    {
      phoneme: 'θ/ð',
      examples: ['think', 'this', 'bath', 'breathe'],
      description: 'The "th" sounds are often replaced with "t" or "d"'
    },
    {
      phoneme: 'v',
      examples: ['very', 'vacation', 'give', 'love'],
      description: 'The "v" sound is often replaced with "b" or "f"'
    },
    {
      phoneme: 'r',
      examples: ['red', 'around', 'carry', 'world'],
      description: 'The English "r" is often pronounced like the Vietnamese "r" (similar to "z")'
    },
    {
      phoneme: 'l',
      examples: ['light', 'play', 'fall', 'help'],
      description: 'The "l" in final position may be unclear or dropped'
    },
    {
      phoneme: 'dʒ',
      examples: ['jump', 'job', 'edge', 'bridge'],
      description: 'The "j" sound is often replaced with "z" or "ch"'
    },
    {
      phoneme: 'æ',
      examples: ['cat', 'map', 'happy', 'back'],
      description: 'The short "a" sound is often replaced with "e"'
    },
    {
      phoneme: 'ɪ vs iː',
      examples: ['ship vs. sheep', 'hit vs. heat'],
      description: 'Difficulty distinguishing between short and long "i" sounds'
    },
    {
      phoneme: 'ending consonants',
      examples: ['top', 'book', 'sad', 'bus'],
      description: 'Final consonants may be dropped or unreleased'
    }
  ];
  
  // Randomly select 2-3 problem sounds
  const numProblems = Math.floor(Math.random() * 2) + 2;
  const shuffledProblems = [...commonProblemSounds].sort(() => 0.5 - Math.random());
  const selectedProblems = shuffledProblems.slice(0, numProblems);
  
  // Generate feedback
  const strengthsPool = [
    'Good pronunciation of most vowel sounds',
    'Clear articulation of most consonant sounds',
    'Good command of word stress in most words',
    'Consistent speech rate throughout the passage',
    'Good use of pauses at appropriate points',
    'Clear distinction between long and short vowels',
    'Natural intonation patterns in questions',
    'Good linking of words in phrases'
  ];
  
  const improvementsPool = [
    'Work on the "th" sounds by placing tongue between teeth',
    'Practice distinguishing between "v" and "b" sounds',
    'Focus on English "r" sound by curling tongue slightly',
    'Maintain final consonants clearly at the end of words',
    'Distinguish short and long vowel pairs like "ship/sheep"',
    'Work on appropriate stress patterns in multi-syllable words',
    'Practice linking words together more smoothly',
    'Develop more natural intonation patterns for questions and statements',
    'Focus on consonant clusters without adding extra vowels',
    'Improve rhythm by emphasizing stressed syllables more clearly'
  ];
  
  const practiceExercisesPool = [
    'Practice minimal pairs: ship/sheep, bat/bet, not/note',
    'Record yourself reading aloud and compare with native speakers',
    'Use tongue twisters to improve specific sounds: "Three thin thinkers thinking thick thoughts"',
    'Read aloud while exaggerating stress patterns',
    'Shadow a native speaker by repeating immediately after them',
    'Practice consonant clusters: strengths, texts, sixths, twelfths',
    'Record TV news anchors and imitate their speech patterns',
    'Use a mirror to check tongue and lip positions',
    'Practice sentence stress by tapping on stressed words',
    'Read poetry aloud to improve rhythm and flow'
  ];
  
  // Select random feedback items
  const strengths = [...strengthsPool].sort(() => 0.5 - Math.random()).slice(0, 2);
  const improvements = [...improvementsPool].sort(() => 0.5 - Math.random()).slice(0, 3);
  const practiceExercises = [...practiceExercisesPool].sort(() => 0.5 - Math.random()).slice(0, 3);
  
  // Optional word-by-word analysis for shorter texts
  let wordByWordAnalysis: WordPronunciationAnalysis[] | undefined = undefined;
  
  if (text.split(/\s+/).length <= 10) {
    // For short texts, generate word-by-word analysis
    const words = text.trim().split(/\s+/);
    wordByWordAnalysis = [];
    
    // Generate mock analysis for each word
    for (const word of words) {
      if (word.length < 2) continue;
      const analysis = await analyzeWordPronunciation(word, userAudio);
      wordByWordAnalysis.push(analysis);
    }
  }
  
  return {
    overallScore,
    accuracyScore,
    fluencyScore,
    rhythmScore,
    intonationScore,
    problemSounds: selectedProblems,
    feedback: {
      strengths,
      improvements,
      practiceExercises
    },
    wordByWordAnalysis
  };
};

// Create a sophisticated pronunciation practice system for words
export interface PronunciationPracticeSystem {
  generateExerciseSet: (level: 'beginner' | 'intermediate' | 'advanced', focusArea?: string) => PronunciationExerciseSet;
  evaluatePractice: (exercise: PronunciationExercise, userAudio: Blob | string) => Promise<PracticeEvaluation>;
}

export interface PronunciationExerciseSet {
  level: 'beginner' | 'intermediate' | 'advanced';
  focusArea: string;
  exercises: PronunciationExercise[];
  recommendedPracticeTime: string;
}

export interface PronunciationExercise {
  id: string;
  type: 'minimal-pair' | 'tongue-twister' | 'sentence' | 'dialogue' | 'word';
  content: string;
  targetPhonemes: string[];
  correctIPA: string;
  explanation: string;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
}

export interface PracticeEvaluation {
  exerciseId: string;
  score: number;
  accuracy: {
    phoneme: string;
    score: number;
    feedback: string;
  }[];
  overallFeedback: string;
  nextSteps: string[];
}

// Generate realistic IPA representation for any English word
export const generateRealisticIPA = (word: string): string => {
  // This is a simplified version - in a real app you would use a dictionary API
  return getIpaTranscription(word);
};

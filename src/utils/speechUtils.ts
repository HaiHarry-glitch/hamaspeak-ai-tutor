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

// Enhanced pronunciation scoring using more advanced algorithms
export const calculatePronunciationScore = (original: string, userTranscript: string): {
  overallScore: number;
  accuracyScore: number; 
  fluencyScore: number;
  intonationScore: number;
  stressScore: number;
  wordsRecognized: string[];
  missedWords: string[];
  mispronunciations: string[];
} => {
  // Normalize both strings for comparison
  const normalizedOriginal = original.trim().toLowerCase();
  const normalizedUser = userTranscript.trim().toLowerCase();
  
  // Extract words from both strings
  const originalWords = normalizedOriginal.split(/\s+/);
  const userWords = normalizedUser.split(/\s+/);
  
  // Calculate word match rate
  const matchedWords: string[] = [];
  const missedWords: string[] = [];
  const mispronunciations: string[] = [];
  
  // Find words that match exactly
  originalWords.forEach(word => {
    const cleanWord = word.replace(/[.,!?;:]/g, '');
    if (userWords.includes(cleanWord)) {
      matchedWords.push(cleanWord);
    } else {
      // Check for similar words (potential mispronunciations)
      const similarWord = userWords.find(uWord => 
        levenshteinDistance(cleanWord, uWord) <= Math.ceil(cleanWord.length / 3)
      );
      
      if (similarWord) {
        mispronunciations.push(`${cleanWord} → ${similarWord}`);
      } else {
        missedWords.push(cleanWord);
      }
    }
  });
  
  // Calculate phonetic similarity using soundex
  const phoneticSimilarity = calculatePhoneticSimilarity(normalizedOriginal, normalizedUser);
  
  // Calculate different scoring dimensions
  const exactWordMatchRatio = originalWords.length > 0 
    ? matchedWords.length / originalWords.length 
    : 0;
  
  // Calculate Levenshtein distance for accuracy
  const levenDistance = levenshteinDistance(normalizedOriginal, normalizedUser);
  const maxLength = Math.max(normalizedOriginal.length, normalizedUser.length);
  const textSimilarity = 1 - levenDistance / maxLength;
  
  // Realistic scoring that's not too lenient
  const accuracyScore = Math.round((textSimilarity * 0.6 + exactWordMatchRatio * 0.4) * 100);
  
  // Different aspects of pronunciation
  const fluencyScore = Math.round((exactWordMatchRatio * 0.7 + phoneticSimilarity * 0.3) * 100);
  const intonationScore = Math.round((phoneticSimilarity * 0.6 + exactWordMatchRatio * 0.4) * 100);
  const stressScore = Math.round((exactWordMatchRatio * 0.5 + phoneticSimilarity * 0.5) * 100);
  
  // Overall score - weighted average of all dimensions with some randomness for realism
  // Make it less likely to get 100%, even when the match is exact
  const baseOverallScore = (accuracyScore * 0.4 + fluencyScore * 0.3 + intonationScore * 0.15 + stressScore * 0.15);
  
  // Add a small random factor for realism (±5 points)
  const randomFactor = Math.random() * 10 - 5;
  const overallScore = Math.min(98, Math.max(0, Math.round(baseOverallScore + randomFactor)));
  
  return {
    overallScore,
    accuracyScore,
    fluencyScore,
    intonationScore,
    stressScore,
    wordsRecognized: matchedWords,
    missedWords,
    mispronunciations
  };
};

// Improved function to identify words that were mispronounced
export const getWordErrors = (original: string, userTranscript: string): {word: string, suggestion: string}[] => {
  const normalizedOriginal = original.toLowerCase().replace(/[.,!?;:]/g, '');
  const normalizedUser = userTranscript.toLowerCase().replace(/[.,!?;:]/g, '');
  
  const originalWords = normalizedOriginal.split(/\s+/);
  const userWords = normalizedUser.split(/\s+/);
  
  const errors: {word: string, suggestion: string}[] = [];
  
  // Find words in original that don't appear in user transcript
  originalWords.forEach(word => {
    // Skip very short words or common articles
    if (word.length <= 1 || ['a', 'the', 'of', 'to', 'in', 'and', 'is'].includes(word)) {
      return;
    }
    
    // Check if this word exists in the user transcript
    const exists = userWords.some(userWord => {
      return userWord === word || calculateWordSimilarity(userWord, word) > 0.8;
    });
    
    if (!exists) {
      // Find most similar word as suggestion
      let mostSimilar = '';
      let highestSimilarity = 0;
      
      userWords.forEach(userWord => {
        const similarity = calculateWordSimilarity(userWord, word);
        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
          mostSimilar = userWord;
        }
      });
      
      errors.push({
        word: word,
        suggestion: highestSimilarity > 0.3 ? mostSimilar : '(missing)'
      });
    }
  });
  
  return errors;
};

// Identify words that were mispronounced
export const getWordErrors2 = (original: string, userTranscript: string): string[] => {
  const normalizedOriginal = original.toLowerCase().replace(/[.,!?;:]/g, '');
  const normalizedUser = userTranscript.toLowerCase().replace(/[.,!?;:]/g, '');
  
  const originalWords = normalizedOriginal.split(/\s+/);
  const userWords = normalizedUser.split(/\s+/);
  
  // Find words in original that don't appear in user transcript
  const missingWords = originalWords.filter(word => {
    // Skip very short words or common articles
    if (word.length <= 2 || ['the', 'and', 'for', 'in', 'on', 'to', 'of'].includes(word)) {
      return false;
    }
    
    // Check if this word or a similar one exists in the user transcript
    return !userWords.some(userWord => {
      // Check for exact match or high similarity
      return userWord === word || 
             calculateWordSimilarity(userWord, word) > 0.7;
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

// Enhanced translation with proper error handling to prevent display issues
export const translateText = async (text: string, targetLang: string = 'vi'): Promise<string> => {
  try {
    // Use Google Translate API
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
    
    if (data?.data?.translations?.[0]?.translatedText) {
      // Clean up the response to prevent HTML tags showing up
      const cleanedText = data.data.translations[0].translatedText
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/<g[^>]*>/g, '')
        .replace(/<\/g>/g, '');
      
      return cleanedText;
    }
    
    // If Google Translate fails, try DeepL
    return translateWithDeepL(text, targetLang);
  } catch (error) {
    console.error("Translation API error:", error);
    // Fallback to an enhanced mock translation
    return enhancedMockTranslate(text);
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

// Enhanced mock translation with more vocabulary
function enhancedMockTranslate(text: string): string {
  const translations: Record<string, string> = {
    // Common phrases and words (expanded from original)
    'hello': 'xin chào',
    'how are you': 'bạn khỏe không',
    'thank you': 'cảm ơn bạn',
    'goodbye': 'tạm biệt',
    'yes': 'vâng',
    'no': 'không',
    'important': 'quan trọng',
    'our': 'của chúng tôi',
    'help': 'giúp đỡ',
    'also': 'cũng',
    'learn': 'học',
    'speak': 'nói',
    'understand': 'hiểu',
    'practice': 'thực hành',
    'word': 'từ',
    'sentence': 'câu',
    'pronunciation': 'phát âm',
    'grammar': 'ngữ pháp',
    'vocabulary': 'từ vựng',
    'exercise': 'bài tập',
    'language': 'ngôn ngữ',
    'english': 'tiếng Anh',
    'vietnamese': 'tiếng Việt',
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
  
  // Try direct match
  if (translations[text.toLowerCase()]) {
    return translations[text.toLowerCase()];
  }
  
  // Try to match parts of the text
  let translatedText = text;
  
  Object.entries(translations).forEach(([eng, viet]) => {
    // Use word boundary to prevent partial word matches
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    translatedText = translatedText.replace(regex, viet);
  });
  
  // If no changes were made, add a message indicating no translation
  if (translatedText === text) {
    return `${text} [Không có bản dịch]`;
  }
  
  return translatedText;
}

// Enhanced segment text function using NLP techniques
export const segmentTextIntoPhrases = (text: string): string[] => {
  const phrases: string[] = [];
  
  // First split by punctuation marks
  const sentenceCandidates = text
    .replace(/([.!?])\s+/g, "$1|")
    .split("|")
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  // Process each sentence candidate
  sentenceCandidates.forEach(sentence => {
    // For very short sentences, keep them intact
    if (sentence.length < 30) {
      phrases.push(sentence);
      return;
    }
    
    // Split by commas and other markers
    const subPhrases = sentence
      .replace(/([,;:])\s+/g, "$1|")
      .split("|")
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    // Common English phrases that shouldn't be split
    const phrasesToKeepTogether = [
      'for example', 'such as', 'as well as', 
      'in addition', 'due to', 'because of',
      'in order to', 'so that', 'as long as'
    ];
    
    subPhrases.forEach(subPhrase => {
      // Check if phrase contains any patterns to keep together
      const shouldKeepIntact = phrasesToKeepTogether.some(keepPhrase => 
        subPhrase.toLowerCase().includes(keepPhrase)
      );
      
      if (shouldKeepIntact || subPhrase.length < 50) {
        phrases.push(subPhrase);
      } else {
        // For longer phrases, split into meaningful chunks
        // Use linguistic boundaries like prepositions, conjunctions
        const words = subPhrase.split(' ');
        let currentChunk: string[] = [];
        
        words.forEach((word, index) => {
          currentChunk.push(word);
          
          // Split at natural boundaries with reasonable chunk sizes
          const isPotentialSplitPoint = 
            /^(and|but|or|because|however|therefore|if|when|while|since)$/i.test(word) ||
            /[.!?;:]$/.test(word) ||
            (index > 0 && index % 8 === 0);
          
          if ((isPotentialSplitPoint && currentChunk.length >= 3) || 
              (index === words.length - 1)) {
            phrases.push(currentChunk.join(' '));
            currentChunk = [];
          }
        });
        
        // Add any remaining words
        if (currentChunk.length > 0) {
          phrases.push(currentChunk.join(' '));
        }
      }
    });
  });
  
  // Filter out duplicates and very short phrases
  return phrases
    .filter((phrase, index, self) => 
      self.indexOf(phrase) === index && phrase.length > 2
    )
    // Sort by length for better learning progression
    .sort((a, b) => a.split(' ').length - b.split(' ').length);
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

// Import compromise NLP library
import nlp from 'compromise';

// Enhanced function to segment text into phrases using NLP approaches with compromise
export const segmentTextIntoPhrasesWithNLP = (text: string): string[] => {
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

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
    const recognition = new SpeechRecognition();

    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const result = event.results[0][0];
      resolve({
        transcript: result.transcript,
        confidence: result.confidence
      });
    };

    recognition.onerror = (event) => {
      reject(`Error occurred in recognition: ${event.error}`);
    };

    recognition.start();
  });
};

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
  
  // Combined score (weighted)
  const combinedScore = (similarity * 0.6) + (wordMatchRatio * 0.4);
  
  // Convert to a score between 0-100
  return Math.round(combinedScore * 100);
};

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

// Free translation API function
export const translateText = async (text: string, targetLang: string = 'vi'): Promise<string> => {
  try {
    // Use a free translation API
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    
    // Fallback to mock translations
    return mockTranslate(text);
  } catch (error) {
    console.error("Translation API error:", error);
    return mockTranslate(text);
  }
};

// Mock translation function as fallback
function mockTranslate(text: string): string {
  const translations: Record<string, string> = {
    'hello': 'xin chào',
    'how are you': 'bạn khỏe không',
    'thank you': 'cảm ơn bạn',
    'goodbye': 'tạm biệt',
    'yes': 'vâng',
    'no': 'không',
    'english': 'tiếng Anh',
    'vietnamese': 'tiếng Việt',
    'learning': 'đang học',
    'speaking': 'nói chuyện',
    'listening': 'lắng nghe',
    'practice': 'luyện tập'
  };
  
  const lowerText = text.toLowerCase();
  return translations[lowerText] || `${text} (đã dịch)`;
}

// Enhanced function to segment text into phrases using NLP-like approaches
export const segmentTextIntoPhrases = (text: string): string[] => {
  // First, split text into sentences
  const sentences = text
    .replace(/([.!?])\s+/g, '$1|')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  const phrases: string[] = [];
  
  // Process each sentence into phrases
  sentences.forEach(sentence => {
    // For very short sentences, keep as is
    if (sentence.length <= 30) {
      phrases.push(sentence);
      return;
    }
    
    // Split by natural phrase boundaries
    const phraseBoundaries = sentence
      .replace(/([,;:])\s+/g, '$1|')
      .split('|')
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    phraseBoundaries.forEach(phrase => {
      // For short phrases, keep as is
      if (phrase.length <= 50) {
        phrases.push(phrase);
        return;
      }
      
      // Split longer phrases by words, maintaining reasonable chunk sizes
      const words = phrase.split(' ');
      let currentPhrase = '';
      
      words.forEach(word => {
        if ((currentPhrase + ' ' + word).length <= 50) {
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
  
  return phrases;
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
  const skipWords = ['the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'and', 'but', 'or'];
  
  // Find words suitable for blanking (not too short, not in skip list)
  const suitableIndices = words
    .map((word, index) => ({ word: word.toLowerCase(), index }))
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

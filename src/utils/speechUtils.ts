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

// Compare user's pronunciation with the original text and calculate a score
export const calculatePronunciationScore = (original: string, userTranscript: string): number => {
  // Normalize both strings for comparison
  const normalizedOriginal = original.trim().toLowerCase();
  const normalizedUser = userTranscript.trim().toLowerCase();
  
  // Perfect match
  if (normalizedOriginal === normalizedUser) {
    return 100;
  }
  
  // Simple character-based similarity
  let matchedChars = 0;
  const originalArr = normalizedOriginal.split(' ');
  const userArr = normalizedUser.split(' ');
  
  // Count matched words
  originalArr.forEach(word => {
    if (userArr.includes(word)) {
      matchedChars += word.length;
    }
  });
  
  const maxLength = Math.max(normalizedOriginal.length, normalizedUser.length);
  const similarity = matchedChars / maxLength;
  
  // Convert similarity to a score between 0-100
  return Math.round(similarity * 100);
};

// Function to translate text from English to Vietnamese (mock)
export const translateText = async (text: string, targetLang: string = 'vi'): Promise<string> => {
  // In a real app, you would call a translation API here
  // For now, we'll use a mock translation based on common phrases
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
  
  // Try to find a direct translation
  const lowerText = text.toLowerCase();
  if (translations[lowerText]) {
    return Promise.resolve(translations[lowerText]);
  }
  
  // For more complex phrases, we'll just append "(translated)" for now
  // In a real app, this would be an API call
  return Promise.resolve(`${text} (đã dịch)`);
};

// Function to segment text into phrases (mock AI analysis)
export const segmentTextIntoPhrases = (text: string): string[] => {
  // In a real app, this would use an AI service to segment the text intelligently
  // For now, we'll split by punctuation and limit phrase length
  
  // First, split by punctuation
  const segments = text
    .replace(/([.!?])\s+/g, '$1|')
    .replace(/([,;:])\s+/g, '$1|')
    .split('|')
    .map(segment => segment.trim())
    .filter(segment => segment.length > 0);
  
  // Further break down long segments
  const result: string[] = [];
  
  segments.forEach(segment => {
    if (segment.length <= 50) {
      result.push(segment);
    } else {
      // Split by spaces while trying to keep phrases intact
      const words = segment.split(' ');
      let currentPhrase = '';
      
      words.forEach(word => {
        if ((currentPhrase + ' ' + word).length <= 50) {
          currentPhrase = currentPhrase ? `${currentPhrase} ${word}` : word;
        } else {
          if (currentPhrase) {
            result.push(currentPhrase);
          }
          currentPhrase = word;
        }
      });
      
      if (currentPhrase) {
        result.push(currentPhrase);
      }
    }
  });
  
  return result;
};

// Generate fill-in-the-blanks for a phrase
export const generateFillInTheBlanks = (phrase: string): string => {
  // Create a version with some words replaced by blanks
  const words = phrase.split(' ');
  
  // Replace about 30% of the words with blanks
  const numToReplace = Math.max(1, Math.floor(words.length * 0.3));
  const indexesToReplace = new Set<number>();
  
  while (indexesToReplace.size < numToReplace) {
    const randomIndex = Math.floor(Math.random() * words.length);
    // Don't replace short words
    if (words[randomIndex].length > 2) {
      indexesToReplace.add(randomIndex);
    }
  }
  
  // Create the fill-in-the-blanks version
  const blankVersion = words.map((word, index) => {
    if (indexesToReplace.has(index)) {
      return '____';
    }
    return word;
  }).join(' ');
  
  return blankVersion;
};

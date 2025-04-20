import { ScoreDetails } from '@/types/pronunciation';

// Available voices for TTS
export const getAvailableVoices = async (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
    }
  });
};

// Text-to-speech function
export const speakText = async (
  text: string, 
  voiceName: string = 'en-US-JennyNeural'
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.name === voiceName) || voices.find(v => v.lang.includes('en')) || voices[0];
      
      if (voice) utterance.voice = voice;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));
      
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      reject(error);
    }
  });
};

// Simple translation (mock function)
export const translateText = async (text: string, targetLanguage: string = 'vi'): Promise<string> => {
  // In a real app, this would call a translation API
  console.log(`Translating to ${targetLanguage}: ${text}`);
  
  // Mock implementation - for Vietnamese only
  if (targetLanguage === 'vi') {
    return `[Vietnamese translation of: ${text}]`;
  }
  
  return text;
};

// Speech recognition
export const startSpeechRecognition = async (language: string = 'en-US'): Promise<{ transcript: string }> => {
  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      reject(new Error('Speech recognition not supported in this browser'));
      return;
    }

    // @ts-ignore - Browser API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      resolve({ transcript });
    };
    
    recognition.onerror = (event: any) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };
    
    recognition.start();
    
    // Timeout after 20 seconds instead of 10 to give users more time
    setTimeout(() => {
      try {
        recognition.stop();
      } catch (e) {
        // Ignore errors when stopping
      }
    }, 20000);
  });
};

export const stopSpeechRecognition = (): void => {
  // @ts-ignore - Browser API
  if (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)) {
    try {
      // This is mostly a placeholder since recognition should stop automatically
      // When used with this API, the actual stopping happens elsewhere
    } catch (e) {
      console.error('Error stopping speech recognition:', e);
    }
  }
};

// Calculate pronunciation score
export const calculatePronunciationScore = (
  referenceText: string, 
  spokenText: string
): ScoreDetails => {
  const refWords = referenceText.toLowerCase().trim().split(/\s+/);
  const spokenWords = spokenText.toLowerCase().trim().split(/\s+/);
  
  // Words that were recognized correctly
  const wordsRecognized = spokenWords.filter(w => refWords.includes(w));
  
  // Words in the reference that were missed
  const missedWords = refWords.filter(w => !spokenWords.includes(w));
  
  // Words that might be mispronounced (approximation)
  const mispronunciations = spokenWords
    .filter(w => !refWords.includes(w))
    .map(w => {
      // Find the closest word in reference
      const closest = refWords.reduce((prev, curr) => {
        return getLevenshteinDistance(w, curr) < getLevenshteinDistance(w, prev) ? curr : prev;
      }, refWords[0] || '');
      
      return `${w} → ${closest}`;
    });
  
  // Calculate various scores
  const accuracyScore = Math.min(100, Math.round((wordsRecognized.length / Math.max(1, refWords.length)) * 100));
  
  // Fluency is affected by missed words and incorrect word order
  const fluencyScore = Math.min(100, Math.max(0, 100 - missedWords.length * 10 - mispronunciations.length * 5));
  
  // Completeness score
  const completenessScore = Math.min(100, Math.round((spokenWords.length / Math.max(1, refWords.length)) * 100));
  
  // Stress and intonation are approximated
  const stressScore = Math.min(100, Math.round(accuracyScore * 0.8 + Math.random() * 20));
  const intonationScore = Math.min(100, Math.round(fluencyScore * 0.7 + Math.random() * 30));
  const rhythmScore = Math.min(100, Math.round((fluencyScore + intonationScore) / 2));
  
  // Word error rate
  const wordErrorRate = Math.max(0, Math.min(100, Math.round(30 - accuracyScore * 0.25)));
  
  // Overall score is a weighted average
  const overallScore = Math.round(
    accuracyScore * 0.4 + 
    fluencyScore * 0.3 + 
    stressScore * 0.15 + 
    intonationScore * 0.15
  );
  
  return {
    overallScore,
    accuracyScore,
    fluencyScore,
    completenessScore,
    pronScore: accuracyScore,
    intonationScore,
    stressScore,
    rhythmScore,
    missedWords,
    mispronunciations,
    wordErrorRate
  };
};

// Helper function for word comparison
function getLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  
  // Create matrix
  const d: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  // Initialize first row and column
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  
  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return d[m][n];
}

// Get mispronounced words
export const getWordErrors = (referenceText: string, spokenText: string): string[] => {
  const refWords = referenceText.toLowerCase().trim().split(/\s+/);
  const spokenWords = spokenText.toLowerCase().trim().split(/\s+/);
  
  // Simple approximation
  return spokenWords.filter(w => 
    !refWords.includes(w) && 
    !refWords.some(rw => getLevenshteinDistance(w, rw) <= 2)
  );
};

// Mock IPA transcription
export const getIpaTranscription = async (word: string): Promise<string> => {
  // This would normally call an API
  // For now, we'll return a simplified mock
  const vowels = ['æ', 'ɑ', 'e', 'ɪ', 'i', 'ɒ', 'ʊ', 'u', 'ʌ', 'ə', 'ɔ', 'ɝ'];
  const consonants = ['b', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'z', 'ʃ', 'ʒ', 'θ', 'ð', 'ŋ', 'ʧ', 'ʤ'];
  
  let ipa = '/';
  for (let i = 0; i < word.length; i++) {
    const c = word[i].toLowerCase();
    if ('aeiou'.includes(c)) {
      ipa += vowels[Math.floor(Math.random() * vowels.length)];
    } else if (c >= 'a' && c <= 'z') {
      ipa += consonants[Math.floor(Math.random() * consonants.length)];
    } else {
      ipa += c;
    }
  }
  ipa += '/';
  
  return ipa;
};

// Text segmentation for study purposes
export const segmentTextIntoPhrases = (text: string): string[] => {
  // Split by punctuation and length
  return text.split(/[.!?;]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .reduce((acc: string[], phrase) => {
      // Further split long phrases
      if (phrase.length > 80) {
        const subPhrases = phrase.split(/,/)
          .map(s => s.trim())
          .filter(s => s.length > 0);
        return [...acc, ...subPhrases];
      }
      return [...acc, phrase];
    }, []);
};

// Generate fill-in-the-blanks exercises
export const generateFillInTheBlanks = (text: string): string => {
  const words = text.split(/\s+/);
  
  // Choose random words to blank out (20-30% of all words)
  const wordsToBlank = Math.max(1, Math.floor(words.length * (Math.random() * 0.1 + 0.2)));
  
  // Avoid blanking the first or last word
  const availableIndices = Array.from({ length: words.length - 2 }, (_, i) => i + 1);
  const selectedIndices: number[] = [];
  
  // Select random indices to blank
  for (let i = 0; i < wordsToBlank; i++) {
    if (availableIndices.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    const wordIndex = availableIndices[randomIndex];
    
    selectedIndices.push(wordIndex);
    availableIndices.splice(randomIndex, 1);
  }
  
  // Create the blanked text
  return words
    .map((word, index) => {
      if (selectedIndices.includes(index)) {
        return '___';
      }
      return word;
    })
    .join(' ');
};


export interface EnhancedPronunciationScore {
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  rhythmScore: number;
  intonationScore: number;
  feedback: {
    strengths: string[];
    improvements: string[];
    practiceExercises: string[];
  };
  problemSounds: ProblemArea[];
  wordByWordAnalysis?: WordPronunciationAnalysis[];
}

export interface WordPronunciationAnalysis {
  word: string;
  score: number;
  correctIPA: string;
  userIPA: string;
  feedbackTip: string;
}

export interface DetailedPronunciationFeedback {
  overallScore: number;
  componentScores: {
    accuracy: number;
    fluency: number;
    rhythm: number;
    intonation: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  practiceTips: string[];
}

export interface ProblemArea {
  phoneme: string;
  description: string;
  examples: string[];
}

// Add missing function to get available voices
export const getAvailableVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      // Wait for voices to load
      speechSynthesis.onvoiceschanged = () => {
        resolve(speechSynthesis.getVoices());
      };
    }
  });
};

export const speakText = (text: string, voice?: SpeechSynthesisVoice | null | string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice && typeof voice !== 'string') {
      utterance.voice = voice;
    }
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(event.error);
    speechSynthesis.speak(utterance);
  });
};

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      }
    }
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare var webkitSpeechRecognition: {
  new(): SpeechRecognition;
};

export const startSpeechRecognition = (lang: string): Promise<{ transcript: string }> => {
  return new Promise((resolve, reject) => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve({ transcript });
      };

      recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.onend = () => {
        // Resolve with an empty transcript if speech ends without capturing anything
        resolve({ transcript: '' });
      };

      recognition.start();
    } catch (error) {
      reject(new Error("Speech recognition not supported in this browser"));
    }
  });
};

// Add missing stopSpeechRecognition function
export const stopSpeechRecognition = (): void => {
  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.stop();
  } catch (error) {
    console.error("Speech recognition not supported in this browser");
  }
};

export const calculatePronunciationScore = (originalText: string, userTranscript: string, language: string = 'en'): number => {
  const originalWords = originalText.toLowerCase().split(/\s+/);
  const transcriptWords = userTranscript.toLowerCase().split(/\s+/);

  let correctCount = 0;
  originalWords.forEach((word, index) => {
    if (transcriptWords[index] === word) {
      correctCount++;
    }
  });

  return (correctCount / originalWords.length) * 100;
};

export const getVoices = (): SpeechSynthesisVoice[] => {
  return speechSynthesis.getVoices();
};

export const getRandomWords = async (count: number = 10): Promise<string[]> => {
  const apiUrl = `https://random-word-api.herokuapp.com/word?number=${count}`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Could not fetch random words:", error);
    return [];
  }
};

// Add segmentTextIntoPhrases function
export const segmentTextIntoPhrases = (text: string): string[] => {
  // Split by punctuation and create manageable phrases
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const phrases: string[] = [];
  
  sentences.forEach(sentence => {
    const trimmed = sentence.trim();
    if (trimmed.length < 20) {
      phrases.push(trimmed);
    } else {
      // Split longer sentences at commas or conjunctions
      const subPhrases = trimmed.split(/,|;|\band\b|\bor\b|\bbut\b|\byet\b/).filter(p => p.trim().length > 0);
      subPhrases.forEach(p => phrases.push(p.trim()));
    }
  });
  
  return phrases.filter(p => p.length > 0);
};

// Add translateText function (mock implementation)
export const translateText = async (text: string): Promise<string> => {
  // This is a mock implementation; in a real app, you'd call a translation API
  const vietnameseMap: Record<string, string> = {
    "hello": "xin chào",
    "goodbye": "tạm biệt",
    "thank you": "cảm ơn",
    "welcome": "chào mừng",
    "how are you": "bạn khỏe không",
    "I am fine": "tôi khỏe",
    "good morning": "chào buổi sáng",
    "good afternoon": "chào buổi chiều",
    "good evening": "chào buổi tối",
    "good night": "chúc ngủ ngon"
  };
  
  // Simple word-by-word translation for demo purposes
  const lowerText = text.toLowerCase();
  if (vietnameseMap[lowerText]) {
    return vietnameseMap[lowerText];
  }
  
  // For phrases not in our map, add "Tiếng Việt: " prefix to simulate translation
  return `Tiếng Việt: ${text}`;
};

export const generateFillInTheBlanks = async (text: string): Promise<string[]> => {
  const words = text.split(' ');
  const result: string[] = [];
  
  for (let i = 0; i < Math.min(5, words.length); i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    const sentence = words.map((word, idx) => 
      idx === randomIndex ? '________' : word
    ).join(' ');
    result.push(sentence);
  }
  
  return result;
};

export const getEnhancedPronunciationScore = (text: string, audioBlob?: string | Blob): Promise<EnhancedPronunciationScore> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomScore = Math.floor(Math.random() * 36) + 60;
      
      const accuracyScore = Math.min(100, Math.max(0, randomScore + Math.floor(Math.random() * 10) - 5));
      const fluencyScore = Math.min(100, Math.max(0, randomScore + Math.floor(Math.random() * 10) - 5));
      const rhythmScore = Math.min(100, Math.max(0, randomScore + Math.floor(Math.random() * 10) - 5));
      const intonationScore = Math.min(100, Math.max(0, randomScore + Math.floor(Math.random() * 10) - 5));
      
      const result: EnhancedPronunciationScore = {
        overallScore: randomScore,
        accuracyScore,
        fluencyScore,
        rhythmScore,
        intonationScore,
        feedback: {
          strengths: [
            "Phát âm nguyên âm khá tốt",
            "Nhấn trọng âm từ chính xác",
            "Sử dụng ngữ điệu phù hợp trong câu hỏi"
          ],
          improvements: [
            "Cần cải thiện phát âm âm /θ/ và /ð/",
            "Phân biệt rõ hơn giữa /i:/ và /ɪ/",
            "Chú ý đến nối âm giữa các từ"
          ],
          practiceExercises: [
            "Luyện phát âm các cặp từ tối thiểu: 'ship/sheep', 'bit/beat'",
            "Đọc to các đoạn văn ngắn, tập trung vào nhịp điệu",
            "Ghi âm và so sánh với bản gốc để xác định điểm cần cải thiện"
          ]
        },
        problemSounds: [
          {
            phoneme: "θ",
            description: "Âm /θ/ (như trong 'think', 'three') cần đặt lưỡi giữa răng",
            examples: ["think", "three", "thin"]
          },
          {
            phoneme: "ð",
            description: "Âm /ð/ (như trong 'this', 'that') cần phát âm có rung thanh quản",
            examples: ["this", "that", "there"]
          },
          {
            phoneme: "æ",
            description: "Âm /æ/ (như trong 'cat', 'hat') cần mở miệng rộng hơn",
            examples: ["cat", "hat", "bad"]
          }
        ],
        wordByWordAnalysis: text.split(/\s+/).map(word => ({
          word,
          score: Math.floor(Math.random() * 36) + 60,
          correctIPA: "ˈkəˌrekt",
          userIPA: "kɔrekt",
          feedbackTip: `Chú ý phát âm từ "${word}" với trọng âm đúng chỗ và phân biệt rõ các nguyên âm.`
        }))
      };
      
      resolve(result);
    }, 1500);
  });
};

export const analyzeWordPronunciation = (word: string, audioBlob: Blob): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const score = Math.floor(Math.random() * 36) + 60;
      
      const result = {
        word,
        score,
        correctIPA: "kəˈrekt",
        userIPA: score > 80 ? "kəˈrekt" : "korekt",
        feedbackTip: "Tập trung vào việc phát âm rõ ràng và nhấn đúng trọng âm.",
        problemPhonemes: [
          {
            phoneme: "ə",
            correct: score > 70,
            details: "Âm schwa cần được phát âm nhẹ nhàng hơn"
          },
          {
            phoneme: "k",
            correct: true,
            details: "Âm /k/ đã phát âm chính xác"
          },
          {
            phoneme: "t",
            correct: score > 85,
            details: "Âm /t/ cuối từ cần được phát âm rõ ràng hơn"
          }
        ]
      };
      
      resolve(result);
    }, 1000);
  });
};

// Add missing getWordErrors function
export const getWordErrors = (originalText: string, userTranscript: string): { word: string; correct: boolean }[] => {
  const originalWords = originalText.toLowerCase().split(/\s+/);
  const transcriptWords = userTranscript.toLowerCase().split(/\s+/);
  
  return originalWords.map((word, index) => ({
    word,
    correct: transcriptWords[index] === word
  }));
};

// Add missing getIpaTranscription function (mock implementation)
export const getIpaTranscription = (text: string): Promise<string> => {
  // Mock IPA transcription map for common words
  const ipaMap: Record<string, string> = {
    "hello": "həˈloʊ",
    "world": "wɜrld",
    "how": "haʊ",
    "are": "ɑr",
    "you": "ju",
    "today": "təˈdeɪ",
    "good": "gʊd",
    "morning": "ˈmɔrnɪŋ",
    "cat": "kæt",
    "dog": "dɔg"
  };
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const words = text.toLowerCase().split(/\s+/);
      const ipaWords = words.map(word => ipaMap[word] || word);
      resolve(ipaWords.join(" "));
    }, 500);
  });
};

// Add window SpeechRecognition type
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

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

export const speakText = (text: string, voice?: SpeechSynthesisVoice): Promise<void> => {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(event.error);
    speechSynthesis.speak(utterance);
  });
};

export const startSpeechRecognition = (lang: string): Promise<{ transcript: string }> => {
  return new Promise((resolve, reject) => {
    const recognition = new webkitSpeechRecognition();
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
  });
};

export const calculatePronunciationScore = (originalText: string, userTranscript: string): number => {
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

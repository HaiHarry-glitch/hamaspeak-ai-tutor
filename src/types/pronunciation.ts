
export interface PronunciationScore {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  pronScore: number;
}

export interface WordScore {
  word: string;
  accuracyScore: number;
  errorType: string;
  offset: number;
  duration: number;
  syllables?: Array<{
    syllable: string;
    accuracyScore: number;
    offset: number;
    duration: number;
  }>;
  phonemes?: Array<{
    phoneme: string;
    accuracyScore: number;
    offset: number;
    duration: number;
  }>;
}

export interface PronunciationResult {
  text: string;
  overallScore: PronunciationScore;
  words: WordScore[];
  json: string;
}

// Used by PronunciationFeedback component
export interface ScoreDetails {
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  pronScore: number;
  intonationScore?: number;
  stressScore?: number;
  rhythmScore?: number;
  missedWords?: string[]; // Added missing properties
  mispronunciations?: string[]; // Added missing properties
  wordErrorRate?: number;
}

export interface WordFeedback {
  word: string;
  ipa: string;
  correct: boolean;
  suggestedIpa?: string;
  videoTutorialUrl?: string;
}

// Create a type that specifies props for components that use pronunciation analysis
export interface PronunciationAnalysisProps {
  onAnalyzePronunciation?: (text: string, audioBlob?: Blob) => Promise<PronunciationResult>;
}

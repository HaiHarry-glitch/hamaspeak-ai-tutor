import { AudioFeatureExtractor, AudioFeatures } from '../audioProcessing/features';
import { ForcedAlignmentService, AlignmentResult } from '../forcedAlignment/index';

export interface PronunciationScore {
  // Overall score (0-100)
  overallScore: number;
  // Detailed scores by category
  fluencyScore: number;
  accuracyScore: number;
  prosodyScore: number;
  // Word-level scores
  wordScores: {
    word: string;
    score: number;
    startTime: number;
    endTime: number;
    phonemeScores?: Array<{
      phoneme: string;
      score: number;
    }>;
  }[];
  // Feedback for improvement
  feedback: string[];
}

export class PronunciationScorer {
  private audioFeatureExtractor: AudioFeatureExtractor;
  private forcedAlignmentService: ForcedAlignmentService;
  
  constructor() {
    this.audioFeatureExtractor = new AudioFeatureExtractor();
    this.forcedAlignmentService = new ForcedAlignmentService();
    console.log('PronunciationScorer initialized');
  }
  
  /**
   * Score the pronunciation of audio against expected text
   * @param audioBuffer - Raw audio buffer data
   * @param expectedText - The text that should be spoken
   * @returns PronunciationScore with detailed scoring information
   */
  public async scoreAudio(audioBuffer: ArrayBuffer, expectedText: string): Promise<PronunciationScore> {
    console.log(`Scoring pronunciation for text: "${expectedText}"`);
    
    try {
      // Step 1: Extract audio features
      const audioFeatures = await this.audioFeatureExtractor.extractFeatures(audioBuffer);
      
      // Step 2: Align audio with text
      const alignment = this.forcedAlignmentService.align(audioFeatures, expectedText);
      
      // Step 3: Score the pronunciation
      return this.generateScore(audioFeatures, alignment, expectedText);
    } catch (error) {
      console.error('Error scoring pronunciation:', error);
      throw new Error(`Failed to score pronunciation: ${error.message}`);
    }
  }
  
  /**
   * Generate a pronunciation score based on audio features and alignment
   * @param audioFeatures - Extracted audio features
   * @param alignment - Alignment between audio and text
   * @param expectedText - The expected text
   * @returns PronunciationScore with detailed scoring information
   */
  private generateScore(
    audioFeatures: AudioFeatures, 
    alignment: AlignmentResult, 
    expectedText: string
  ): PronunciationScore {
    // Generate word-level scores
    const wordScores = this.scoreWords(alignment, audioFeatures);
    
    // Calculate fluency score based on speech rate, pauses, and rhythm
    const fluencyScore = this.calculateFluencyScore(audioFeatures, alignment);
    
    // Calculate accuracy score based on word and phoneme match quality
    const accuracyScore = this.calculateAccuracyScore(alignment, wordScores);
    
    // Calculate prosody score based on intonation, stress, and rhythm
    const prosodyScore = this.calculateProsodyScore(audioFeatures, alignment);
    
    // Calculate overall score - weighted average of the component scores
    const overallScore = Math.round(
      (fluencyScore * 0.3) + (accuracyScore * 0.5) + (prosodyScore * 0.2)
    );
    
    // Generate feedback based on scores
    const feedback = this.generateFeedback(
      fluencyScore, 
      accuracyScore, 
      prosodyScore, 
      wordScores, 
      expectedText
    );
    
    return {
      overallScore,
      fluencyScore: Math.round(fluencyScore),
      accuracyScore: Math.round(accuracyScore),
      prosodyScore: Math.round(prosodyScore),
      wordScores,
      feedback
    };
  }
  
  /**
   * Score individual words based on alignment and audio features
   * @param alignment - Alignment between audio and text
   * @param audioFeatures - Extracted audio features
   * @returns Array of word scores
   */
  private scoreWords(
    alignment: AlignmentResult, 
    audioFeatures: AudioFeatures
  ): PronunciationScore['wordScores'] {
    // Simple word scoring based on confidence from alignment
    return alignment.wordTimings.map(wordTiming => {
      // Convert alignment confidence (0-1) to score (0-100)
      const baseScore = wordTiming.confidence * 100;
      
      // Adjust score based on word duration and other factors
      const wordDuration = wordTiming.endTime - wordTiming.startTime;
      const durationFactor = this.scoreDuration(wordDuration, wordTiming.word);
      
      // Combine factors for final word score
      const score = Math.min(100, Math.max(0, 
        baseScore * 0.7 + durationFactor * 30
      ));
      
      return {
        word: wordTiming.word,
        score: Math.round(score),
        startTime: wordTiming.startTime,
        endTime: wordTiming.endTime
      };
    });
  }
  
  /**
   * Score word duration against expected duration
   * @param duration - Actual duration of the word
   * @param word - The word being scored
   * @returns Score factor for duration (0-1)
   */
  private scoreDuration(duration: number, word: string): number {
    // Expected duration based on word length (very simple approximation)
    const expectedDuration = 0.15 + word.length * 0.05; // ~150ms base + 50ms per character
    const ratio = duration / expectedDuration;
    
    // Score based on how close the duration is to expected
    // Penalize more for being too fast than too slow
    if (ratio < 1) {
      // Too fast
      return Math.max(0, ratio);
    } else {
      // Too slow - more forgiving
      return Math.max(0, 1 - (ratio - 1) * 0.5);
    }
  }
  
  /**
   * Calculate fluency score based on speech rate, pauses, and rhythm
   * @param audioFeatures - Extracted audio features
   * @param alignment - Alignment between audio and text
   * @returns Fluency score (0-100)
   */
  private calculateFluencyScore(
    audioFeatures: AudioFeatures, 
    alignment: AlignmentResult
  ): number {
    // Words per minute - target is around 120-150 WPM for practice
    const wordCount = alignment.wordTimings.length;
    const speechDuration = audioFeatures.duration;
    const wpm = (wordCount / speechDuration) * 60;
    
    // Score speech rate - best between 110-160 WPM, penalty for too slow or fast
    let speechRateScore = 0;
    if (wpm < 70) {
      speechRateScore = wpm / 70 * 70; // Linear scaling up to 70 WPM
    } else if (wpm < 110) {
      speechRateScore = 70 + (wpm - 70) / 40 * 20; // 70-90 points for 70-110 WPM
    } else if (wpm <= 160) {
      speechRateScore = 90 + (1 - Math.abs(135 - wpm) / 25) * 10; // 90-100 points for 110-160 WPM, peak at 135
    } else if (wpm <= 200) {
      speechRateScore = 90 - (wpm - 160) / 40 * 20; // 70-90 points for 160-200 WPM
    } else {
      speechRateScore = Math.max(0, 70 - (wpm - 200) / 30 * 70); // 0-70 points above 200 WPM
    }
    
    // Combine with other fluency factors (simplified for demo)
    return speechRateScore;
  }
  
  /**
   * Calculate accuracy score based on word and phoneme alignment quality
   * @param alignment - Alignment between audio and text
   * @param wordScores - Scores for individual words
   * @returns Accuracy score (0-100)
   */
  private calculateAccuracyScore(
    alignment: AlignmentResult, 
    wordScores: PronunciationScore['wordScores']
  ): number {
    // Average of word scores, weighted by confidence
    const totalConfidence = alignment.wordTimings.reduce(
      (sum, word) => sum + word.confidence, 0
    );
    
    const weightedScore = alignment.wordTimings.reduce(
      (sum, word, index) => {
        const score = wordScores[index].score;
        return sum + (score * word.confidence);
      }, 0
    );
    
    return totalConfidence > 0 
      ? weightedScore / totalConfidence
      : 60; // Fallback if no confidence data
  }
  
  /**
   * Calculate prosody score based on intonation, stress, and rhythm
   * @param audioFeatures - Extracted audio features
   * @param alignment - Alignment between audio and text
   * @returns Prosody score (0-100)
   */
  private calculateProsodyScore(
    audioFeatures: AudioFeatures, 
    alignment: AlignmentResult
  ): number {
    // This would analyze pitch variation, stress patterns, and rhythm
    // For this demo, we'll use a simplified approach based on RMS energy variation
    
    // Calculate variation in RMS energy as a simple proxy for prosody
    if (!audioFeatures.rms || audioFeatures.rms.length < 2) {
      return 75; // Default score if not enough data
    }
    
    // Calculate mean and standard deviation of RMS energy
    const mean = audioFeatures.rms.reduce((sum, val) => sum + val, 0) / audioFeatures.rms.length;
    const variance = audioFeatures.rms.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / audioFeatures.rms.length;
    const stdDev = Math.sqrt(variance);
    
    // Coefficient of variation (normalized standard deviation)
    const cv = mean > 0 ? stdDev / mean : 0;
    
    // Score based on coefficient of variation
    // Target CV is around 0.2-0.4 for natural speech
    let variationScore = 0;
    if (cv < 0.1) {
      // Too monotone
      variationScore = cv / 0.1 * 60;
    } else if (cv < 0.2) {
      // Somewhat monotone
      variationScore = 60 + (cv - 0.1) / 0.1 * 20;
    } else if (cv <= 0.4) {
      // Good variation
      variationScore = 80 + (1 - Math.abs(0.3 - cv) / 0.1) * 20;
    } else if (cv <= 0.6) {
      // Somewhat exaggerated
      variationScore = 80 - (cv - 0.4) / 0.2 * 20;
    } else {
      // Too much variation
      variationScore = Math.max(0, 60 - (cv - 0.6) / 0.4 * 60);
    }
    
    return variationScore;
  }
  
  /**
   * Generate feedback based on scores
   * @param fluencyScore - Fluency score (0-100)
   * @param accuracyScore - Accuracy score (0-100)
   * @param prosodyScore - Prosody score (0-100)
   * @param wordScores - Scores for individual words
   * @param text - The expected text
   * @returns Array of feedback strings
   */
  private generateFeedback(
    fluencyScore: number, 
    accuracyScore: number, 
    prosodyScore: number, 
    wordScores: PronunciationScore['wordScores'],
    text: string
  ): string[] {
    const feedback: string[] = [];
    
    // Add overall encouragement
    if (accuracyScore > 85 && fluencyScore > 85 && prosodyScore > 85) {
      feedback.push("Excellent pronunciation! Your speech is clear and natural.");
    } else if (accuracyScore > 70 && fluencyScore > 70 && prosodyScore > 70) {
      feedback.push("Good job! Your pronunciation is quite good.");
    } else {
      feedback.push("Keep practicing! You're making progress.");
    }
    
    // Add specific feedback based on scores
    if (accuracyScore < 70) {
      feedback.push("Focus on pronouncing each word clearly and correctly.");
      
      // Find the lowest-scoring words (up to 3)
      const lowestWords = [...wordScores]
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
        .filter(word => word.score < 70);
      
      if (lowestWords.length > 0) {
        feedback.push(`Pay special attention to: ${lowestWords.map(w => w.word).join(', ')}`);
      }
    }
    
    if (fluencyScore < 70) {
      feedback.push("Work on your speaking speed and rhythm. Try to speak at a more natural pace.");
    }
    
    if (prosodyScore < 70) {
      feedback.push("Try to vary your intonation more to sound more natural. Emphasize important words and phrases.");
    }
    
    return feedback;
  }
} 
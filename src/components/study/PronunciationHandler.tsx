
import { useState } from 'react';
import { getWordErrors, getIpaTranscription, startSpeechRecognition } from '@/utils/speechUtils';
import { useToast } from '@/hooks/use-toast';

export interface PronunciationResult {
  transcript: string;
  scoreDetails: {
    overallScore: number;
    accuracyScore: number;
    fluencyScore: number;
    intonationScore: number;
    stressScore: number;
    rhythmScore: number;
    wordErrorRate: number;
  };
  errorWords: {
    word: string;
    ipa: string;
  }[];
}

export const usePronunciationHandler = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const analyzePronunciation = async (
    referenceText: string,
    onResult?: (result: PronunciationResult) => void
  ): Promise<PronunciationResult | null> => {
    if (isProcessing) return null;
    
    setIsProcessing(true);
    
    try {
      // Start speech recognition
      const result = await startSpeechRecognition('en-US');
      
      // Convert the detailed scoring to a simple numeric score for display
      const overallScore = Math.round(70 + Math.random() * 25); // Simulated score between 70-95
      
      // Generate more detailed scores based on the overall score
      const scoreDetails = {
        overallScore,
        accuracyScore: Math.min(100, Math.round(overallScore * (0.85 + Math.random() * 0.3))),
        fluencyScore: Math.min(100, Math.round(overallScore * (0.9 + Math.random() * 0.2))),
        intonationScore: Math.min(100, Math.round(overallScore * (0.8 + Math.random() * 0.4))),
        stressScore: Math.min(100, Math.round(overallScore * (0.85 + Math.random() * 0.3))),
        rhythmScore: Math.min(100, Math.round(overallScore * (0.9 + Math.random() * 0.2))),
        wordErrorRate: Math.max(0, Math.min(100, 30 - Math.round(overallScore * 0.25)))
      };
      
      // Get mispronounced words
      const errorWords: {word: string; ipa: string}[] = [];
      if (overallScore < 90) {
        const errorWordsList = getWordErrors(referenceText, result.transcript);
        // Fetch IPA for each error word
        for (const word of errorWordsList) {
          const ipa = await getIpaTranscription(word);
          errorWords.push({ word, ipa });
        }
      }
      
      const pronunciationResult = {
        transcript: result.transcript,
        scoreDetails,
        errorWords
      };
      
      // Call the callback if provided
      if (onResult) {
        onResult(pronunciationResult);
      }
      
      return pronunciationResult;
    } catch (error) {
      console.error('Speech recognition error:', error);
      toast({
        title: 'Lỗi nhận diện giọng nói',
        description: 'Không thể nhận diện giọng nói. Vui lòng thử lại.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    isProcessing,
    analyzePronunciation
  };
};

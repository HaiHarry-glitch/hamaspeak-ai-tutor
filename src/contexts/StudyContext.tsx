import React, { createContext, useState, useContext, ReactNode } from 'react';
import { TextAnalysisResult, analyzeText } from '@/services/textAnalyzer';

export interface FlashcardState {
  currentIndex: number;
  isFlipped: boolean;
}

interface StudyContextType {
  currentText: string;
  setCurrentText: (text: string) => void;
  analysisResult: TextAnalysisResult | null;
  isAnalyzing: boolean;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  flashcardState: FlashcardState;
  setFlashcardState: React.Dispatch<React.SetStateAction<FlashcardState>>;
  analyzeUserText: (text: string) => Promise<void>;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

interface StudyProviderProps {
  children: ReactNode;
}

export const StudyProvider = ({ children }: StudyProviderProps) => {
  const [currentText, setCurrentText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<TextAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [flashcardState, setFlashcardState] = useState<FlashcardState>({
    currentIndex: 0,
    isFlipped: false
  });

  const analyzeUserText = async (text: string) => {
    try {
      setIsAnalyzing(true);
      const result = await analyzeText(text);
      setAnalysisResult(result);
      
      if (result.collocations && result.collocations.length > 0) {
        setCurrentStep(0.5);
      } else {
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Failed to analyze text:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const value = {
    currentText,
    setCurrentText,
    analysisResult,
    isAnalyzing,
    currentStep,
    setCurrentStep,
    selectedVoice,
    setSelectedVoice,
    flashcardState,
    setFlashcardState,
    analyzeUserText,
  };

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};

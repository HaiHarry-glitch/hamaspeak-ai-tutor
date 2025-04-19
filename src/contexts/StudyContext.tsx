
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the enum for topic groups
export enum TopicGroup {
  PART1 = 'part1',
  PART2_3 = 'part2_3',
  CUSTOM = 'custom'
}

// Define the types for the analysis result
export interface AnalysisResult {
  originalText: string;
  phrases: Array<{
    english: string;
    vietnamese: string;
    fillInBlanks: string;
  }>;
  collocations?: string[];
  topics?: string[];
  sentences?: string[]; // Add sentences property
}

// Define the flashcard state type
export interface FlashcardState {
  currentIndex: number;
  isFlipped: boolean;
}

// Define the type for the context
interface StudyContextType {
  currentStep: number;
  isAnalyzing: boolean;
  selectedVoice: string;
  selectedTopicGroup: string;
  isAuthModalOpen: boolean;
  analysisResult: AnalysisResult | null;
  currentText: string;
  flashcardState: FlashcardState; // Added this property
  setCurrentStep: (step: number) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setSelectedVoice: (voice: string) => void;
  setSelectedTopicGroup: (group: string) => void;
  setIsAuthModalOpen: (isOpen: boolean) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setCurrentText: (text: string) => void;
  setFlashcardState: (state: FlashcardState) => void; // Added this function
  analyzeUserText: (text: string) => Promise<void>; // Added this function
}

// Create the context with a default value
export const StudyContext = createContext<StudyContextType>({
  currentStep: 0,
  isAnalyzing: false,
  selectedVoice: 'en-US-JennyNeural',
  selectedTopicGroup: 'part1',
  isAuthModalOpen: false,
  analysisResult: null,
  currentText: '',
  flashcardState: { currentIndex: 0, isFlipped: false },
  setCurrentStep: () => {},
  setIsAnalyzing: () => {},
  setSelectedVoice: () => {},
  setSelectedTopicGroup: () => {},
  setIsAuthModalOpen: () => {},
  setAnalysisResult: () => {},
  setCurrentText: () => {},
  setFlashcardState: () => {},
  analyzeUserText: async () => {}
});

// Create the provider component
export const StudyProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('en-US-JennyNeural');
  const [selectedTopicGroup, setSelectedTopicGroup] = useState(TopicGroup.PART1);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentText, setCurrentText] = useState<string>('');
  const [flashcardState, setFlashcardState] = useState<FlashcardState>({ 
    currentIndex: 0, 
    isFlipped: false 
  });

  // Add analyzeUserText function
  const analyzeUserText = async (text: string) => {
    try {
      setIsAnalyzing(true);
      // Mock analysis for now, would typically call an API
      const sampleResult: AnalysisResult = {
        originalText: text,
        phrases: text.split('. ').map(phrase => ({
          english: phrase,
          vietnamese: `[Vietnamese translation of: ${phrase}]`,
          fillInBlanks: phrase.replace(/\b\w+\b/g, (match, index) => 
            index > phrase.length / 3 && Math.random() > 0.7 ? '___' : match
          )
        })),
        collocations: text.split(' ')
          .filter((_, i) => i % 3 === 0)
          .map((word, i) => `${word} ${text.split(' ')[i*3+1] || 'important'}`),
        topics: ['education', 'technology', 'environment']
      };
      
      // Wait a bit to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAnalysisResult(sampleResult);
      setCurrentStep(0.5); // Move to collocation view
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <StudyContext.Provider
      value={{
        currentStep,
        isAnalyzing,
        selectedVoice,
        selectedTopicGroup,
        isAuthModalOpen,
        analysisResult,
        currentText,
        flashcardState,
        setCurrentStep,
        setIsAnalyzing,
        setSelectedVoice,
        setSelectedTopicGroup,
        setIsAuthModalOpen,
        setAnalysisResult,
        setCurrentText,
        setFlashcardState,
        analyzeUserText
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

// Create a custom hook to use the context
export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};

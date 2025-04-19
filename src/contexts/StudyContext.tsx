
import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

// Define the type for the context
interface StudyContextType {
  currentStep: number;
  isAnalyzing: boolean;
  selectedVoice: string;
  selectedTopicGroup: string;
  isAuthModalOpen: boolean;
  analysisResult: AnalysisResult | null;
  currentText: string; // Added this property to fix PronunciationAnalyzer
  setCurrentStep: (step: number) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setSelectedVoice: (voice: string) => void;
  setSelectedTopicGroup: (group: string) => void;
  setIsAuthModalOpen: (isOpen: boolean) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setCurrentText: (text: string) => void; // Added this function to fix PronunciationAnalyzer
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
  setCurrentStep: () => {},
  setIsAnalyzing: () => {},
  setSelectedVoice: () => {},
  setSelectedTopicGroup: () => {},
  setIsAuthModalOpen: () => {},
  setAnalysisResult: () => {},
  setCurrentText: () => {}
});

// Create the provider component
export const StudyProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('en-US-JennyNeural');
  const [selectedTopicGroup, setSelectedTopicGroup] = useState('part1');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentText, setCurrentText] = useState<string>('');

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
        setCurrentStep,
        setIsAnalyzing,
        setSelectedVoice,
        setSelectedTopicGroup,
        setIsAuthModalOpen,
        setAnalysisResult,
        setCurrentText
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


import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { TextAnalysisResult, analyzeText } from '@/services/textAnalyzer';
import { useToast } from '@/hooks/use-toast';
import { getAvailableVoices } from '@/utils/speechUtils';

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
  currentQuestion: string;
  setCurrentQuestion: (question: string) => void;
  practiceNotes: string;
  setPracticeNotes: (notes: string) => void;
  availableVoices: SpeechSynthesisVoice[];
  isLoadingVoices: boolean;
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
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [practiceNotes, setPracticeNotes] = useState('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const { toast } = useToast();
  
  const [flashcardState, setFlashcardState] = useState<FlashcardState>({
    currentIndex: 0,
    isFlipped: false
  });

  // Load available voices when the component mounts
  useEffect(() => {
    const loadVoices = async () => {
      try {
        setIsLoadingVoices(true);
        const voices = await getAvailableVoices();
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
        setAvailableVoices(englishVoices);
        
        // Set a default voice if available
        if (englishVoices.length > 0 && !selectedVoice) {
          setSelectedVoice(englishVoices[0].name);
        }
      } catch (error) {
        console.error('Error loading voices:', error);
      } finally {
        setIsLoadingVoices(false);
      }
    };
    
    loadVoices();
    
    // Add event listener for voiceschanged event
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Cleanup
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const analyzeUserText = async (text: string) => {
    if (!text.trim()) {
      toast({
        title: "Thiếu nội dung",
        description: "Vui lòng nhập hoặc chọn văn bản để phân tích",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsAnalyzing(true);
      toast({
        title: "Đang phân tích văn bản",
        description: "Hệ thống đang xử lý nội dung của bạn...",
      });
      
      // Set a timeout to handle long analysis times
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Analysis timeout")), 30000);
      });
      
      const analysisPromise = analyzeText(text);
      
      // Race between analysis and timeout
      const result = await Promise.race([analysisPromise, timeoutPromise]) as TextAnalysisResult;
      
      setAnalysisResult(result);
      setCurrentStep(1); // Move to the first step after analysis
      
      toast({
        title: "Phân tích hoàn tất",
        description: "Bắt đầu luyện tập ngay bây giờ!",
        variant: "default"
      });
    } catch (error) {
      console.error('Failed to analyze text:', error);
      toast({
        title: "Lỗi phân tích",
        description: "Không thể phân tích văn bản. Vui lòng thử lại sau.",
        variant: "destructive"
      });
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
    currentQuestion,
    setCurrentQuestion,
    practiceNotes,
    setPracticeNotes,
    availableVoices,
    isLoadingVoices,
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

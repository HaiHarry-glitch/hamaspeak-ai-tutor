
import React, { useState } from 'react';
import { StudyProvider, useStudy } from '@/contexts/StudyContext';
import TextInput from '@/components/study/TextInput';
import Step1Listening from '@/components/study/Step1Listening';
import Step2Flashcards from '@/components/study/Step2Flashcards';
import Step3EnglishSpeaking from '@/components/study/Step3EnglishSpeaking';
import Step4VietnameseSpeaking from '@/components/study/Step4VietnameseSpeaking';
import Step5FillBlanks from '@/components/study/Step5FillBlanks';
import Step6ListeningComprehension from '@/components/study/Step6ListeningComprehension';
import Step7ParagraphSpeaking from '@/components/study/Step7ParagraphSpeaking';
import Step8CompleteSpeaking from '@/components/study/Step8CompleteSpeaking';
import VoiceSelector from '@/components/study/VoiceSelector';
import StudyProgress from '@/components/study/StudyProgress';
import AnalyzingProgress from '@/components/study/AnalyzingProgress';
import PronunciationFeedbackModal from '@/components/study/PronunciationFeedbackModal';
import WordPronunciationPractice from '@/components/study/WordPronunciationPractice';
import Header from '@/components/Header';
import { getEnhancedPronunciationScore, EnhancedPronunciationScore } from '@/utils/speechUtils';
import { Loader2 } from 'lucide-react';

// Define prop interfaces to fix type errors
interface StepProps {
  onAnalyzePronunciation: (text: string, audioBlob?: string | Blob) => Promise<void>;
}

// Declare component types to satisfy TypeScript
declare module '@/components/study/Step1Listening' {
  export default function Step1Listening(props: StepProps): JSX.Element;
}
declare module '@/components/study/Step2Flashcards' {
  export default function Step2Flashcards(props: StepProps): JSX.Element;
}
declare module '@/components/study/Step3EnglishSpeaking' {
  export default function Step3EnglishSpeaking(props: StepProps): JSX.Element;
}
declare module '@/components/study/Step4VietnameseSpeaking' {
  export default function Step4VietnameseSpeaking(props: StepProps): JSX.Element;
}
declare module '@/components/study/Step5FillBlanks' {
  export default function Step5FillBlanks(props: StepProps): JSX.Element;
}
declare module '@/components/study/Step6ListeningComprehension' {
  export default function Step6ListeningComprehension(props: StepProps): JSX.Element;
}
declare module '@/components/study/Step7ParagraphSpeaking' {
  export default function Step7ParagraphSpeaking(props: StepProps): JSX.Element;
}
declare module '@/components/study/Step8CompleteSpeaking' {
  export default function Step8CompleteSpeaking(props: StepProps): JSX.Element;
}

const StudyContent = () => {
  const { currentStep, isAnalyzing, analysisResult, selectedVoice } = useStudy();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [scoreData, setScoreData] = useState<EnhancedPronunciationScore | undefined>(undefined);
  const [isAnalyzingPronunciation, setIsAnalyzingPronunciation] = useState(false);
  const [practiceWord, setPracticeWord] = useState('');
  const [showWordPractice, setShowWordPractice] = useState(false);

  // Function to analyze pronunciation and show feedback modal
  const analyzePronunciation = async (text: string, audioBlob: string | Blob = '') => {
    setIsAnalyzingPronunciation(true);
    try {
      // This would normally send the audio to a server for analysis
      const result = await getEnhancedPronunciationScore(text, audioBlob);
      setScoreData(result);
      setShowFeedbackModal(true);
    } catch (error) {
      console.error("Error analyzing pronunciation:", error);
    } finally {
      setIsAnalyzingPronunciation(false);
    }
  };
  
  // Function to handle practice word selection
  const handlePracticeWord = (word: string) => {
    if (!word) return;
    setPracticeWord(word);
    setShowFeedbackModal(false);
    setShowWordPractice(true);
  };

  return (
    <div className="min-h-screen pb-10">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gradient">
          Luyện nói tiếng Anh cùng Hamaspeak
        </h1>
        
        {isAnalyzing && <AnalyzingProgress isAnalyzing={isAnalyzing} />}
        
        {currentStep > 0 && !isAnalyzing && (
          <div className="max-w-4xl mx-auto mb-8">
            <StudyProgress />
          </div>
        )}
        
        <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center">
          <div>
            {isAnalyzingPronunciation && (
              <div className="flex items-center text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang phân tích phát âm...
              </div>
            )}
          </div>
          <VoiceSelector />
        </div>
        
        {currentStep === 0 && <TextInput />}
        
        {/* Input steps (1-4) */}
        {currentStep === 1 && <Step1Listening onAnalyzePronunciation={analyzePronunciation} />}
        {currentStep === 2 && <Step2Flashcards onAnalyzePronunciation={analyzePronunciation} />}
        {currentStep === 3 && <Step3EnglishSpeaking onAnalyzePronunciation={analyzePronunciation} />}
        {currentStep === 4 && <Step4VietnameseSpeaking onAnalyzePronunciation={analyzePronunciation} />}
        
        {/* Output steps (5-8) */}
        {currentStep === 5 && <Step5FillBlanks onAnalyzePronunciation={analyzePronunciation} />}
        {currentStep === 6 && <Step6ListeningComprehension onAnalyzePronunciation={analyzePronunciation} />}
        {currentStep === 7 && <Step7ParagraphSpeaking onAnalyzePronunciation={analyzePronunciation} />}
        {currentStep === 8 && <Step8CompleteSpeaking onAnalyzePronunciation={analyzePronunciation} />}
      
        {/* Pronunciation Feedback Modal */}
        <PronunciationFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          scoreData={scoreData}
          originalText={
            analysisResult?.originalText || 
            (currentStep >= 1 && currentStep <= 4 && analysisResult?.phrases.length ? 
              analysisResult.phrases[0].english : '')
          }
          onPracticeWord={handlePracticeWord}
        />
        
        {/* Word Practice Modal */}
        <WordPronunciationPractice
          isOpen={showWordPractice}
          onClose={() => setShowWordPractice(false)}
          word={practiceWord}
          selectedVoice={selectedVoice}
        />
      </div>
    </div>
  );
};

const Study = () => {
  return (
    <StudyProvider>
      <StudyContent />
    </StudyProvider>
  );
};

export default Study;

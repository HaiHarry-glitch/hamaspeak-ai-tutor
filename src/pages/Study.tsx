import React from 'react';
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
import Header from '@/components/Header';
import { Loader2 } from 'lucide-react';

const StudyContent = () => {
  const { currentStep, isAnalyzing } = useStudy();

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
        
        <div className="max-w-3xl mx-auto mb-6 flex justify-end">
          <VoiceSelector />
        </div>
        
        {currentStep === 0 && <TextInput />}
        
        {/* Input steps (1-4) */}
        {currentStep === 1 && <Step1Listening />}
        {currentStep === 2 && <Step2Flashcards />}
        {currentStep === 3 && <Step3EnglishSpeaking />}
        {currentStep === 4 && <Step4VietnameseSpeaking />}
        
        {/* Output steps (5-8) */}
        {currentStep === 5 && <Step5FillBlanks />}
        {currentStep === 6 && <Step6ListeningComprehension />}
        {currentStep === 7 && <Step7ParagraphSpeaking />}
        {currentStep === 8 && <Step8CompleteSpeaking />}
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

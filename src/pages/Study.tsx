
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
import Scene3D from '@/components/3d/Scene3D';
import { Loader2 } from 'lucide-react';

const StudyContent = () => {
  const { currentStep, isAnalyzing } = useStudy();

  return (
    <div className="min-h-screen pb-10 relative overflow-hidden">
      {/* 3D Background - floating particles */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <Scene3D className="h-full" brain={false} particles={true} height="100%" />
      </div>
      
      <div className="relative z-10">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 md:mb-0 text-gradient">
              Luyện nói tiếng Anh cùng Hamaspeak
            </h1>
            
            <div className="relative">
              <div className="absolute -z-10 inset-0 blur-2xl opacity-30">
                <Scene3D className="h-32 w-32" particles={false} />
              </div>
              <VoiceSelector />
            </div>
          </div>
          
          {isAnalyzing && <AnalyzingProgress isAnalyzing={isAnalyzing} />}
          
          {currentStep > 0 && !isAnalyzing && (
            <div className="max-w-4xl mx-auto mb-8">
              <StudyProgress />
            </div>
          )}
          
          <div className="relative max-w-3xl mx-auto glass-card p-8 shadow-xl">
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


import React from 'react';
import { StudyProvider, useStudy } from '@/contexts/StudyContext';
import TextInput from '@/components/study/TextInput';
import Step1Listening from '@/components/study/Step1Listening';
import Step2Speaking from '@/components/study/Step2Speaking';
import Step3FillBlanks from '@/components/study/Step3FillBlanks';
import Step4FullSpeaking from '@/components/study/Step4FullSpeaking';
import VoiceSelector from '@/components/study/VoiceSelector';
import StudyProgress from '@/components/study/StudyProgress';
import Header from '@/components/Header';

const StudyContent = () => {
  const { currentStep, isAnalyzing } = useStudy();

  return (
    <div className="min-h-screen pb-10">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gradient">
          Luyện nói tiếng Anh cùng Hamaspeak
        </h1>
        
        {currentStep > 0 && !isAnalyzing && (
          <div className="max-w-3xl mx-auto mb-8">
            <StudyProgress />
          </div>
        )}
        
        <div className="max-w-3xl mx-auto mb-6 flex justify-end">
          <VoiceSelector />
        </div>
        
        {currentStep === 0 && <TextInput />}
        {currentStep === 1 && <Step1Listening />}
        {currentStep === 2 && <Step2Speaking />}
        {currentStep === 3 && <Step3FillBlanks />}
        {currentStep === 4 && <Step4FullSpeaking />}
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


import React from 'react';
import { useStudy } from '@/contexts/StudyContext';
import Step1Listening from '@/components/study/Step1Listening';
import Step2Flashcards from '@/components/study/Step2Flashcards';
import Step3EnglishSpeaking from '@/components/study/Step3EnglishSpeaking';
import Step4VietnameseSpeaking from '@/components/study/Step4VietnameseSpeaking';
import Step5FillBlanks from '@/components/study/Step5FillBlanks';
import Step6ListeningComprehension from '@/components/study/Step6ListeningComprehension';
import Step7ParagraphSpeaking from '@/components/study/Step7ParagraphSpeaking';
import Step8CompleteSpeaking from '@/components/study/Step8CompleteSpeaking';
import AnalyzingProgress from '@/components/study/AnalyzingProgress';
import { Loader2 } from 'lucide-react';

interface PronunciationAnalysisResult {
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  intonationScore: number;
  stressScore: number;
  rhythmScore: number;
  recordedAt: string;
  mispronunciations?: string[];
}

interface StudyStepHandlerProps {
  onAnalyzePronunciation: (text: string, audioBlob?: Blob) => Promise<PronunciationAnalysisResult>;
}

const StudyStepHandler: React.FC<StudyStepHandlerProps> = ({ onAnalyzePronunciation }) => {
  const { currentStep, isAnalyzing, analysisResult } = useStudy();

  if (isAnalyzing) {
    return <AnalyzingProgress isAnalyzing={isAnalyzing} />;
  }

  // If we don't have analysis results yet and we're not analyzing, something went wrong
  if (!analysisResult && currentStep > 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Return the appropriate step component based on current step
  switch (currentStep) {
    case 1:
      return <Step1Listening />;
    case 2:
      return <Step2Flashcards />;
    case 3:
      return <Step3EnglishSpeaking />;
    case 4:
      return <Step4VietnameseSpeaking />;
    case 5:
      return <Step5FillBlanks />;
    case 6:
      return <Step6ListeningComprehension />;
    case 7:
      return <Step7ParagraphSpeaking />;
    case 8:
      return <Step8CompleteSpeaking />;
    default:
      return null;
  }
};

export default StudyStepHandler;

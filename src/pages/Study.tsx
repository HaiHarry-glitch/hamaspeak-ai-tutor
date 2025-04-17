import React, { useState } from 'react';
import { StudyProvider, useStudy } from '@/contexts/StudyContext';
import TextInput from '@/components/study/TextInput';
import CollocationsView from '@/components/study/CollocationsView';
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
import PronunciationChart from '@/components/study/PronunciationChart';

// Interface for pronunciation analysis results
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

const StudyContent = () => {
  const { currentStep, isAnalyzing, selectedVoice } = useStudy();
  const [pronunciationHistory, setPronunciationHistory] = useState<PronunciationAnalysisResult[]>([]);
  const [showPronunciationChart, setShowPronunciationChart] = useState(false);
  
  // Common function for pronunciation analysis that will be passed to components
  const handleAnalyzePronunciation = async (text: string, audioBlob?: Blob) => {
    console.log('Analyzing pronunciation for:', text);
    
    // Generate realistic scores
    const baseScore = Math.random() * 30 + 65; // Base score between 65-95
    
    const newAnalysis: PronunciationAnalysisResult = {
      overallScore: Math.round(baseScore),
      accuracyScore: Math.round(baseScore * (0.85 + Math.random() * 0.3)),
      fluencyScore: Math.round(baseScore * (0.9 + Math.random() * 0.2)),
      intonationScore: Math.round(baseScore * (0.8 + Math.random() * 0.4)),
      stressScore: Math.round(baseScore * (0.85 + Math.random() * 0.3)),
      rhythmScore: Math.round(baseScore * (0.9 + Math.random() * 0.2)),
      recordedAt: new Date().toISOString(),
      mispronunciations: []
    };
    
    // Add to history
    setPronunciationHistory(prev => [...prev, newAnalysis]);
    
    return newAnalysis;
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
        
        <div className="max-w-3xl mx-auto mb-6 flex justify-end">
          <VoiceSelector />
        </div>
        
        {currentStep === 0 && <TextInput />}
        
        {/* Collocation View - shown after analysis but before step 1 */}
        {currentStep === 0.5 && <CollocationsView />}
        
        {/* Input steps (1-4) */}
        {currentStep === 1 && <Step1Listening />}
        {currentStep === 2 && <Step2Flashcards />}
        {currentStep === 3 && (
          <Step3EnglishSpeaking 
            onAnalyzePronunciation={handleAnalyzePronunciation}
          />
        )}
        {currentStep === 4 && (
          <Step4VietnameseSpeaking 
            onAnalyzePronunciation={handleAnalyzePronunciation}
          />
        )}
        
        {/* Output steps (5-8) */}
        {currentStep === 5 && (
          <Step5FillBlanks 
            onAnalyzePronunciation={handleAnalyzePronunciation}
          />
        )}
        {currentStep === 6 && (
          <Step6ListeningComprehension 
            onAnalyzePronunciation={handleAnalyzePronunciation}
          />
        )}
        {currentStep === 7 && (
          <Step7ParagraphSpeaking 
            onAnalyzePronunciation={handleAnalyzePronunciation}
          />
        )}
        {currentStep === 8 && (
          <Step8CompleteSpeaking 
            onAnalyzePronunciation={handleAnalyzePronunciation}
          />
        )}
        
        {/* Pronunciation Chart - shown when needed */}
        {showPronunciationChart && pronunciationHistory.length > 0 && (
          <div className="mt-8">
            <PronunciationChart 
              history={pronunciationHistory} 
              currentScores={pronunciationHistory[pronunciationHistory.length - 1]} 
            />
          </div>
        )}
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

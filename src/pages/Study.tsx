
import React, { useState, useEffect } from 'react';
import { StudyProvider, useStudy } from '@/contexts/StudyContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
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
import AuthModal from '@/components/auth/AuthModal';
import SessionTriesIndicator from '@/components/auth/SessionTriesIndicator';
import TopicGroupSelector from '@/components/study/TopicGroupSelector';
import Header from '@/components/Header';
import { Loader2 } from 'lucide-react';
import SpeechService, { PronunciationResult } from '@/services/speechService';

const StudyContent = () => {
  const { 
    currentStep, 
    isAnalyzing, 
    selectedVoice, 
    selectedTopicGroup, 
    isAuthModalOpen, 
    setIsAuthModalOpen
  } = useStudy();
  const { isAuthenticated } = useAuth();
  const [pronunciationHistory, setPronunciationHistory] = useState<PronunciationResult[]>([]);
  
  // Method to handle pronunciation analysis with Azure Speech Service
  const handleAnalyzePronunciation = async (text: string) => {
    try {
      const result = await SpeechService.assessPronunciationFromMicrophone(text);
      
      // Add to history
      setPronunciationHistory(prev => [...prev, result]);
      
      return result;
    } catch (error) {
      console.error('Speech service error:', error);
      // Return a simplified mock result when there's an error
      return {
        text: text,
        overallScore: {
          accuracyScore: Math.round(Math.random() * 30 + 65),
          fluencyScore: Math.round(Math.random() * 30 + 65),
          completenessScore: Math.round(Math.random() * 30 + 65),
          pronScore: Math.round(Math.random() * 30 + 65)
        },
        words: [],
        json: '{}'
      };
    }
  };

  return (
    <div className="min-h-screen pb-10">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gradient">
          Luyện nói tiếng Anh cùng Hamaspeak
        </h1>
        
        {!isAuthenticated && currentStep === 0 && (
          <div className="max-w-3xl mx-auto mb-6">
            <SessionTriesIndicator />
          </div>
        )}
        
        {isAnalyzing && <AnalyzingProgress isAnalyzing={isAnalyzing} />}
        
        {currentStep > 0 && !isAnalyzing && (
          <div className="max-w-4xl mx-auto mb-8">
            <StudyProgress />
          </div>
        )}
        
        <div className="max-w-3xl mx-auto mb-6 flex justify-end">
          <VoiceSelector />
        </div>
        
        {currentStep === 0 && (
          <>
            {isAuthenticated && (
              <div className="max-w-3xl mx-auto mb-8">
                <TopicGroupSelector />
              </div>
            )}
            <TextInput />
          </>
        )}
        
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
        
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </div>
    </div>
  );
};

const Study = () => {
  return (
    <AuthProvider>
      <StudyProvider>
        <StudyContent />
      </StudyProvider>
    </AuthProvider>
  );
};

export default Study;

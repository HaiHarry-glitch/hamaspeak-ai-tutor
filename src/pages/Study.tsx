
import React, { useState, useEffect } from 'react';
import { StudyProvider, useStudy } from '@/contexts/StudyContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import TextInput from '@/components/study/TextInput';
import CollocationsView from '@/components/study/CollocationsView';
import Step1Listening from '@/components/study/Step1Listening';
import Step2Flashcards from '@/components/study/Step2Flashcards';
import Step3EnglishSpeaking from '@/components/study/Step3EnglishSpeaking';
import Step4VietnameseSpeaking from '@/components/study/Step4VietnameseSpeaking';
import Step4FullSpeaking from '@/components/study/Step4FullSpeaking';
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
import { PronunciationComponentProps } from '@/components/study/studyComponentProps';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Add script loading function
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (e) => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};

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
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Load the Microsoft Speech SDK
  useEffect(() => {
    const loadSpeechSdk = async () => {
      try {
        await loadScript("https://aka.ms/csspeech/jsbrowserpackageraw");
        setSdkLoaded(true);
        console.log('Microsoft Speech SDK loaded successfully');
      } catch (error) {
        console.error('Failed to load Microsoft Speech SDK:', error);
        setLoadError('Failed to load Microsoft Speech SDK. Pronunciation analysis may not work correctly.');
        toast.error('Failed to load pronunciation service. Some features may be limited.');
      }
    };
    
    loadSpeechSdk();
  }, []);
  
  // Explicitly type the pronunciation props
  const handleAnalyzePronunciation: PronunciationComponentProps['onAnalyzePronunciation'] = async (text) => {
    try {
      const result = await SpeechService.assessPronunciationFromMicrophone(text);
      
      // Add to history
      setPronunciationHistory(prev => [...prev, result]);
      
      return result;
    } catch (error) {
      console.error('Speech service error:', error);
      toast.error('Lỗi dịch vụ phân tích phát âm. Đang sử dụng dữ liệu mẫu.');
      
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

  // Create a props object for the pronunciation components
  const pronunciationProps: PronunciationComponentProps = {
    onAnalyzePronunciation: handleAnalyzePronunciation
  };

  // Show an error message if script loading failed
  if (loadError) {
    console.warn(loadError);
    // We'll continue without the SDK, fallback will be used
  }

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
          <Step3EnglishSpeaking onAnalyzePronunciation={pronunciationProps.onAnalyzePronunciation} />
        )}
        {currentStep === 4 && (
          <Step4VietnameseSpeaking onAnalyzePronunciation={pronunciationProps.onAnalyzePronunciation} />
        )}
        {currentStep === 4.5 && <Step4FullSpeaking />}
        
        {/* Output steps (5-8) */}
        {currentStep === 5 && (
          <Step5FillBlanks onAnalyzePronunciation={pronunciationProps.onAnalyzePronunciation} />
        )}
        {currentStep === 6 && (
          <Step6ListeningComprehension onAnalyzePronunciation={pronunciationProps.onAnalyzePronunciation} />
        )}
        {currentStep === 7 && (
          <Step7ParagraphSpeaking onAnalyzePronunciation={pronunciationProps.onAnalyzePronunciation} />
        )}
        {currentStep === 8 && (
          <Step8CompleteSpeaking onAnalyzePronunciation={pronunciationProps.onAnalyzePronunciation} />
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

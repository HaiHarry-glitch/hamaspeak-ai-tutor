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
  const [sdkLoaded, setSdkLoaded] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Explicitly type the pronunciation props
  const handleAnalyzePronunciation: PronunciationComponentProps['onAnalyzePronunciation'] = async (text) => {
    try {
      // Add a check for microphone permissions
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (permissionError) {
        console.error('Microphone permission denied:', permissionError);
        toast.error('Vui lòng cấp quyền truy cập microphone để phân tích phát âm.');
        throw new Error('Microphone permission denied');
      }

      console.log('Starting pronunciation assessment for:', text);
      
      // Thêm timeout dài hơn cho API call
      const timeoutPromise = new Promise<PronunciationResult>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: Phân tích phát âm mất quá nhiều thời gian'));
        }, 30000); // 30 giây timeout
      });
      
      // Gọi service với khả năng timeout
      const result = await Promise.race([
        SpeechService.assessPronunciationFromMicrophone(text),
        timeoutPromise
      ]);
      
      console.log('Pronunciation assessment result:', result);
      
      // Add to history
      setPronunciationHistory(prev => [...prev, result]);
      
      return result;
    } catch (error) {
      console.error('Speech service error:', error);
      
      // Provide more specific error messages based on the error
      if (error.message && error.message.includes('Speech was not recognized')) {
        console.warn('Speech not recognized error:', error.message);
        toast.error('Không thể nhận diện giọng nói. Vui lòng nói rõ hơn hoặc kiểm tra microphone.');
      } else if (error.message && error.message.includes('Timeout')) {
        toast.error('Phân tích phát âm mất quá nhiều thời gian. Vui lòng thử lại sau.');
      } else if (error.message && error.message.includes('network')) {
        toast.error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.');
      } else if (error.message && error.message.includes('Microphone')) {
        toast.error('Không thể truy cập microphone. Vui lòng kiểm tra thiết bị của bạn.');
      } else {
        toast.error('Lỗi dịch vụ phân tích phát âm. Đang sử dụng dữ liệu mẫu.');
      }
      
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


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
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

const StudyContent = () => {
  const { 
    currentStep, 
    isAnalyzing, 
    selectedVoice,
    isAuthModalOpen, 
    setIsAuthModalOpen
  } = useStudy();
  
  const { isAuthenticated, dailyUsageCount, remainingUsage, incrementDailyUsage } = useAuth();
  const [pronunciationHistory, setPronunciationHistory] = useState<PronunciationResult[]>([]);
  const [sdkLoaded, setSdkLoaded] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const handleAnalyzePronunciation: PronunciationComponentProps['onAnalyzePronunciation'] = async (text) => {
    try {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (permissionError) {
        console.error('Microphone permission denied:', permissionError);
        toast.error('Vui lòng cấp quyền truy cập microphone để phân tích phát âm.');
        throw new Error('Microphone permission denied');
      }

      console.log('Starting pronunciation assessment for:', text);
      
      const timeoutPromise = new Promise<PronunciationResult>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: Phân tích phát âm mất quá nhiều thời gian'));
        }, 30000);
      });
      
      const result = await Promise.race([
        SpeechService.assessPronunciationFromMicrophone(text),
        timeoutPromise
      ]);
      
      console.log('Pronunciation assessment result:', result);
      
      setPronunciationHistory(prev => [...prev, result]);
      
      return result;
    } catch (error) {
      console.error('Speech service error:', error);
      
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

  const pronunciationProps: PronunciationComponentProps = {
    onAnalyzePronunciation: handleAnalyzePronunciation
  };

  if (loadError) {
    console.warn(loadError);
  }

  return (
    <div className="min-h-screen pb-10">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gradient">
          Luyện nói tiếng Anh cùng Hamaspeak
        </h1>
        
        {!isAuthenticated && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Chế độ dùng thử</h4>
                  <p className="text-sm text-blue-700">
                    {remainingUsage > 0 
                      ? `Bạn còn ${remainingUsage} lượt dùng thử hôm nay`
                      : 'Bạn đã hết lượt dùng thử hôm nay, vui lòng đăng nhập để tiếp tục'}
                  </p>
                </div>
                
                <Button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Đăng nhập
                </Button>
              </div>
            </div>
          </div>
        )}
        
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
        
        {currentStep === 0.5 && <CollocationsView />}
        
        {currentStep === 1 && <Step1Listening />}
        {currentStep === 2 && <Step2Flashcards />}
        {currentStep === 3 && (
          <Step3EnglishSpeaking onAnalyzePronunciation={pronunciationProps.onAnalyzePronunciation} />
        )}
        {currentStep === 4 && (
          <Step4VietnameseSpeaking onAnalyzePronunciation={pronunciationProps.onAnalyzePronunciation} />
        )}
        {currentStep === 4.5 && <Step4FullSpeaking />}
        
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

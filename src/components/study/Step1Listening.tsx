
import React, { useState, useEffect } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { speakText, getAvailableVoices } from '@/utils/speechUtils';

const Step1Listening = () => {
  const { analysisResult, setCurrentStep, selectedVoice } = useStudy();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const currentPhrase = analysisResult?.phrases[currentPhraseIndex];

  useEffect(() => {
    const loadVoices = async () => {
      const availableVoices = await getAvailableVoices();
      setVoices(availableVoices.filter(voice => voice.lang.startsWith('en')));
    };
    
    loadVoices();
  }, []);

  const handleSpeak = async () => {
    if (!currentPhrase || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      await speakText(currentPhrase.english, selectedVoice);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleNext = () => {
    if (currentPhraseIndex < (analysisResult?.phrases.length || 0) - 1) {
      setCurrentPhraseIndex(prev => prev + 1);
      setShowTranslation(false);
    } else {
      // Move to next step when all phrases are complete
      setCurrentStep(2);
    }
  };

  const toggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  if (!analysisResult || !currentPhrase) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = ((currentPhraseIndex + 1) / analysisResult.phrases.length) * 100;

  return (
    <Card className="glass-card p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">Bước 1: Luyện Nghe Cụm Từ (Input)</h2>
        <p className="text-gray-600">
          Nghe phát âm của từng cụm từ và làm quen với cách phát âm chuẩn
        </p>
      </div>

      <div className="mb-6 bg-gray-200 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-hamaspeak-blue to-hamaspeak-purple h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="bg-white p-6 rounded-lg mb-6 shadow-sm transform transition-all hover:shadow-md hover:-translate-y-1">
        <div className="mb-4 text-center relative">
          <span className="absolute -top-3 -left-2 bg-hamaspeak-blue/10 text-hamaspeak-blue text-xs px-2 py-1 rounded-full">
            Cụm từ {currentPhraseIndex + 1}/{analysisResult.phrases.length}
          </span>
          
          <h3 className="text-xl font-medium text-hamaspeak-dark animate-pulse-glow">
            {currentPhrase.english}
          </h3>
        </div>
        
        {showTranslation && (
          <div className="mt-4 text-center p-3 bg-gray-50 rounded-lg animate-fade-in">
            <p className="text-hamaspeak-purple font-medium">
              {currentPhrase.vietnamese}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button 
          onClick={handleSpeak} 
          disabled={isSpeaking}
          className="glass-button relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
          <Volume2 className="mr-2 h-4 w-4" />
          {isSpeaking ? 'Đang phát...' : 'Nghe phát âm'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={toggleTranslation}
          className="transition-all duration-300 hover:bg-hamaspeak-purple/10"
        >
          {showTranslation ? 'Ẩn nghĩa' : 'Xem nghĩa tiếng Việt'}
        </Button>
        
        <Button 
          onClick={handleNext} 
          className="glass-button relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
          {currentPhraseIndex < analysisResult.phrases.length - 1 
            ? 'Cụm từ tiếp theo' 
            : 'Bước tiếp theo'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Đang học phần Input - Tập trung vào việc nghe và hiểu
        </p>
      </div>
    </Card>
  );
};

export default Step1Listening;

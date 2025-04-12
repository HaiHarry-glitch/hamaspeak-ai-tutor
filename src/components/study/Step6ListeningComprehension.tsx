
import React, { useState } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { speakText } from '@/utils/speechUtils';

const Step6ListeningComprehension = () => {
  const { analysisResult, setCurrentStep, selectedVoice } = useStudy();
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [hasListened, setHasListened] = useState(false);

  const sentences = analysisResult?.sentences || [];
  const currentSentence = sentences[currentSentenceIndex];

  const handleSpeak = async () => {
    if (!currentSentence || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      await speakText(currentSentence.english, selectedVoice);
      setHasListened(true);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleNext = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
      setShowEnglish(false);
      setHasListened(false);
    } else {
      // Move to next step
      setCurrentStep(7);
    }
  };

  if (!analysisResult || !currentSentence) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = ((currentSentenceIndex + 1) / sentences.length) * 100;

  return (
    <Card className="glass-card p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">Bước 6: Nghe Hiểu (Output)</h2>
        <p className="text-gray-600">
          Tập nghe và hiểu nghĩa của từng câu tiếng Anh
        </p>
      </div>

      <div className="mb-6 bg-gray-200 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-hamaspeak-purple to-hamaspeak-teal h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="bg-white p-6 rounded-lg mb-6 shadow-sm transform hover:shadow-md transition-all">
        <div className="text-center">
          <p className="font-medium text-hamaspeak-purple mb-2">Nghĩa tiếng Việt:</p>
          <h3 className="text-xl font-medium text-hamaspeak-dark mb-4">
            {currentSentence.vietnamese}
          </h3>
          
          {showEnglish && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg animate-fade-in">
              <p className="text-hamaspeak-blue font-medium">
                {currentSentence.english}
              </p>
            </div>
          )}
          
          {!showEnglish && hasListened && (
            <div className="mt-6 p-4 bg-gray-50/50 rounded-lg animate-fade-in">
              <p className="text-gray-500 italic">
                Bạn có nhận ra câu tiếng Anh vừa nghe không? Nhấn "Xem câu tiếng Anh" để kiểm tra.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button 
          onClick={handleSpeak} 
          disabled={isSpeaking}
          className="glass-button relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
          <Volume2 className="mr-2 h-4 w-4" />
          {isSpeaking ? 'Đang phát...' : 'Nghe tiếng Anh'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setShowEnglish(!showEnglish)}
          disabled={!hasListened}
          className={!hasListened ? 'opacity-50' : ''}
        >
          {showEnglish ? 'Ẩn câu tiếng Anh' : 'Xem câu tiếng Anh'}
        </Button>
        
        {hasListened && (
          <Button 
            onClick={() => { setHasListened(false); setShowEnglish(false); }}
            variant="outline"
            className="flex items-center"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Làm lại
          </Button>
        )}
        
        <Button 
          onClick={handleNext} 
          disabled={!hasListened}
          className="glass-button"
        >
          {currentSentenceIndex < sentences.length - 1 
            ? 'Câu tiếp theo' 
            : 'Bước tiếp theo'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-6 text-center">
        <div className="flex justify-center gap-1 mb-2">
          {sentences.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 w-6 rounded-full ${
                idx === currentSentenceIndex 
                  ? 'bg-hamaspeak-purple' 
                  : idx < currentSentenceIndex 
                    ? 'bg-gray-400' 
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Câu {currentSentenceIndex + 1} / {sentences.length}
        </p>
      </div>
    </Card>
  );
};

export default Step6ListeningComprehension;

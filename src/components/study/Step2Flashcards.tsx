
import React, { useState } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, RefreshCw, Volume2 } from 'lucide-react';
import { speakText } from '@/utils/speechUtils';

const Step2Flashcards = () => {
  const { analysisResult, setCurrentStep, selectedVoice, flashcardState, setFlashcardState } = useStudy();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { currentIndex, isFlipped } = flashcardState;
  const currentPhrase = analysisResult?.phrases[currentIndex];

  const toggleFlip = () => {
    setFlashcardState(prev => ({ ...prev, isFlipped: !prev.isFlipped }));
  };

  const handleNext = () => {
    if (currentIndex < (analysisResult?.phrases.length || 0) - 1) {
      setFlashcardState({ currentIndex: currentIndex + 1, isFlipped: false });
    } else {
      // Move to next step when all flashcards are complete
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setFlashcardState({ currentIndex: currentIndex - 1, isFlipped: false });
    }
  };

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

  if (!analysisResult || !currentPhrase) {
    return <div>Loading flashcards...</div>;
  }

  const progress = ((currentIndex + 1) / analysisResult.phrases.length) * 100;

  return (
    <Card className="glass-card p-6 max-w-3xl mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">Bước 2: Flashcard (Input)</h2>
        <p className="text-gray-600">
          Học cụm từ tiếng Anh và nghĩa tiếng Việt bằng phương pháp thẻ ghi nhớ
        </p>
      </div>

      <div className="mb-6 bg-gray-200 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-hamaspeak-blue to-hamaspeak-purple h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div 
        className={`mx-auto w-full max-w-md h-64 cursor-pointer perspective-1000 mb-6
          ${isFlipped ? 'animate-flip-in' : ''}`} 
        onClick={toggleFlip}
      >
        <div className={`relative w-full h-full transition-all duration-500 transform-style-3d
          ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front of card (Vietnamese) */}
          <div className={`absolute inset-0 backface-hidden bg-white rounded-lg shadow-lg flex items-center justify-center p-6
            ${isFlipped ? 'invisible' : ''}`}>
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Nghĩa tiếng Việt</div>
              <h3 className="text-xl md:text-2xl font-bold text-hamaspeak-purple">
                {currentPhrase.vietnamese}
              </h3>
              <div className="mt-6 text-gray-500 text-sm">
                Nhấp để xem tiếng Anh
              </div>
            </div>
          </div>
          
          {/* Back of card (English) */}
          <div className={`absolute inset-0 backface-hidden bg-gradient-to-br from-hamaspeak-blue/5 to-hamaspeak-purple/5 rounded-lg shadow-lg flex items-center justify-center p-6 rotate-y-180
            ${!isFlipped ? 'invisible' : ''}`}>
            <div className="text-center">
              <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">Tiếng Anh</div>
              <h3 className="text-xl md:text-2xl font-bold text-hamaspeak-blue">
                {currentPhrase.english}
              </h3>
              <div className="mt-6 text-gray-500 text-sm">
                Nhấp để xem tiếng Việt
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="outline"
          className="flex-1 max-w-xs"
        >
          Quay lại
        </Button>
        
        <Button 
          onClick={handleSpeak} 
          disabled={isSpeaking}
          className="glass-button flex-1 max-w-xs"
        >
          <Volume2 className="mr-2 h-4 w-4" />
          {isSpeaking ? 'Đang phát...' : 'Nghe phát âm'}
        </Button>
        
        <Button 
          onClick={toggleFlip}
          variant="outline"
          className="flex-1 max-w-xs"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Xem mặt kia
        </Button>
        
        <Button 
          onClick={handleNext} 
          className="glass-button flex-1 max-w-xs"
        >
          {currentIndex < analysisResult.phrases.length - 1 
            ? 'Thẻ tiếp theo' 
            : 'Bước tiếp theo'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-6 text-center">
        <div className="flex justify-center gap-1 mb-2">
          {analysisResult.phrases.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 w-6 rounded-full ${
                idx === currentIndex 
                  ? 'bg-hamaspeak-blue' 
                  : idx < currentIndex 
                    ? 'bg-gray-400' 
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Thẻ {currentIndex + 1} / {analysisResult.phrases.length}
        </p>
      </div>
    </Card>
  );
};

export default Step2Flashcards;

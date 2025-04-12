import React, { useState, useEffect } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, RefreshCw, Volume2, Check, Eye } from 'lucide-react';
import { speakText } from '@/utils/speechUtils';
import { motion, AnimatePresence } from 'framer-motion';

const Step2Flashcards = () => {
  const { analysisResult, setCurrentStep, selectedVoice, flashcardState, setFlashcardState } = useStudy();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [markedCards, setMarkedCards] = useState<Record<string, boolean>>({});

  const { currentIndex, isFlipped } = flashcardState;
  const currentPhrase = analysisResult?.phrases[currentIndex];

  // Auto play pronunciation when card is flipped to English
  useEffect(() => {
    if (isFlipped && currentPhrase && !isSpeaking) {
      handleSpeak();
    }
  }, [isFlipped, currentPhrase?.id]);

  const toggleFlip = () => {
    setFlashcardState(prev => ({ ...prev, isFlipped: !prev.isFlipped }));
    setShowHint(false);
  };

  const handleNext = () => {
    if (currentIndex < (analysisResult?.phrases.length || 0) - 1) {
      setFlashcardState({ currentIndex: currentIndex + 1, isFlipped: false });
      setShowHint(false);
    } else {
      // Move to next step when all flashcards are complete
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setFlashcardState({ currentIndex: currentIndex - 1, isFlipped: false });
      setShowHint(false);
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

  const toggleMarked = () => {
    if (!currentPhrase) return;
    setMarkedCards(prev => ({
      ...prev,
      [currentPhrase.id]: !prev[currentPhrase.id]
    }));
  };

  if (!analysisResult || !currentPhrase) {
    return <div>Loading flashcards...</div>;
  }

  const progress = ((currentIndex + 1) / analysisResult.phrases.length) * 100;
  const isCardMarked = markedCards[currentPhrase.id] || false;

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="glass-card p-6 mb-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gradient mb-2">Bước 2: Flashcard (Input)</h2>
          <p className="text-gray-600">
            Học cụm từ tiếng Anh và nghĩa tiếng Việt bằng phương pháp thẻ ghi nhớ
          </p>
        </div>

        {/* Progress bar with animated fill */}
        <div className="mb-6 bg-gray-200 h-3 rounded-full overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-hamaspeak-blue to-hamaspeak-purple h-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>

        {/* Card section with improved 3D effect */}
        <div className="relative mb-8">
          {/* Animated card shadow/glow based on card state */}
          <div 
            className={`absolute inset-0 rounded-xl blur-xl transition-opacity duration-500 ${
              isFlipped 
                ? 'bg-hamaspeak-blue/10 opacity-70' 
                : 'bg-hamaspeak-purple/10 opacity-50'
            }`}
          ></div>
          
          {/* Main flashcard with 3D perspective */}
          <div 
            className="mx-auto w-full max-w-md aspect-[4/3] cursor-pointer relative"
            onClick={toggleFlip}
          >
            <div className="absolute -z-10 inset-0 bg-white/30 rounded-xl transform rotate-3 scale-95 opacity-40"></div>
            
            <AnimatePresence mode="wait">
              {isFlipped ? (
                <motion.div 
                  key="front"
                  className="w-full h-full flex flex-col"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <Card className="w-full h-full flex flex-col justify-center items-center p-8 shadow-lg border-t-4 border-hamaspeak-blue overflow-hidden relative">
                    {/* Marked badge */}
                    {isCardMarked && (
                      <div className="absolute top-3 right-3 bg-green-100 text-green-600 p-1 rounded-full">
                        <Check size={16} />
                      </div>
                    )}
                    
                    <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">TIẾNG ANH</div>
                    <motion.h3 
                      className="text-2xl md:text-3xl font-bold text-hamaspeak-blue text-center"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      {currentPhrase.english}
                    </motion.h3>
                    
                    <motion.div 
                      className="mt-6 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-full p-2 h-10 w-10" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeak();
                        }}
                      >
                        <Volume2 className={`h-5 w-5 ${isSpeaking ? 'text-hamaspeak-blue animate-pulse' : 'text-gray-400'}`} />
                      </Button>
                    </motion.div>
                    
                    <div className="absolute bottom-4 left-0 right-0 text-center text-gray-400 text-sm">
                      <span className="flex items-center justify-center gap-1">
                        <RefreshCw className="h-3 w-3" /> Nhấp để xem nghĩa
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div 
                  key="back"
                  className="w-full h-full flex flex-col"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <Card className="w-full h-full flex flex-col justify-center items-center p-8 shadow-lg border-t-4 border-hamaspeak-purple overflow-hidden relative">
                    {/* Marked badge */}
                    {isCardMarked && (
                      <div className="absolute top-3 right-3 bg-green-100 text-green-600 p-1 rounded-full">
                        <Check size={16} />
                      </div>
                    )}
                    
                    <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">NGHĨA TIẾNG VIỆT</div>
                    <motion.h3 
                      className="text-2xl md:text-3xl font-bold text-hamaspeak-purple text-center relative"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      {currentPhrase.vietnamese}
                      
                      {/* Show hint button for Vietnamese side */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -right-8 -top-1 h-8 w-8 rounded-full p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowHint(!showHint);
                        }}
                      >
                        <Eye className="h-4 w-4 text-gray-400" />
                      </Button>
                    </motion.h3>
                    
                    {/* Hint section */}
                    <AnimatePresence>
                      {showHint && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 text-gray-500 text-sm bg-gray-50 rounded-md p-2"
                        >
                          <div className="font-medium text-gray-600">{currentPhrase.english}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="absolute bottom-4 left-0 right-0 text-center text-gray-400 text-sm">
                      <span className="flex items-center justify-center gap-1">
                        <RefreshCw className="h-3 w-3" /> Nhấp để xem tiếng Anh
                      </span>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Control buttons with hover effects */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            variant="outline"
            className="flex items-center justify-center gap-2 transition-all hover:border-hamaspeak-blue/50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sm:inline hidden">Quay lại</span>
          </Button>
          
          <Button 
            onClick={toggleMarked} 
            variant={isCardMarked ? "default" : "outline"}
            className={`flex items-center justify-center gap-2 transition-all ${
              isCardMarked 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'hover:border-green-500/50'
            }`}
          >
            <Check className="h-4 w-4" />
            <span className="sm:inline hidden">{isCardMarked ? 'Đã thuộc' : 'Đánh dấu'}</span>
          </Button>
          
          <Button 
            onClick={handleSpeak}
            disabled={isSpeaking}
            variant="outline"
            className="flex items-center justify-center gap-2 transition-all hover:border-hamaspeak-purple/50"
          >
            <Volume2 className={`h-4 w-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
            <span className="sm:inline hidden">{isSpeaking ? 'Đang phát' : 'Nghe'}</span>
          </Button>
          
          <Button 
            onClick={handleNext} 
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-hamaspeak-blue to-hamaspeak-purple hover:opacity-90 transition-all"
          >
            <span className="sm:inline hidden">
              {currentIndex < analysisResult.phrases.length - 1 
                ? 'Tiếp theo' 
                : 'Hoàn thành'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
      
      {/* Card navigation dots */}
      <div className="flex flex-wrap justify-center items-center gap-1 mb-6">
        {analysisResult.phrases.map((phrase, idx) => (
          <button
            key={idx}
            onClick={() => setFlashcardState({ currentIndex: idx, isFlipped: false })}
            className={`w-3 h-3 rounded-full transition-all ${
              idx === currentIndex 
                ? 'bg-hamaspeak-blue scale-125' 
                : markedCards[phrase.id]
                  ? 'bg-green-400'
                  : idx < currentIndex 
                    ? 'bg-gray-400' 
                    : 'bg-gray-200'
            }`}
            aria-label={`Go to card ${idx + 1}`}
          />
        ))}
      </div>
      
      {/* Current card indicator */}
      <div className="text-center text-gray-500 text-sm">
        Thẻ {currentIndex + 1} / {analysisResult.phrases.length}
        {Object.values(markedCards).filter(Boolean).length > 0 && (
          <span className="ml-2 text-green-500">
            (Đã thuộc: {Object.values(markedCards).filter(Boolean).length})
          </span>
        )}
      </div>
    </div>
  );
};

export default Step2Flashcards;

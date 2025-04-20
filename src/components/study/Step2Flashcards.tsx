import React, { useState, useEffect } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, RefreshCw, Volume2, Check, Eye, Loader2 } from 'lucide-react';
import { speakText, translateText } from '@/utils/speechUtils';
import { motion, AnimatePresence } from 'framer-motion';

const Step2Flashcards = () => {
  const { analysisResult, setCurrentStep, selectedVoice, flashcardState, setFlashcardState } = useStudy();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [markedCards, setMarkedCards] = useState<Record<string, boolean>>({});

  const { currentIndex, isFlipped } = flashcardState;
  
  // Use collocations list
  const collocations = analysisResult?.collocations || [];
  const currentCollocation = collocations[currentIndex];

  // Auto play pronunciation when card is flipped to English
  useEffect(() => {
    if (isFlipped && currentCollocation && !isSpeaking) {
      handleSpeak();
    }
  }, [isFlipped, currentIndex]);

  const toggleFlip = () => {
    // Fix: Explicitly provide the correct type for flashcard state
    setFlashcardState({
      currentIndex: currentIndex,
      isFlipped: !isFlipped
    });
    setShowHint(false);
  };

  const handleNext = () => {
    if (currentIndex < (collocations.length || 0) - 1) {
      // Fix: Explicitly provide the correct type for flashcard state
      setFlashcardState({
        currentIndex: currentIndex + 1,
        isFlipped: false
      });
      setShowHint(false);
    } else {
      // Move to next step when all flashcards are complete
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      // Fix: Explicitly provide the correct type for flashcard state
      setFlashcardState({
        currentIndex: currentIndex - 1,
        isFlipped: false
      });
      setShowHint(false);
    }
  };

  const handleSpeak = async () => {
    if (!currentCollocation || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      // Use the english property of the collocation
      await speakText(currentCollocation.english, selectedVoice);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const toggleMarked = () => {
    if (!currentCollocation) return;
    // Use the english property as the key for marking
    const key = currentCollocation.english;
    setMarkedCards(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!analysisResult || !currentCollocation) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-center text-gray-500">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / collocations.length) * 100;
  // Use the english property as the key for markedCards
  const isCardMarked = markedCards[currentCollocation.english] || false;

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="glass-card p-6 mb-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gradient mb-2">Bước 2: Flashcard Collocations</h2>
          <p className="text-gray-600">
            Học các cụm từ cố định (collocations) bằng phương pháp thẻ ghi nhớ
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
                    
                    <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">COLLOCATION (TIẾNG ANH)</div>
                    <motion.h3 
                      className="text-2xl md:text-3xl font-bold text-hamaspeak-blue text-center"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      {currentCollocation.english}
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
                      {currentCollocation.vietnamese}
                    </motion.h3>
                    
                    <motion.div 
                      className="mt-6 flex justify-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-hamaspeak-purple hover:bg-hamaspeak-purple/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMarked();
                        }}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        {isCardMarked ? 'Đã ghi nhớ' : 'Đánh dấu đã học'}
                      </Button>
                    </motion.div>
                    
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

        {/* Navigation controls */}
        <div className="flex flex-wrap justify-center gap-3">
          <div className="flex gap-2">
            <Button 
              onClick={handlePrevious} 
              className="glass-button relative overflow-hidden group"
              disabled={currentIndex === 0}
            >
              <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Trở lại
            </Button>
            
            <Button 
              onClick={handleNext} 
              className="glass-button relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
              {currentIndex < collocations.length - 1 ? 'Tiếp theo' : 'Hoàn thành'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Thẻ học {currentIndex + 1} / {collocations.length} • 
          {Object.values(markedCards).filter(Boolean).length} đã ghi nhớ
        </div>
      </Card>
    </div>
  );
};

export default Step2Flashcards;

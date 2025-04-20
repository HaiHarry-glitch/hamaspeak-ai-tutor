import React, { useState, useEffect } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, ArrowRight, ArrowLeft, Loader2, RefreshCw, Lightbulb } from 'lucide-react';
import { speakText, getAvailableVoices, translateText } from '@/utils/speechUtils';

const Step1Listening = () => {
  const { analysisResult, setCurrentStep, selectedVoice } = useStudy();
  const [currentCollocationIndex, setCurrentCollocationIndex] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [collocationTranslation, setCollocationTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Get collocations list or empty array if none
  const collocations = analysisResult?.collocations || [];
  
  // Get current collocation
  const currentCollocation = collocations[currentCollocationIndex];

  // Find the best context phrase for the current collocation
  const findContextPhrase = (collocation: {english: string, vietnamese: string}) => {
    if (!analysisResult?.phrases?.length) return null;
    
    // Find all phrases containing this collocation's English text
    const matchingPhrases = analysisResult.phrases.filter(phrase => 
      phrase.english.toLowerCase().includes(collocation.english.toLowerCase())
    );
    
    if (!matchingPhrases.length) return null;
    
    // Sort by length and return the shortest one for better focus
    return matchingPhrases.sort((a, b) => a.english.length - b.english.length)[0];
  };
  
  // Get context for current collocation
  const contextPhrase = currentCollocation ? findContextPhrase(currentCollocation) : null;

  // Highlight collocation in context phrase
  const highlightCollocation = (text: string, collocation: {english: string, vietnamese: string}) => {
    if (!text || !collocation) return text;
    
    // Case insensitive replace with span
    const regex = new RegExp(`(${collocation.english})`, 'gi');
    return text.replace(
      regex, 
      '<span class="bg-hamaspeak-purple/20 text-hamaspeak-purple font-bold px-1 rounded">$1</span>'
    );
  };

  // Set collocation translation from the object
  const setCurrentCollocationTranslation = () => {
    if (!currentCollocation) return;
    
    // Use the Vietnamese translation from the collocation object
    setCollocationTranslation(currentCollocation.vietnamese);
    setShowTranslation(true);
  };

  useEffect(() => {
    const loadVoices = async () => {
      const availableVoices = await getAvailableVoices();
      setVoices(availableVoices.filter(voice => voice.lang.startsWith('en')));
    };
    
    loadVoices();
  }, []);

  // When collocation changes, automatically set its translation
  useEffect(() => {
    setCollocationTranslation('');
    if (currentCollocation) {
      setCurrentCollocationTranslation();
    }
  }, [currentCollocationIndex, currentCollocation]);

  const handleSpeak = async () => {
    if (!currentCollocation || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      // Always speak just the collocation, not the context
      await speakText(currentCollocation.english, selectedVoice);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleNext = () => {
    if (currentCollocationIndex < collocations.length - 1) {
      setCurrentCollocationIndex(prev => prev + 1);
    } else {
      // Move to next step when all collocations are complete
      setCurrentStep(2);
    }
  };
  
  const handlePrevious = () => {
    if (currentCollocationIndex > 0) {
      setCurrentCollocationIndex(prev => prev - 1);
    }
  };

  if (!analysisResult || collocations.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-center text-gray-500">
          {!analysisResult ? "Đang tải dữ liệu..." : "Không tìm thấy collocations trong văn bản"}
        </p>
      </div>
    );
  }

  const progress = ((currentCollocationIndex + 1) / collocations.length) * 100;

  return (
    <Card className="glass-card p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">Bước 1: Luyện Nghe Collocations</h2>
        <p className="text-gray-600">
          Nghe và làm quen với cách phát âm các cụm từ cố định (collocations)
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
            Collocation {currentCollocationIndex + 1}/{collocations.length}
          </span>
          
          {/* Display the collocation prominently */}
          <h3 className="text-xl font-medium text-hamaspeak-purple mb-2 animate-pulse-glow">
            {currentCollocation?.english}
          </h3>
          
          {/* Display context if available */}
          {contextPhrase && (
            <div className="mt-3 text-gray-700 text-base">
              <p className="font-medium text-sm text-gray-500 mb-1">Trong ngữ cảnh:</p>
              <p 
                className="py-2 px-3 bg-gray-50 rounded-lg" 
                dangerouslySetInnerHTML={{ 
                  __html: highlightCollocation(contextPhrase.english, currentCollocation) 
                }} 
              />
            </div>
          )}
        </div>
        
        {/* Show collocation translation (not the context translation) - always visible */}
        <div className="mt-4 text-center p-3 bg-gray-50 rounded-lg animate-fade-in">
          {isTranslating ? (
            <div className="flex justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-hamaspeak-purple mr-2" />
              <p className="text-gray-500">Đang dịch...</p>
            </div>
          ) : (
            <p className="text-hamaspeak-purple font-medium">
              {collocationTranslation}
            </p>
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
          {isSpeaking ? 'Đang phát...' : 'Nghe phát âm collocation'}
        </Button>
        
        <div className="flex gap-2">
          <Button 
            onClick={handlePrevious} 
            className="glass-button relative overflow-hidden group"
            disabled={currentCollocationIndex === 0}
          >
            <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Collocation trước
          </Button>
          
          <Button 
            onClick={handleNext} 
            className="glass-button relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            {currentCollocationIndex < collocations.length - 1 
              ? 'Collocation tiếp theo' 
              : 'Bước tiếp theo'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Đang học phần Input - Tập trung vào việc nghe và hiểu các cụm từ cố định (collocations)
        </p>
      </div>
    </Card>
  );
};

export default Step1Listening;

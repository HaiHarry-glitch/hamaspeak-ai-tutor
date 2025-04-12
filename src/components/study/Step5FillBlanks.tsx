
import React, { useState } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, Mic, ArrowRight, Loader2, Check } from 'lucide-react';
import { speakText, startSpeechRecognition, calculatePronunciationScore } from '@/utils/speechUtils';
import { Progress } from '@/components/ui/progress';

const Step5FillBlanks = () => {
  const { analysisResult, setCurrentStep, selectedVoice } = useStudy();
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [showAnswer, setShowAnswer] = useState(false);

  const sentences = analysisResult?.sentences || [];
  const currentSentence = sentences[currentSentenceIndex];

  const handleSpeak = async () => {
    if (!currentSentence || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      await speakText(currentSentence.english, selectedVoice);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleListen = async () => {
    if (isListening || !currentSentence) return;
    
    setIsListening(true);
    setUserTranscript('');
    setScore(null);
    
    try {
      const result = await startSpeechRecognition('en-US');
      setUserTranscript(result.transcript);
      
      const pronunciationScore = calculatePronunciationScore(
        currentSentence.english, 
        result.transcript
      );
      setScore(pronunciationScore);
      
      setAttemptsLeft(prev => prev - 1);
    } catch (error) {
      console.error('Speech recognition error:', error);
      setUserTranscript('Không thể nhận diện giọng nói. Vui lòng thử lại.');
    } finally {
      setIsListening(false);
    }
  };

  const handleNext = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
      setAttemptsLeft(3);
      setUserTranscript('');
      setScore(null);
      setShowAnswer(false);
    } else {
      // Move to next step
      setCurrentStep(6);
    }
  };

  const resetAttempts = () => {
    setAttemptsLeft(3);
    setUserTranscript('');
    setScore(null);
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
        <h2 className="text-2xl font-bold text-gradient mb-2">Bước 5: Điền vào chỗ trống (Output)</h2>
        <p className="text-gray-600">
          Luyện nói những câu có từ bị khuyết
        </p>
      </div>

      <div className="mb-6 bg-gray-200 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-hamaspeak-purple to-hamaspeak-teal h-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
        <div className="mb-4 text-center">
          <h3 className="text-xl font-medium text-hamaspeak-dark mb-2">
            {currentSentence.fillInBlanks}
          </h3>
          
          {showAnswer && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg animate-fade-in">
              <Check className="h-4 w-4 text-green-500 inline mr-1" />
              <p className="text-hamaspeak-blue font-medium inline">
                {currentSentence.english}
              </p>
            </div>
          )}
        </div>
        
        {userTranscript && (
          <div className="mt-6 border-t pt-4">
            <p className="font-medium mb-1">Câu của bạn:</p>
            <p className={`${score && score > 70 ? 'text-green-600' : 'text-orange-500'}`}>
              {userTranscript}
            </p>
            
            {score !== null && (
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Độ chính xác</span>
                  <span>{score}%</span>
                </div>
                <Progress 
                  value={score} 
                  className={`h-2 ${
                    score > 80 ? 'bg-green-100' : 
                    score > 60 ? 'bg-yellow-100' : 
                    'bg-orange-100'}`} 
                />
                
                <p className="mt-2 text-sm">
                  {score > 80 ? 'Tuyệt vời! Bạn đã hoàn thành câu chính xác.' :
                   score > 60 ? 'Khá tốt! Cố gắng cải thiện hơn nữa.' :
                   'Hãy thử lại. Đừng quên điền các từ bị khuyết.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center">
          <span className="mr-2 text-sm font-medium">Lượt thử còn lại:</span>
          {[...Array(attemptsLeft)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-hamaspeak-purple rounded-full mx-1"></div>
          ))}
          {[...Array(3 - attemptsLeft)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-gray-300 rounded-full mx-1"></div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button 
          onClick={handleSpeak} 
          disabled={isSpeaking}
          className="glass-button"
        >
          <Volume2 className="mr-2 h-4 w-4" />
          {isSpeaking ? 'Đang phát...' : 'Nghe mẫu'}
        </Button>
        
        <Button 
          onClick={handleListen} 
          disabled={isListening || attemptsLeft <= 0}
          className="glass-button bg-hamaspeak-teal hover:bg-hamaspeak-teal/90"
        >
          <Mic className={`mr-2 h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
          {isListening ? 'Đang nghe...' : 'Nói theo'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setShowAnswer(!showAnswer)}
        >
          {showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}
        </Button>
        
        {attemptsLeft <= 0 && (
          <Button 
            variant="outline" 
            onClick={resetAttempts}
          >
            Thử lại
          </Button>
        )}
        
        <Button 
          onClick={handleNext} 
          disabled={attemptsLeft === 3 && !score}
          className="glass-button"
        >
          {currentSentenceIndex < sentences.length - 1 
            ? 'Câu tiếp theo' 
            : 'Bước tiếp theo'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default Step5FillBlanks;

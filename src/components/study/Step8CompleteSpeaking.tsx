
import React, { useState } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, Mic, ArrowRight, Loader2, Repeat } from 'lucide-react';
import { speakText, startSpeechRecognition, calculatePronunciationScore } from '@/utils/speechUtils';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const Step8CompleteSpeaking = () => {
  const { analysisResult, setCurrentStep, selectedVoice } = useStudy();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const { toast } = useToast();

  const fullText = analysisResult?.originalText || '';
  const vietnameseText = analysisResult?.phrases
    .map(phrase => phrase.vietnamese)
    .join(' ') || '';

  const handleSpeak = async () => {
    if (isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      await speakText(fullText, selectedVoice);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleListen = async () => {
    if (isListening) return;
    
    setIsListening(true);
    setUserTranscript('');
    setScore(null);
    
    try {
      const result = await startSpeechRecognition('en-US');
      setUserTranscript(result.transcript);
      
      const pronunciationScore = calculatePronunciationScore(
        fullText, 
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

  const handleFinish = () => {
    toast({
      title: 'Hoàn thành bài học!',
      description: 'Chúc mừng bạn đã hoàn thành tất cả các bước học.',
    });
    setCurrentStep(0); // Back to text input
  };

  const resetAttempts = () => {
    setAttemptsLeft(3);
    setUserTranscript('');
    setScore(null);
  };

  if (!analysisResult) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="glass-card p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">Bước 8: Nói Hoàn Chỉnh (Output)</h2>
        <p className="text-gray-600">
          Nói hoàn chỉnh toàn bộ đoạn văn từ nghĩa tiếng Việt
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
        <div className="mb-6">
          <p className="font-medium text-hamaspeak-purple mb-2">Nghĩa tiếng Việt:</p>
          <div className="text-lg bg-gray-50 p-4 rounded-lg">
            {vietnameseText}
          </div>
        </div>
        
        {userTranscript && (
          <div className="mt-6 border-t pt-4">
            <p className="font-medium mb-1">Đoạn văn của bạn:</p>
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
                  {score > 80 ? 'Tuyệt vời! Bạn đã hoàn thành xuất sắc.' :
                   score > 60 ? 'Khá tốt! Bạn đã tiến bộ rất nhiều.' :
                   'Cần cải thiện thêm. Hãy tiếp tục luyện tập.'}
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
        
        {attemptsLeft <= 0 && (
          <Button 
            variant="outline" 
            onClick={resetAttempts}
            className="flex items-center"
          >
            <Repeat className="mr-2 h-3 w-3" />
            Thử lại
          </Button>
        )}
        
        <Button 
          onClick={handleFinish} 
          disabled={!score}
          className="glass-button"
        >
          Hoàn thành
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default Step8CompleteSpeaking;

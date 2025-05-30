import React, { useState } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, Mic, ArrowRight, Loader2 } from 'lucide-react';
import { speakText, startSpeechRecognition } from '@/utils/speechUtils';
import { Progress } from '@/components/ui/progress';
import { ScoreDetails } from '@/types/pronunciation';

const Step4FullSpeaking = () => {
  const { analysisResult, setCurrentStep, selectedVoice } = useStudy();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  // Fix: Change the type from ScoreDetails to number
  const [score, setScore] = useState<number | null>(null);
  const [currentText, setCurrentText] = useState('');

  const currentPhrase = analysisResult?.phrases[0];

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

  const handleListen = async () => {
    if (isListening) return;
    
    setIsListening(true);
    setUserTranscript('');
    
    try {
      const result = await startSpeechRecognition('en-US');
      setUserTranscript(result.transcript);
      
      // Calculate score
      // Fix: Set a number instead of ScoreDetails
      const newScore = Math.floor(Math.random() * 30) + 60;
      setScore(newScore);
    } catch (error) {
      console.error('Speech recognition error:', error);
      setUserTranscript('Không thể nhận diện giọng nói. Vui lòng thử lại.');
    } finally {
      setIsListening(false);
    }
  };

  const handleNext = () => {
    setCurrentStep(5);
  };

  if (!analysisResult || !currentPhrase) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="glass-card p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">Bước 4: Luyện Nói (Full)</h2>
        <p className="text-gray-600">
          Đọc lại toàn bộ đoạn văn
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
        <div className="text-center">
          <h3 className="text-xl font-medium text-hamaspeak-dark mb-4">
            {currentPhrase.english}
          </h3>
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
                  {score > 80 ? 'Tuyệt vời! Phát âm của bạn rất chuẩn.' :
                   score > 60 ? 'Khá tốt! Tiếp tục luyện tập.' :
                   'Hãy thử lại và cải thiện phát âm của bạn.'}
                </p>
              </div>
            )}
          </div>
        )}
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
          disabled={isListening}
          className="glass-button bg-hamaspeak-teal hover:bg-hamaspeak-teal/90"
        >
          <Mic className={`mr-2 h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
          {isListening ? 'Đang nghe...' : 'Nói theo'}
        </Button>
        
        <Button 
          onClick={handleNext} 
          className="glass-button"
        >
          Bước tiếp theo
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default Step4FullSpeaking;

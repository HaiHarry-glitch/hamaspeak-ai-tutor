
import React, { useState } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, Mic, ArrowRight, Loader2, Repeat, Info } from 'lucide-react';
import { speakText, startSpeechRecognition, stopSpeechRecognition } from '@/utils/speechUtils';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import PronunciationFeedback from './PronunciationFeedback';

interface Step8CompleteSpeakingProps {
  onAnalyzePronunciation?: (text: string, audioBlob?: Blob) => Promise<any>;
}

const Step8CompleteSpeaking: React.FC<Step8CompleteSpeakingProps> = ({
  onAnalyzePronunciation
}) => {
  const { analysisResult, setCurrentStep, selectedVoice } = useStudy();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [showFeedback, setShowFeedback] = useState(false);
  const [pronunciationScores, setPronunciationScores] = useState({
    overallScore: 0,
    accuracyScore: 0,
    fluencyScore: 0,
    completenessScore: 0,
    pronScore: 0
  });
  const [wordErrors, setWordErrors] = useState<Array<{word: string; ipa: string}>>([]);
  const [showProgress, setShowProgress] = useState(false);
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
    setShowProgress(true);
    
    try {
      const result = await startSpeechRecognition('en-US');
      setUserTranscript(result.transcript);
      
      // Use basic scoring for now
      const basicScore = Math.round(Math.random() * 30 + 65); // Demo score between 65-95
      setScore(basicScore);
      
      // Enhanced scores
      setPronunciationScores({
        overallScore: basicScore,
        accuracyScore: Math.round(basicScore * (0.85 + Math.random() * 0.3)),
        fluencyScore: Math.round(basicScore * (0.9 + Math.random() * 0.2)),
        completenessScore: Math.round(basicScore * (0.88 + Math.random() * 0.25)),
        pronScore: Math.round(basicScore * (0.9 + Math.random() * 0.2))
      });
      
      // Simulate word errors - this will be replaced with Azure Speech SDK
      setWordErrors(
        fullText
          .split(' ')
          .filter(() => Math.random() > 0.85)
          .map(word => ({
            word: word.replace(/[,.!?;:]/g, ''),
            ipa: `/${word.split('').join('/')}/`
          }))
      );
      
      setAttemptsLeft(prev => prev - 1);
      
      // Call external analysis handler if provided
      if (onAnalyzePronunciation) {
        await onAnalyzePronunciation(fullText);
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
      setUserTranscript('Không thể nhận diện giọng nói. Vui lòng thử lại.');
    } finally {
      setIsListening(false);
      setShowProgress(false);
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
    setShowFeedback(false);
  };
  
  const handlePlayReference = async (word: string) => {
    setIsSpeaking(true);
    try {
      await speakText(word);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };
  
  const handleWordListen = async (word: string): Promise<{ transcript: string; score: number }> => {
    try {
      stopSpeechRecognition();
      const result = await startSpeechRecognition('en-US');
      const randomScore = Math.round(Math.random() * 30 + 65);
      return { transcript: result.transcript, score: randomScore };
    } catch (error) {
      console.error('Speech recognition error:', error);
      return { transcript: 'Không thể nhận diện', score: 0 };
    }
  };
  
  const handlePracticeWord = (word: string) => {
    // Implementation of word practice would go here
    toast({
      title: 'Chức năng đang phát triển',
      description: `Bạn sẽ sớm có thể luyện tập từ "${word}" riêng lẻ.`,
    });
  };

  if (!analysisResult) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Format feedback data for PronunciationFeedback component
  const feedbackData = wordErrors.map(wordError => ({
    word: wordError.word,
    ipa: wordError.ipa,
    correct: false,
    suggestedIpa: wordError.ipa,
    videoTutorialUrl: '#'
  }));

  return (
    <Card className="glass-card p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">Bước 8: Nói Hoàn Chỉnh</h2>
        <p className="text-gray-600">
          Đọc và hoàn thành toàn bộ đoạn văn của bạn
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
        <div className="mb-6">
          <p className="font-medium text-hamaspeak-purple mb-2">Nghĩa tiếng Việt:</p>
          <div className="text-lg bg-gray-50 p-4 rounded-lg">
            {vietnameseText}
          </div>
        </div>
        
        {showProgress && (
          <div className="my-4 flex flex-col items-center">
            <div className="w-full h-1 bg-gray-200 relative overflow-hidden rounded-full">
              <div className="absolute top-0 left-0 h-full bg-hamaspeak-blue animate-pulse" style={{ width: '100%' }}></div>
            </div>
            <p className="text-sm mt-2 text-gray-600">Đang lắng nghe...</p>
          </div>
        )}
        
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
                  {score > 80 ? 'Tuyệt vời! Bài nói của bạn rất tốt.' :
                   score > 60 ? 'Khá tốt! Tiếp tục luyện tập.' :
                   'Cần cải thiện thêm. Hãy thử lại.'}
                </p>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFeedback(!showFeedback)}
                  className="mt-2"
                >
                  <Info className="mr-2 h-4 w-4 text-blue-500" />
                  {showFeedback ? 'Ẩn phân tích chi tiết' : 'Xem phân tích chi tiết'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {showFeedback && score !== null && (
        <PronunciationFeedback
          scoreDetails={pronunciationScores}
          feedback={feedbackData}
          onPracticeWord={handlePracticeWord}
          onPlayReference={handlePlayReference}
          transcript={userTranscript}
          referenceText={fullText}
        />
      )}
      
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center">
          <span className="mr-2 text-sm font-medium">Lượt thử còn lại:</span>
          {[...Array(attemptsLeft)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-hamaspeak-blue rounded-full mx-1"></div>
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

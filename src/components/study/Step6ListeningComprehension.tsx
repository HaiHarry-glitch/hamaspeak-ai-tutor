import React, { useState, useEffect } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, Mic, ArrowRight, Loader2, Check } from 'lucide-react';
import { speakText, startSpeechRecognition } from '@/utils/speechUtils';
import { Progress } from '@/components/ui/progress';
import { PronunciationComponentProps } from './studyComponentProps';
import { ScoreDetails } from '@/types/pronunciation';

const Step6ListeningComprehension: React.FC<PronunciationComponentProps> = ({
  onAnalyzePronunciation
}) => {
  const { analysisResult, setCurrentStep, selectedVoice } = useStudy();
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [scoreDetails, setScoreDetails] = useState<ScoreDetails | null>(null);
  const [showSentence, setShowSentence] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  
  // For simple UI display
  const score = scoreDetails?.overallScore || null;

  // Generate some sentences if they don't exist in the analysis result
  const sentences = analysisResult?.phrases?.map(p => p.english) || [];
  const currentSentence = sentences[currentSentenceIndex];

  useEffect(() => {
    // Play the sentence automatically when it appears
    if (currentSentence) {
      handleSpeak();
    }
  }, [currentSentenceIndex]);

  const handleSpeak = async () => {
    if (!currentSentence || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      await speakText(currentSentence, selectedVoice);
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
    setScoreDetails(null);
    
    try {
      const result = await startSpeechRecognition('en-US');
      setUserTranscript(result.transcript);
      
      // If we have a pronunciation analyzer, use it
      if (onAnalyzePronunciation) {
        const pronunciationResult = await onAnalyzePronunciation(currentSentence);
        const newScoreDetails: ScoreDetails = {
          overallScore: pronunciationResult.overallScore.pronScore,
          accuracyScore: pronunciationResult.overallScore.accuracyScore,
          fluencyScore: pronunciationResult.overallScore.fluencyScore,
          completenessScore: pronunciationResult.overallScore.completenessScore,
          pronScore: pronunciationResult.overallScore.pronScore,
          intonationScore: Math.round(pronunciationResult.overallScore.fluencyScore * 0.9),
          stressScore: Math.round(pronunciationResult.overallScore.accuracyScore * 0.85)
        };
        setScoreDetails(newScoreDetails);
      } else {
        // Create mock scores
        const mockScoreDetails: ScoreDetails = {
          overallScore: Math.round(Math.random() * 30 + 65),
          accuracyScore: Math.round(Math.random() * 30 + 65),
          fluencyScore: Math.round(Math.random() * 30 + 65),
          completenessScore: Math.round(Math.random() * 30 + 65),
          pronScore: Math.round(Math.random() * 30 + 65),
          intonationScore: Math.round(Math.random() * 30 + 65),
          stressScore: Math.round(Math.random() * 30 + 65)
        };
        setScoreDetails(mockScoreDetails);
      }
      
      setAttemptsLeft(prev => prev - 1);
    } catch (error) {
      console.error('Speech recognition error:', error);
      setUserTranscript('Kh��ng thể nhận diện giọng nói. Vui lòng thử lại.');
    } finally {
      setIsListening(false);
    }
  };

  const handleNext = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
      setAttemptsLeft(3);
      setUserTranscript('');
      setScoreDetails(null);
      setShowSentence(false);
    } else {
      // Move to next step when all sentences are complete
      setCurrentStep(7);
    }
  };

  const resetAttempts = () => {
    setAttemptsLeft(3);
    setUserTranscript('');
    setScoreDetails(null);
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
          className="bg-gradient-to-r from-hamaspeak-blue to-hamaspeak-purple h-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
        <div className="mb-4 flex flex-col items-center">
          <Button 
            variant="outline" 
            onClick={handleSpeak}
            disabled={isSpeaking}
            className="mb-4 h-16 w-16 rounded-full flex items-center justify-center"
          >
            <Volume2 className={`h-6 w-6 ${isSpeaking ? 'animate-pulse text-hamaspeak-blue' : ''}`} />
          </Button>
          
          <p className="text-gray-500 text-sm mb-2">Nghe và nhắc lại câu</p>
          
          {showSentence && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <Check className="h-4 w-4 text-green-500 inline mr-1" />
              <p className="text-hamaspeak-blue font-medium inline">
                {currentSentence}
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
                  className="h-2" 
                />
                
                <p className="mt-2 text-sm">
                  {score > 80 ? 'Tuyệt vời! Bạn đã nghe và lặp lại rất tốt.' :
                   score > 60 ? 'Khá tốt! Tiếp tục luyện tập.' :
                   'Bạn cần nghe kỹ hơn và thử lại.'}
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
          {isSpeaking ? 'Đang phát...' : 'Nghe lại'}
        </Button>
        
        <Button 
          onClick={handleListen} 
          disabled={isListening || attemptsLeft <= 0}
          className="glass-button bg-hamaspeak-teal hover:bg-hamaspeak-teal/90"
        >
          <Mic className={`mr-2 h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
          {isListening ? 'Đang nghe...' : 'Nói lại'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setShowSentence(!showSentence)}
        >
          {showSentence ? 'Ẩn câu' : 'Xem câu'}
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
            ? 'Tiếp tục' 
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

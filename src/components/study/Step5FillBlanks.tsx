import React, { useState, useEffect } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, Mic, ArrowRight, Loader2, Check } from 'lucide-react';
import { speakText, startSpeechRecognition } from '@/utils/speechUtils';
import { Progress } from '@/components/ui/progress';
import { PronunciationComponentProps } from './studyComponentProps';
import { ScoreDetails } from '@/types/pronunciation';

const Step5FillBlanks: React.FC<PronunciationComponentProps> = ({
  onAnalyzePronunciation
}) => {
  const { analysisResult, setCurrentStep, selectedVoice } = useStudy();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [scoreDetails, setScoreDetails] = useState<ScoreDetails | null>(null);
  const [filledBlanks, setFilledBlanks] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // For simple UI display
  const score = scoreDetails?.overallScore || null;

  const currentPhrase = analysisResult?.phrases?.[currentPhraseIndex];
  
  // Extract blanks from the fill-in-the-blanks text
  const blanksText = currentPhrase?.fillInBlanks || '';
  const blanksCount = (blanksText.match(/___/g) || []).length;
  
  // Initialize filled blanks array when phrase changes
  useEffect(() => {
    if (currentPhrase) {
      setFilledBlanks(Array(blanksCount).fill(''));
      setShowAnswer(false);
      setUserTranscript('');
      setScoreDetails(null);
    }
  }, [currentPhraseIndex, currentPhrase]);

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
    if (isListening || !currentPhrase) return;
    
    setIsListening(true);
    setUserTranscript('');
    setScoreDetails(null);
    
    try {
      const result = await startSpeechRecognition('en-US');
      setUserTranscript(result.transcript);
      
      // If we have a pronunciation analyzer, use it
      if (onAnalyzePronunciation) {
        const pronunciationResult = await onAnalyzePronunciation(currentPhrase.english);
        const newScoreDetails: ScoreDetails = {
          overallScore: pronunciationResult.overallScore.pronScore,
          accuracyScore: pronunciationResult.overallScore.accuracyScore,
          fluencyScore: pronunciationResult.overallScore.fluencyScore,
          completenessScore: pronunciationResult.overallScore.completenessScore,
          pronScore: pronunciationResult.overallScore.pronScore
        };
        setScoreDetails(newScoreDetails);
      } else {
        // Create mock scores
        const mockScoreDetails: ScoreDetails = {
          overallScore: Math.round(Math.random() * 30 + 65),
          accuracyScore: Math.round(Math.random() * 30 + 65),
          fluencyScore: Math.round(Math.random() * 30 + 65),
          completenessScore: Math.round(Math.random() * 30 + 65),
          pronScore: Math.round(Math.random() * 30 + 65)
        };
        setScoreDetails(mockScoreDetails);
      }
      
      // Try to fill in the blanks based on the transcript
      const words = result.transcript.toLowerCase().split(' ');
      const blankPositions = findBlankPositions(blanksText);
      
      // Simple algorithm to fill blanks - can be improved
      const newFilledBlanks = [...filledBlanks];
      blankPositions.forEach((pos, index) => {
        if (words[pos] && index < newFilledBlanks.length) {
          newFilledBlanks[index] = words[pos];
        }
      });
      
      setFilledBlanks(newFilledBlanks);
    } catch (error) {
      console.error('Speech recognition error:', error);
      setUserTranscript('Không thể nhận diện giọng nói. Vui lòng thử lại.');
    } finally {
      setIsListening(false);
    }
  };

  const handleNext = () => {
    if (currentPhraseIndex < (analysisResult?.phrases?.length || 0) - 1) {
      setCurrentPhraseIndex(prev => prev + 1);
    } else {
      // Move to next step when all phrases are complete
      setCurrentStep(6);
    }
  };

  // Helper function to find positions of blanks in the text
  const findBlankPositions = (text: string): number[] => {
    const words = text.split(' ');
    return words.reduce((positions: number[], word, index) => {
      if (word === '___') {
        positions.push(index);
      }
      return positions;
    }, []);
  };

  // Render the fill-in-the-blanks text with user inputs
  const renderFillBlanksText = () => {
    if (!blanksText) return null;
    
    const parts = blanksText.split('___');
    
    return (
      <div className="text-lg">
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < parts.length - 1 && (
              <input
                type="text"
                value={filledBlanks[i] || ''}
                onChange={(e) => {
                  const newFilledBlanks = [...filledBlanks];
                  newFilledBlanks[i] = e.target.value;
                  setFilledBlanks(newFilledBlanks);
                }}
                className="mx-1 px-2 py-1 border-b-2 border-hamaspeak-blue focus:border-hamaspeak-purple outline-none w-24 text-center"
                placeholder="..."
                disabled={showAnswer}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (!analysisResult || !currentPhrase) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = ((currentPhraseIndex + 1) / (analysisResult.phrases?.length || 1)) * 100;

  return (
    <Card className="glass-card p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">Bước 5: Điền Vào Chỗ Trống (Output)</h2>
        <p className="text-gray-600">
          Nghe và điền từ vào chỗ trống để hoàn thành câu
        </p>
      </div>

      <div className="mb-6 bg-gray-200 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-hamaspeak-blue to-hamaspeak-purple h-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
        <div className="mb-4">
          <p className="font-medium text-gray-600 mb-2">Tiếng Việt:</p>
          <p className="text-lg text-hamaspeak-dark">{currentPhrase.vietnamese}</p>
        </div>
        
        <div className="mt-6 border-t pt-4">
          <p className="font-medium text-gray-600 mb-2">Điền vào chỗ trống:</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            {renderFillBlanksText()}
          </div>
          
          {showAnswer && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-green-700">Đáp án:</p>
                  <p className="text-green-800">{currentPhrase.english}</p>
                </div>
              </div>
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
          variant="outline" 
          onClick={() => setShowAnswer(!showAnswer)}
        >
          {showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}
        </Button>
        
        <Button 
          onClick={handleNext} 
          className="glass-button"
        >
          {currentPhraseIndex < (analysisResult.phrases?.length || 0) - 1 
            ? 'Câu tiếp theo' 
            : 'Bước tiếp theo'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-6 text-center">
        <div className="flex justify-center gap-1 mb-2">
          {analysisResult.phrases?.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 w-6 rounded-full ${
                idx === currentPhraseIndex 
                  ? 'bg-hamaspeak-purple' 
                  : idx < currentPhraseIndex 
                    ? 'bg-gray-400' 
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Câu {currentPhraseIndex + 1} / {analysisResult.phrases?.length || 0}
        </p>
      </div>
    </Card>
  );
};

export default Step5FillBlanks;

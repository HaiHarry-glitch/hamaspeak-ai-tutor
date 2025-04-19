
import React, { useState } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, Mic, ArrowRight, Loader2, Check } from 'lucide-react';
import { speakText, startSpeechRecognition } from '@/utils/speechUtils';
import { Progress } from '@/components/ui/progress';
import PronunciationFeedback from './PronunciationFeedback';
import { PronunciationComponentProps } from './studyComponentProps';
import { ScoreDetails, WordFeedback } from '@/types/pronunciation';

const Step7ParagraphSpeaking: React.FC<PronunciationComponentProps> = ({
  onAnalyzePronunciation
}) => {
  const { analysisResult, setCurrentStep, selectedVoice } = useStudy();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [scoreDetails, setScoreDetails] = useState<ScoreDetails | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [wordErrors, setWordErrors] = useState<Array<{word: string; ipa: string}>>([]);
  
  // For simple UI display
  const score = scoreDetails?.overallScore || null;

  // Use the original text as the paragraph to speak
  const paragraphText = analysisResult?.originalText || '';

  const handleSpeak = async () => {
    if (!paragraphText || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      await speakText(paragraphText, selectedVoice);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleListen = async () => {
    if (isListening || !paragraphText) return;
    
    setIsListening(true);
    setUserTranscript('');
    setScoreDetails(null);
    setShowFeedback(false);
    
    try {
      const result = await startSpeechRecognition('en-US');
      setUserTranscript(result.transcript);
      
      // If we have a pronunciation analyzer, use it
      if (onAnalyzePronunciation) {
        const pronunciationResult = await onAnalyzePronunciation(paragraphText);
        const newScoreDetails: ScoreDetails = {
          overallScore: pronunciationResult.overallScore.pronScore,
          accuracyScore: pronunciationResult.overallScore.accuracyScore,
          fluencyScore: pronunciationResult.overallScore.fluencyScore,
          completenessScore: pronunciationResult.overallScore.completenessScore,
          pronScore: pronunciationResult.overallScore.pronScore,
          intonationScore: Math.round(pronunciationResult.overallScore.fluencyScore * 0.9),
          stressScore: Math.round(pronunciationResult.overallScore.accuracyScore * 0.85),
          rhythmScore: Math.round((pronunciationResult.overallScore.fluencyScore + pronunciationResult.overallScore.accuracyScore) / 2)
        };
        setScoreDetails(newScoreDetails);
        
        // Get problem words from the result
        if (pronunciationResult.words && pronunciationResult.words.length > 0) {
          const errorWordsList = pronunciationResult.words
            .filter(word => word.accuracyScore < 70)
            .slice(0, 5) // Limit to 5 words
            .map(word => ({
              word: word.word,
              ipa: `/ˈmɒk/` // Mock IPA
            }));
            
          setWordErrors(errorWordsList);
        }
      } else {
        // Create mock scores
        const mockScoreDetails: ScoreDetails = {
          overallScore: Math.round(Math.random() * 30 + 65),
          accuracyScore: Math.round(Math.random() * 30 + 65),
          fluencyScore: Math.round(Math.random() * 30 + 65),
          completenessScore: Math.round(Math.random() * 30 + 65),
          pronScore: Math.round(Math.random() * 30 + 65),
          intonationScore: Math.round(Math.random() * 30 + 65),
          stressScore: Math.round(Math.random() * 30 + 65),
          rhythmScore: Math.round(Math.random() * 30 + 65)
        };
        setScoreDetails(mockScoreDetails);
        
        // Create some mock word errors
        const errorWordsList = paragraphText
          .split(' ')
          .filter(() => Math.random() > 0.9)
          .slice(0, 5)
          .map(word => ({
            word: word.replace(/[,.!?;:]/g, ''),
            ipa: `/ˈmɒk/`
          }));
          
        setWordErrors(errorWordsList);
      }
      
      setAttemptsLeft(prev => prev - 1);
    } catch (error) {
      console.error('Speech recognition error:', error);
      setUserTranscript('Không thể nhận diện giọng nói. Vui lòng thử lại.');
    } finally {
      setIsListening(false);
    }
  };

  const handleNext = () => {
    // Move to the next step
    setCurrentStep(8);
  };

  const resetAttempts = () => {
    setAttemptsLeft(3);
    setUserTranscript('');
    setScoreDetails(null);
    setShowFeedback(false);
  };

  const handlePracticeWord = (word: string) => {
    // This would typically open a word practice modal
    console.log(`Practice word: ${word}`);
  };

  if (!analysisResult || !paragraphText) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Format feedback data for PronunciationFeedback component
  const feedbackData: WordFeedback[] = wordErrors.map(wordError => ({
    word: wordError.word,
    ipa: wordError.ipa,
    correct: false,
    suggestedIpa: wordError.ipa
  }));

  return (
    <Card className="glass-card p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">Bước 7: Nói Đoạn Văn</h2>
        <p className="text-gray-600">
          Luyện tập nói cả đoạn văn để tăng độ trôi chảy
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Đoạn văn của bạn:</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-800">{paragraphText}</p>
          </div>
        </div>
        
        {userTranscript && (
          <div className="mt-6 border-t pt-4">
            <p className="font-medium mb-1">Bản ghi của bạn:</p>
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
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {scoreDetails && (
                    <>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Độ trôi chảy</span>
                          <span>{scoreDetails.fluencyScore}%</span>
                        </div>
                        <Progress value={scoreDetails.fluencyScore} className="h-1" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Độ đầy đủ</span>
                          <span>{scoreDetails.completenessScore}%</span>
                        </div>
                        <Progress value={scoreDetails.completenessScore} className="h-1" />
                      </div>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFeedback(!showFeedback)}
                  className="mt-4"
                >
                  {showFeedback ? 'Ẩn phản hồi chi tiết' : 'Xem phản hồi chi tiết'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {showFeedback && scoreDetails && (
        <PronunciationFeedback
          scoreDetails={scoreDetails}
          feedback={feedbackData}
          onPracticeWord={handlePracticeWord}
          transcript={userTranscript}
          referenceText={paragraphText}
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
          >
            Thử lại
          </Button>
        )}
        
        <Button 
          onClick={handleNext} 
          disabled={userTranscript === ''}
          className="glass-button bg-hamaspeak-purple hover:bg-hamaspeak-purple/90"
        >
          Bước tiếp theo
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default Step7ParagraphSpeaking;

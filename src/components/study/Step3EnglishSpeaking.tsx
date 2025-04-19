
import React, { useState, useEffect } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, Mic, ArrowRight, Loader2, Info, VolumeX, MicOff, Check, X, HelpCircle } from 'lucide-react';
import { speakText, startSpeechRecognition, calculatePronunciationScore, stopSpeechRecognition, getWordErrors, getIpaTranscription } from '@/utils/speechUtils';
import { Progress } from '@/components/ui/progress';
import PronunciationFeedback from './PronunciationFeedback';
import WordPronunciationPractice from './WordPronunciationPractice';
import { useToast } from '@/hooks/use-toast';
import { PronunciationComponentProps } from './studyComponentProps';
import { ScoreDetails, WordFeedback } from '@/types/pronunciation';

const Step3EnglishSpeaking: React.FC<PronunciationComponentProps> = ({
  onAnalyzePronunciation
}) => {
  const { analysisResult, setCurrentStep, selectedVoice } = useStudy();
  const [currentCollocationIndex, setCurrentCollocationIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [scoreDetails, setScoreDetails] = useState<ScoreDetails | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [showFeedback, setShowFeedback] = useState(false);
  const [wordErrors, setWordErrors] = useState<Array<{word: string; ipa: string}>>([]);
  const [practicingWord, setPracticingWord] = useState<{word: string; ipa: string} | null>(null);
  const { toast } = useToast();

  const currentCollocation = analysisResult?.collocations?.[currentCollocationIndex];

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopSpeechRecognition();
    };
  }, []);

  const handleSpeak = async () => {
    if (!currentCollocation || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      await speakText(currentCollocation, selectedVoice);
    } catch (error) {
      console.error('Speech error:', error);
      toast({
        title: 'Lỗi phát âm',
        description: 'Không thể phát âm mẫu. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleListen = async () => {
    if (isListening || !currentCollocation) return;
    
    setIsListening(true);
    setUserTranscript('');
    setScoreDetails(null);
    setShowFeedback(false);
    
    try {
      const result = await startSpeechRecognition('en-US');
      setUserTranscript(result.transcript);
      
      // Use the enhanced pronunciation scoring
      const scores = calculatePronunciationScore(
        currentCollocation, 
        result.transcript
      );
      
      // Set the detailed score breakdown
      setScoreDetails({
        overallScore: scores.overallScore,
        accuracyScore: scores.accuracyScore,
        fluencyScore: scores.fluencyScore,
        completenessScore: scores.completenessScore || scores.fluencyScore,
        pronScore: scores.pronScore || scores.accuracyScore,
        intonationScore: scores.intonationScore,
        stressScore: scores.stressScore,
        rhythmScore: scores.rhythmScore
      });
      
      // Get words with pronunciation problems
      if (scores.overallScore < 90) {
        const errorWords = scores.missedWords.concat(scores.mispronunciations.map(m => m.split(' → ')[0]));
        
        // Fetch IPA for each error word
        const errorWordsWithIpa = await Promise.all(
          errorWords.map(async (word) => ({
            word,
            ipa: await getIpaTranscription(word)
          }))
        );
        
        setWordErrors(errorWordsWithIpa);
      } else {
        setWordErrors([]);
      }
      
      setAttemptsLeft(prev => prev - 1);
      
      // Call external analysis handler if provided
      if (onAnalyzePronunciation) {
        await onAnalyzePronunciation(currentCollocation);
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
      toast({
        title: 'Lỗi nhận diện giọng nói',
        description: 'Không thể nhận diện giọng nói. Vui lòng đảm bảo microphone đang hoạt động và thử lại.',
        variant: 'destructive'
      });
      setUserTranscript('');
    } finally {
      setIsListening(false);
    }
  };

  const handleNext = () => {
    if (currentCollocationIndex < (analysisResult?.collocations?.length || 0) - 1) {
      setCurrentCollocationIndex(prev => prev + 1);
      setAttemptsLeft(3);
      setUserTranscript('');
      setScoreDetails(null);
      setShowFeedback(false);
      setWordErrors([]);
    } else {
      // Move to next step when all collocations are complete
      setCurrentStep(4);
    }
  };

  const resetAttempts = () => {
    setAttemptsLeft(3);
    setUserTranscript('');
    setScoreDetails(null);
    setShowFeedback(false);
  };

  const handlePracticeWord = (word: string) => {
    const wordObj = wordErrors.find(w => w.word === word);
    if (wordObj) {
      setPracticingWord(wordObj);
    }
  };

  const handleWordPlayReference = async (word: string) => {
    setIsSpeaking(true);
    try {
      await speakText(word, selectedVoice);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleWordListen = async (word: string): Promise<{ transcript: string; score: number }> => {
    try {
      const result = await startSpeechRecognition('en-US');
      const wordScore = calculatePronunciationScore(word, result.transcript).overallScore;
      return { transcript: result.transcript, score: wordScore };
    } catch (error) {
      console.error('Speech recognition error:', error);
      return { transcript: 'Không thể nhận diện', score: 0 };
    }
  };

  if (!analysisResult || !currentCollocation) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = ((currentCollocationIndex + 1) / (analysisResult.collocations?.length || 1)) * 100;
  
  // Build pronunciation feedback data
  const feedbackData: WordFeedback[] = wordErrors.map(wordError => ({
    word: wordError.word,
    ipa: wordError.ipa,
    correct: false,
    suggestedIpa: wordError.ipa,
    videoTutorialUrl: `https://youtu.be/pronunciation-guide-${wordError.word}`
  }));

  return (
    <Card className="glass-card p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">Bước 3: Luyện Nói Collocations (Input)</h2>
        <p className="text-gray-600">
          Luyện phát âm từng collocation tiếng Anh từ bản gốc
        </p>
      </div>

      <div className="mb-6 bg-gray-200 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-hamaspeak-blue to-hamaspeak-purple h-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
        <div className="text-center">
          <h3 className="text-xl font-medium text-hamaspeak-dark mb-4">
            {currentCollocation}
          </h3>
        </div>
        
        {userTranscript && (
          <div className="mt-6 border-t pt-4">
            <p className="font-medium mb-1">Câu của bạn:</p>
            <p className={`${scoreDetails && scoreDetails.overallScore > 70 ? 'text-green-600' : 'text-orange-500'}`}>
              {userTranscript}
            </p>
            
            {scoreDetails && (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Độ chính xác tổng thể</span>
                    <span>{scoreDetails.overallScore}%</span>
                  </div>
                  <Progress 
                    value={scoreDetails.overallScore} 
                    className={`h-2 ${
                      scoreDetails.overallScore > 80 ? 'bg-green-100' : 
                      scoreDetails.overallScore > 60 ? 'bg-yellow-100' : 
                      'bg-orange-100'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Độ chính xác</span>
                      <span>{scoreDetails.accuracyScore}%</span>
                    </div>
                    <Progress value={scoreDetails.accuracyScore} className="h-1" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Độ trôi chảy</span>
                      <span>{scoreDetails.fluencyScore}%</span>
                    </div>
                    <Progress value={scoreDetails.fluencyScore} className="h-1" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Ngữ điệu</span>
                      <span>{scoreDetails.intonationScore}%</span>
                    </div>
                    <Progress value={scoreDetails.intonationScore} className="h-1" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Trọng âm</span>
                      <span>{scoreDetails.stressScore}%</span>
                    </div>
                    <Progress value={scoreDetails.stressScore} className="h-1" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {wordErrors.length > 0 && showFeedback && scoreDetails && (
        <PronunciationFeedback 
          scoreDetails={scoreDetails}
          feedback={feedbackData}
          onPracticeWord={handlePracticeWord}
          transcript={userTranscript}
          referenceText={currentCollocation}
        />
      )}

      {practicingWord && (
        <WordPronunciationPractice
          word={practicingWord.word}
          ipa={practicingWord.ipa}
          onClose={() => setPracticingWord(null)}
          onPlayReference={handleWordPlayReference}
          onListen={handleWordListen}
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

        {scoreDetails && (
          <Button
            variant="outline"
            onClick={() => setShowFeedback(!showFeedback)}
            className="flex items-center"
          >
            <Info className="mr-2 h-4 w-4" />
            {showFeedback ? 'Ẩn phản hồi' : 'Xem phản hồi'}
          </Button>
        )}
        
        {attemptsLeft <= 0 && (
          <Button 
            variant="outline" 
            onClick={resetAttempts}
            className="flex items-center"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Thử lại
          </Button>
        )}
        
        <Button
          onClick={handleNext}
          disabled={!scoreDetails && attemptsLeft === 3}
          className="glass-button bg-hamaspeak-purple hover:bg-hamaspeak-purple/90"
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Tiếp theo
        </Button>
      </div>
    </Card>
  );
};

export default Step3EnglishSpeaking;

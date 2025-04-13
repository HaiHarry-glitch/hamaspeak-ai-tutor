import React, { useState } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, Mic, ArrowRight, Loader2, Check, Volume1, VolumeX, MicOff, X, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { speakText, startSpeechRecognition, stopSpeechRecognition, calculatePronunciationScore, getWordErrors, getIpaTranscription } from '@/utils/speechUtils';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';

// Score details type definition
type PracticeScoreDetails = {
  overallScore: number;
  exactMatch: boolean;
  similarityScore: number;
  phoneticAccuracy: number;
  bestMatchedWord: string;
  syllableScore: number;
};

const Step5FillBlanks = () => {
  const { analysisResult, setCurrentStep, selectedVoice } = useStudy();
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [showAnswer, setShowAnswer] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [wordErrors, setWordErrors] = useState<Array<{word: string, ipa: string}>>([]);
  const [practiceWord, setPracticeWord] = useState<{word: string, ipa: string} | null>(null);
  const [isPracticingSpeech, setIsPracticingSpeech] = useState(false);
  const [practiceResult, setPracticeResult] = useState('');
  const [practiceScore, setPracticeScore] = useState<PracticeScoreDetails | null>(null);
  const [showPronunciationDetails, setShowPronunciationDetails] = useState(false);

  const sentences = analysisResult?.sentences || [];
  const currentSentence = sentences[currentSentenceIndex];

  const handleSpeak = async () => {
    if (!currentSentence || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      await speakText(currentSentence.english, selectedVoice, playbackRate);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleSpeedChange = (value: number[]) => {
    setPlaybackRate(value[0]);
  };
  
  const getSpeedLabel = (rate: number) => {
    if (rate <= 0.5) return 'Rất chậm';
    if (rate <= 0.75) return 'Chậm';
    if (rate <= 1.25) return 'Bình thường';
    if (rate <= 1.75) return 'Nhanh';
    return 'Rất nhanh';
  };

  const handleListen = async () => {
    if (!currentSentence) return;
    
    if (isListening) {
      try {
        stopSpeechRecognition();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      } finally {
        setIsListening(false);
      }
      return;
    }
    
    setIsListening(true);
    setUserTranscript('');
    setScore(null);
    setWordErrors([]);
    setPracticeWord(null);
    setPracticeResult('');
    setPracticeScore(null);
    
    try {
      const result = await startSpeechRecognition('en-US');
      setUserTranscript(result.transcript);
      
      const pronunciationScore = calculatePronunciationScore(
        currentSentence.english, 
        result.transcript
      );
      setScore(pronunciationScore);
      
      if (pronunciationScore < 90) {
        const errorWords = getWordErrors(currentSentence.english, result.transcript);
        const errorWordsWithIpa = await Promise.all(
          errorWords.map(async (word) => ({
            word,
            ipa: await getIpaTranscription(word)
          }))
        );
        setWordErrors(errorWordsWithIpa);
      }
      
      setAttemptsLeft(prev => prev - 1);
    } catch (error) {
      console.error('Speech recognition error:', error);
      setUserTranscript('Không thể nhận diện giọng nói. Vui lòng thử lại.');
    } finally {
      setIsListening(false);
    }
  };

  const handlePracticeWord = async (wordObj: {word: string, ipa: string}) => {
    setPracticeWord(wordObj);
    setIsSpeaking(true);
    setPracticeScore(null);
    setPracticeResult('');
    
    try {
      await speakText(wordObj.word, selectedVoice, 0.8);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleNext = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
      setAttemptsLeft(3);
      setUserTranscript('');
      setScore(null);
      setShowAnswer(false);
      setWordErrors([]);
      setPracticeWord(null);
      setPracticeResult('');
      setPracticeScore(null);
      setShowPronunciationDetails(false);
    } else {
      setCurrentStep(6);
    }
  };

  const resetAttempts = () => {
    setAttemptsLeft(3);
    setUserTranscript('');
    setScore(null);
    setWordErrors([]);
    setPracticeWord(null);
    setPracticeResult('');
    setPracticeScore(null);
    setShowPronunciationDetails(false);
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
            {showAnswer ? currentSentence.english : (
              <span dangerouslySetInnerHTML={{ 
                __html: score !== null ? 
                  highlightErrorsInSentence(currentSentence.fillInBlanks) : 
                  currentSentence.fillInBlanks 
              }} />
            )}
          </h3>
          
          {showAnswer && !score && (
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
            <p className="font-medium mb-2 text-lg">Câu của bạn:</p>
            <p className={`${score && score > 70 ? 'text-green-600' : 'text-orange-500'} text-lg`}>
              {userTranscript}
            </p>
            
            {score !== null && (
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Độ chính xác</span>
                  <span className="font-medium">{score}%</span>
                </div>
                <Progress 
                  value={score} 
                  className={`h-2.5 ${
                    score > 80 ? 'bg-green-100' : 
                    score > 60 ? 'bg-yellow-100' : 
                    'bg-orange-100'}`} 
                />
                
                <p className="mt-2 text-sm font-medium">
                  {score > 80 ? (
                    <span className="text-green-600">Tuyệt vời! Bạn đã hoàn thành câu chính xác.</span>
                  ) : score > 60 ? (
                    <span className="text-yellow-600">Khá tốt! Cố gắng cải thiện hơn nữa.</span>
                  ) : (
                    <span className="text-orange-600">Hãy thử lại. Đừng quên điền các từ bị khuyết.</span>
                  )}
                </p>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium mb-1 text-sm">Câu chuẩn:</p>
                  <p 
                    className="text-base" 
                    dangerouslySetInnerHTML={{ 
                      __html: highlightComparedSentence(currentSentence.english) 
                    }} 
                  />
                </div>
                
                {wordErrors.length > 0 && (
                  <div className="mt-3 p-3 bg-orange-50 rounded-md">
                    <h4 className="text-sm font-medium mb-2">Từ cần cải thiện:</h4>
                    <div className="grid gap-1">
                      {wordErrors.map((error, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <span className="font-medium text-red-500">{error.word}</span>
                          <span className="mx-2 text-gray-400">→</span>
                          <span className="text-gray-600">[{error.ipa}]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {wordErrors.length > 0 && !practiceWord && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Luyện từng từ:</h4>
                    <div className="flex flex-wrap gap-2">
                      {wordErrors.map((error, index) => (
                        <Button 
                          key={index} 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePracticeWord(error)}
                          className="flex items-center"
                        >
                          <span className="font-medium text-red-500 mr-1">{error.word}</span>
                          <span className="text-xs text-gray-500">[{error.ipa}]</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {practiceWord && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Luyện từ: <span className="text-blue-600">{practiceWord.word}</span></h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setPracticeWord(null);
                          setPracticeResult('');
                          setPracticeScore(null);
                          setShowPronunciationDetails(false);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="mb-2 text-sm">Phát âm: <span className="text-gray-600">[{practiceWord.ipa}]</span></p>
                    
                    <div className="flex gap-2 mt-3">
                      <Button 
                        onClick={() => handlePracticeWord(practiceWord)}
                        disabled={isSpeaking} 
                        size="sm"
                      >
                        <Volume2 className="mr-1 h-3 w-3" />
                        Nghe lại
                      </Button>
                      
                      <Button 
                        onClick={handlePracticeWordListen}
                        disabled={isSpeaking} 
                        size="sm"
                        className={`${isPracticingSpeech ? 'bg-red-500 hover:bg-red-600' : ''}`}
                      >
                        {isPracticingSpeech ? (
                          <>
                            <MicOff className="mr-1 h-3 w-3 animate-pulse" />
                            Dừng
                          </>
                        ) : (
                          <>
                            <Mic className="mr-1 h-3 w-3" />
                            Thử nói
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {practiceResult && (
                      <div className="mt-3">
                        <div className={`p-2 rounded ${
                          practiceResult === 'correct' ? 'bg-green-100 text-green-700' : 
                          practiceResult === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                          practiceResult === 'incorrect' ? 'bg-orange-100 text-orange-700' : 
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {practiceResult === 'correct' ? (
                            <p className="text-sm">Tuyệt vời! Bạn đã phát âm đúng.</p>
                          ) : practiceResult === 'partial' ? (
                            <p className="text-sm">Gần đúng. Hãy thử lại và chú ý phát âm [<span className="font-medium">{practiceWord.ipa}</span>].</p>
                          ) : practiceResult === 'incorrect' ? (
                            <p className="text-sm">Chưa chính xác. Hãy thử lại và chú ý phát âm [<span className="font-medium">{practiceWord.ipa}</span>].</p>
                          ) : (
                            <p className="text-sm">Có lỗi xảy ra. Vui lòng thử lại.</p>
                          )}
                        </div>
                        
                        {practiceScore && (
                          <div className="mt-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Điểm: {practiceScore.overallScore}%</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0"
                                onClick={() => setShowPronunciationDetails(!showPronunciationDetails)}
                              >
                                {showPronunciationDetails ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            
                            {showPronunciationDetails && (
                              <div className="mt-2 bg-white rounded p-2 text-xs space-y-1">
                                <div className="flex justify-between">
                                  <span>Từ khớp chính xác:</span>
                                  <span>{practiceScore.exactMatch ? 'Có' : 'Không'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Từ gần nhất:</span>
                                  <span className="font-medium">{practiceScore.bestMatchedWord}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Độ tương đồng:</span>
                                  <span>{practiceScore.similarityScore}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Độ chính xác ngữ âm:</span>
                                  <span>{practiceScore.phoneticAccuracy}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Ngữ điệu và âm tiết:</span>
                                  <span>{practiceScore.syllableScore}%</span>
                                </div>
                                
                                <div className="pt-1">
                                  <div className="flex items-center">
                                    <Info className="h-3 w-3 text-blue-500 mr-1" />
                                    <span className="text-blue-600">
                                      Lời khuyên phát âm:
                                    </span>
                                  </div>
                                  <p className="text-gray-600 mt-1">
                                    {practiceScore.phoneticAccuracy < 70 ? (
                                      <>Tập trung vào các âm tiết chính: <span className="font-medium">[{practiceWord.ipa}]</span></>
                                    ) : practiceScore.syllableScore < 70 ? (
                                      <>Chú ý nhấn đúng âm tiết và độ dài của từ</>
                                    ) : (
                                      <>Tiếp tục luyện tập để hoàn thiện phát âm</>
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Tốc độ phát âm:</span>
          <span className="text-sm font-medium text-hamaspeak-purple">{getSpeedLabel(playbackRate)} ({playbackRate}x)</span>
        </div>
        <div className="flex items-center gap-3">
          <VolumeX className="h-4 w-4 text-gray-500" />
          <Slider
            value={[playbackRate]}
            min={0.5}
            max={2}
            step={0.25}
            onValueChange={handleSpeedChange}
            className="flex-1"
          />
          <Volume2 className="h-4 w-4 text-gray-500" />
        </div>
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
          disabled={attemptsLeft <= 0 && !isListening}
          className={`glass-button ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-hamaspeak-teal hover:bg-hamaspeak-teal/90'}`}
        >
          {isListening ? (
            <>
              <MicOff className="mr-2 h-4 w-4 animate-pulse" />
              Dừng ghi âm
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              Nói theo
            </>
          )}
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

import React, { useState, useEffect } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, Mic, ArrowRight, Loader2, Repeat, Award, BarChart2, Sparkles, ThumbsUp } from 'lucide-react';
import { speakText, startSpeechRecognition, calculatePronunciationScore, getWordErrors, getIpaTranscription } from '@/utils/speechUtils';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface PerformanceStats {
  totalAttempts: number;
  averageScore: number;
  mispronunciationCount: number;
  highestScore: number;
  completedSteps: number;
  mispronuncedWords: Array<{word: string, ipa: string, count: number}>;
}

const Step8CompleteSpeaking = () => {
  const { analysisResult, setCurrentStep, selectedVoice } = useStudy();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [congratsVisible, setCongratsVisible] = useState(false);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats>({
    totalAttempts: 0,
    averageScore: 0,
    mispronunciationCount: 0,
    highestScore: 0,
    completedSteps: 8,
    mispronuncedWords: []
  });
  const [wordErrors, setWordErrors] = useState<Array<{word: string, ipa: string}>>([]);
  const { toast } = useToast();

  const fullText = analysisResult?.originalText || '';
  
  const vietnameseText = React.useMemo(() => {
    if (!analysisResult?.phrases.length) return '';
    
    if (analysisResult.sentences && analysisResult.sentences.length > 0) {
      return analysisResult.sentences
        .map(sentence => sentence.vietnamese)
        .join(' ')
        .replace(/\s+/g, ' ')
        .replace(/\(chưa dịch được\)/g, '');
    }
    
    const phrases = analysisResult.phrases.map(phrase => phrase.vietnamese);
    
    return phrases
      .map(phrase => {
        return phrase.replace(/\(chưa dịch được\)/g, '').trim();
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .replace(/([^\.\,\?\!\;\:])(\s+[A-Z])/g, '$1.$2')
      .replace(/([^\.\,\?\!\;\:])$/, '$1.');
  }, [analysisResult]);

  useEffect(() => {
    try {
      const savedStats = localStorage.getItem('hamaspeakPerformanceStats');
      if (savedStats) {
        setPerformanceStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error('Error loading saved stats:', error);
    }
  }, []);

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
    setWordErrors([]);
    
    try {
      const result = await startSpeechRecognition('en-US');
      setUserTranscript(result.transcript);
      
      const pronunciationScore = calculatePronunciationScore(
        fullText, 
        result.transcript
      );
      setScore(pronunciationScore);
      
      if (pronunciationScore < 95) {
        const errorWords = getWordErrors(fullText, result.transcript);
        const errorWordsWithIpa = await Promise.all(
          errorWords.map(async (word) => ({
            word,
            ipa: await getIpaTranscription(word)
          }))
        );
        setWordErrors(errorWordsWithIpa);
        
        updatePerformanceStats(pronunciationScore, errorWordsWithIpa);
      } else {
        updatePerformanceStats(pronunciationScore, []);
      }
      
      setAttemptsLeft(prev => prev - 1);
    } catch (error) {
      console.error('Speech recognition error:', error);
      setUserTranscript('Không thể nhận diện giọng nói. Vui lòng thử lại.');
    } finally {
      setIsListening(false);
    }
  };

  const updatePerformanceStats = (newScore: number, newErrors: Array<{word: string, ipa: string}>) => {
    setPerformanceStats(prevStats => {
      const totalAttempts = prevStats.totalAttempts + 1;
      const totalScore = (prevStats.averageScore * prevStats.totalAttempts) + newScore;
      const averageScore = Math.round(totalScore / totalAttempts);
      
      const highestScore = Math.max(prevStats.highestScore, newScore);
      
      const mispronunciationCount = prevStats.mispronunciationCount + newErrors.length;
      
      const updatedMispronuncedWords = [...prevStats.mispronuncedWords];
      
      newErrors.forEach(({word, ipa}) => {
        const existingWordIndex = updatedMispronuncedWords.findIndex(
          item => item.word.toLowerCase() === word.toLowerCase()
        );
        
        if (existingWordIndex !== -1) {
          updatedMispronuncedWords[existingWordIndex].count += 1;
        } else {
          updatedMispronuncedWords.push({
            word,
            ipa,
            count: 1
          });
        }
      });
      
      updatedMispronuncedWords.sort((a, b) => b.count - a.count);
      
      const topMispronuncedWords = updatedMispronuncedWords.slice(0, 20);
      
      const newStats = {
        totalAttempts,
        averageScore,
        mispronunciationCount,
        highestScore,
        completedSteps: prevStats.completedSteps,
        mispronuncedWords: topMispronuncedWords
      };
      
      try {
        localStorage.setItem('hamaspeakPerformanceStats', JSON.stringify(newStats));
      } catch (error) {
        console.error('Error saving stats:', error);
      }
      
      return newStats;
    });
  };

  const handleFinish = () => {
    setCongratsVisible(true);
  };

  const handleBackToHome = () => {
    toast({
      title: 'Hoàn thành bài học!',
      description: 'Chúc mừng bạn đã hoàn thành tất cả các bước học.',
    });
    setCurrentStep(0);
  };

  const resetAttempts = () => {
    setAttemptsLeft(3);
    setUserTranscript('');
    setScore(null);
    setWordErrors([]);
  };

  const getPerformanceGrade = (): string => {
    const { averageScore, totalAttempts } = performanceStats;
    
    if (averageScore >= 90) return 'A+';
    if (averageScore >= 85) return 'A';
    if (averageScore >= 80) return 'B+';
    if (averageScore >= 75) return 'B';
    if (averageScore >= 70) return 'C+';
    if (averageScore >= 65) return 'C';
    if (averageScore >= 60) return 'D';
    return 'Cần cải thiện';
  };

  if (!analysisResult) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (congratsVisible) {
    return (
      <Card className="glass-card p-6 max-w-3xl mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Award className="h-16 w-16 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold text-gradient mb-2">Chúc mừng!</h2>
          <p className="text-lg text-gray-600">
            Bạn đã hoàn thành tất cả các bước học. Dưới đây là thống kê về hiệu suất của bạn.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold flex items-center mb-4">
              <BarChart2 className="h-5 w-5 mr-2 text-hamaspeak-purple" />
              Thống kê tổng quan
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Tổng số lần thử:</span>
                  <span>{performanceStats.totalAttempts}</span>
                </div>
                <Progress value={Math.min(100, performanceStats.totalAttempts * 10)} className="h-2 bg-gray-200" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Điểm trung bình:</span>
                  <span>{performanceStats.averageScore}%</span>
                </div>
                <Progress 
                  value={performanceStats.averageScore} 
                  className={`h-2 ${
                    performanceStats.averageScore > 80 ? 'bg-green-100' : 
                    performanceStats.averageScore > 60 ? 'bg-yellow-100' : 
                    'bg-orange-100'}`} 
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Điểm cao nhất:</span>
                  <span>{performanceStats.highestScore}%</span>
                </div>
                <Progress 
                  value={performanceStats.highestScore} 
                  className="h-2 bg-blue-100" 
                />
              </div>
              
              <div className="pt-4 border-t mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Xếp hạng chung:</span>
                  <span className="text-xl font-bold text-hamaspeak-purple">{getPerformanceGrade()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold flex items-center mb-4">
              <Sparkles className="h-5 w-5 mr-2 text-orange-500" />
              Top từ phát âm chưa đúng
            </h3>
            
            {performanceStats.mispronuncedWords.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {performanceStats.mispronuncedWords.slice(0, 10).map((errorWord, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium text-red-500">{errorWord.word}</span>
                      <span className="text-xs text-gray-500 ml-2">[{errorWord.ipa}]</span>
                    </div>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {errorWord.count}x
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <ThumbsUp className="h-10 w-10 mb-2" />
                <p>Không có lỗi phát âm nào được ghi nhận!</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={handleBackToHome}
            className="glass-button px-8"
          >
            Trở về trang chủ
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
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
          <p className="font-medium text-hamaspeak-purple mb-2">Đoạn văn tiếng Việt hoàn chỉnh:</p>
          <div className="text-lg bg-gray-50 p-4 rounded-lg leading-relaxed">
            {vietnameseText}
          </div>
          {fullText && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <details className="text-sm">
                <summary className="text-gray-500 cursor-pointer hover:text-hamaspeak-teal">
                  <span className="font-medium">Xem tiếng Anh gốc</span>
                </summary>
                <p className="mt-2 text-gray-600 p-2 bg-gray-50 rounded">
                  {fullText}
                </p>
              </details>
            </div>
          )}
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
                
                {wordErrors.length > 0 && (
                  <div className="mt-3 p-3 bg-orange-50 rounded-md">
                    <h4 className="text-sm font-medium mb-2">Từ cần cải thiện:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                      {wordErrors.map((error, index) => (
                        <div key={index} className="flex flex-col p-2 bg-white rounded shadow-sm">
                          <span className="font-medium text-red-500">{error.word}</span>
                          <div className="flex items-center text-xs text-gray-600 mt-1">
                            <span className="font-mono">[{error.ipa}]</span>
                            <button 
                              className="ml-auto text-blue-500 hover:text-blue-600 p-1"
                              onClick={() => speakText(error.word, selectedVoice, 0.8)}
                              title="Nghe lại từ này"
                            >
                              <Volume2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Nhấn vào biểu tượng loa để nghe lại từng từ.
                    </p>
                  </div>
                )}
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

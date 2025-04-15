
import React, { useState } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, Mic, ArrowRight, Loader2, Check, Info } from 'lucide-react';
import { speakText } from '@/utils/speechUtils';
import { Progress } from '@/components/ui/progress';
import PronunciationFeedback from './PronunciationFeedback';
import WordPronunciationPractice from './WordPronunciationPractice';
import { usePronunciationHandler } from './PronunciationHandler';

const Step3FillBlanks = () => {
  const { analysisResult, setCurrentStep, selectedVoice } = useStudy();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [showAnswer, setShowAnswer] = useState(false);
  const [wordErrors, setWordErrors] = useState<Array<{word: string; ipa: string}>>([]);
  const [showPronunciationFeedback, setShowPronunciationFeedback] = useState(false);
  const [pronunciationScores, setPronunciationScores] = useState({
    overallScore: 0,
    fluencyScore: 0,
    accuracyScore: 0,
    intonationScore: 0,
    stressScore: 0,
    rhythmScore: 0,
    wordErrorRate: 0
  });
  const [practicingWord, setPracticingWord] = useState<{word: string; ipa: string} | null>(null);
  
  // Use the pronunciation handler
  const { isProcessing: isListening, analyzePronunciation } = usePronunciationHandler();

  const currentPhrase = analysisResult?.phrases[currentPhraseIndex];

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
    
    setUserTranscript('');
    setScore(null);
    
    const result = await analyzePronunciation(currentPhrase.english, (result) => {
      setUserTranscript(result.transcript);
      
      // Set the numeric score for the UI
      setScore(result.scoreDetails.overallScore);
      
      // Set the detailed pronunciation scores
      setPronunciationScores(result.scoreDetails);
      
      // Set word errors for feedback
      setWordErrors(result.errorWords);
      
      // Decrement attempts
      setAttemptsLeft(prev => prev - 1);
    });
    
    if (!result) {
      setUserTranscript('Không thể nhận diện giọng nói. Vui lòng thử lại.');
    }
  };

  const handleNext = () => {
    if (currentPhraseIndex < (analysisResult?.phrases.length || 0) - 1) {
      setCurrentPhraseIndex(prev => prev + 1);
      setAttemptsLeft(3);
      setUserTranscript('');
      setScore(null);
      setShowAnswer(false);
      setShowPronunciationFeedback(false);
      setWordErrors([]);
    } else {
      // Move to next step when all phrases are complete
      setCurrentStep(4);
    }
  };

  const resetAttempts = () => {
    setAttemptsLeft(3);
    setUserTranscript('');
    setScore(null);
    setShowPronunciationFeedback(false);
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
    const result = await analyzePronunciation(word);
    if (result) {
      return { 
        transcript: result.transcript, 
        score: result.scoreDetails.overallScore 
      };
    }
    return { transcript: 'Không thể nhận diện', score: 0 };
  };

  if (!analysisResult || !currentPhrase) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = ((currentPhraseIndex + 1) / analysisResult.phrases.length) * 100;

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
        <h2 className="text-2xl font-bold text-gradient mb-2">Bước 3: Điền vào chỗ trống</h2>
        <p className="text-gray-600">
          Nghe và hoàn thành các câu có từ bị khuyết
        </p>
      </div>

      <div className="mb-6 bg-gray-200 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-hamaspeak-blue to-hamaspeak-purple h-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
        <div className="mb-4 text-center">
          <h3 className="text-xl font-medium text-hamaspeak-dark mb-2">
            {currentPhrase.fillInBlanks}
          </h3>
          
          {showAnswer && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <Check className="h-4 w-4 text-green-500 inline mr-1" />
              <p className="text-hamaspeak-blue font-medium inline">
                {currentPhrase.english}
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
                  {score > 80 ? 'Tuyệt vời! Phát âm của bạn rất chuẩn.' :
                   score > 60 ? 'Khá tốt! Tiếp tục luyện tập.' :
                   'Hãy thử lại và cải thiện phát âm của bạn.'}
                </p>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPronunciationFeedback(!showPronunciationFeedback)}
                  className="mt-2"
                >
                  <Info className="mr-2 h-4 w-4 text-blue-500" />
                  {showPronunciationFeedback ? 'Ẩn phân tích chi tiết' : 'Xem phân tích chi tiết'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {showPronunciationFeedback && score !== null && (
        <PronunciationFeedback
          scoreDetails={pronunciationScores}
          feedback={feedbackData}
          onPracticeWord={handlePracticeWord}
          onPlayReference={handleWordPlayReference}
          transcript={userTranscript}
          referenceText={currentPhrase.english}
        />
      )}
      
      {practicingWord && (
        <div className="mb-6">
          <WordPronunciationPractice
            word={practicingWord.word}
            ipa={practicingWord.ipa}
            onClose={() => setPracticingWord(null)}
            onPlayReference={handleWordPlayReference}
            onListen={handleWordListen}
            videoTutorialUrl="#"
            examples={[
              { 
                text: `Example: ${practicingWord.word} is important.`, 
                translation: `Ví dụ: ${practicingWord.word} là quan trọng.` 
              }
            ]}
            tips={[
              "Chú ý đến trọng âm của từ",
              "Tập trung vào các nguyên âm chính xác"
            ]}
          />
        </div>
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
          {currentPhraseIndex < analysisResult.phrases.length - 1 
            ? 'Tiếp tục' 
            : 'Bước tiếp theo'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default Step3FillBlanks;

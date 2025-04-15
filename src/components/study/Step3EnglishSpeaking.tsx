
import React, { useState, useEffect } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, Mic, ArrowRight, Loader2, Info, VolumeX, MicOff, Check, X, HelpCircle } from 'lucide-react';
import { speakText, stopSpeechRecognition } from '@/utils/speechUtils';
import { Progress } from '@/components/ui/progress';
import PronunciationFeedback from './PronunciationFeedback';
import WordPronunciationPractice from './WordPronunciationPractice';
import { useToast } from '@/hooks/use-toast';
import { usePronunciationHandler } from './PronunciationHandler';

interface Step3EnglishSpeakingProps {
  onAnalyzePronunciation?: (text: string, audioBlob?: Blob) => Promise<any>;
}

const Step3EnglishSpeaking: React.FC<Step3EnglishSpeakingProps> = ({
  onAnalyzePronunciation
}) => {
  const { analysisResult, setCurrentStep, selectedVoice } = useStudy();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [scoreDetails, setScoreDetails] = useState<any>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [showFeedback, setShowFeedback] = useState(false);
  const [wordErrors, setWordErrors] = useState<Array<{word: string; ipa: string}>>([]);
  const [practicingWord, setPracticingWord] = useState<{word: string; ipa: string} | null>(null);
  const { toast } = useToast();
  const { isProcessing: isListening, analyzePronunciation } = usePronunciationHandler();

  const currentPhrase = analysisResult?.phrases[currentPhraseIndex];

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopSpeechRecognition();
    };
  }, []);

  const handleSpeak = async () => {
    if (!currentPhrase || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      await speakText(currentPhrase.english, selectedVoice);
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
    if (isListening || !currentPhrase) return;
    
    setUserTranscript('');
    setScoreDetails(null);
    setShowFeedback(false);
    
    const result = await analyzePronunciation(currentPhrase.english, (result) => {
      setUserTranscript(result.transcript);
      setScoreDetails(result.scoreDetails);
      setWordErrors(result.errorWords);
      setAttemptsLeft(prev => prev - 1);
    });
    
    if (result && onAnalyzePronunciation) {
      await onAnalyzePronunciation(currentPhrase.english);
    }
  };

  const handleNext = () => {
    if (currentPhraseIndex < (analysisResult?.phrases.length || 0) - 1) {
      setCurrentPhraseIndex(prev => prev + 1);
      setAttemptsLeft(3);
      setUserTranscript('');
      setScoreDetails(null);
      setShowFeedback(false);
      setWordErrors([]);
    } else {
      // Move to next step when all phrases are complete
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
    const result = await analyzePronunciation(word);
    if (result) {
      return { transcript: result.transcript, score: result.scoreDetails.overallScore };
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
  
  // Build pronunciation feedback data
  const feedbackData = wordErrors.map(wordError => ({
    word: wordError.word,
    ipa: wordError.ipa,
    correct: false,
    suggestedIpa: wordError.ipa,
    videoTutorialUrl: `https://youtu.be/pronunciation-guide-${wordError.word}`
  }));

  return (
    <Card className="glass-card p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">Bước 3: Luyện Nói Tiếng Anh (Input)</h2>
        <p className="text-gray-600">
          Luyện phát âm từng cụm từ tiếng Anh từ bản gốc
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
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            Luyện phát âm từng từ
          </div>
          <h3 className="text-2xl font-medium text-hamaspeak-blue">
            {currentPhrase.english}
          </h3>
          <div className="text-sm text-gray-500 mt-1 font-mono">
            {/* Show IPA pronunciation if available */}
            {currentPhrase.ipa || ""}
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button 
              onClick={handleSpeak} 
              disabled={isSpeaking}
              className="relative overflow-hidden group"
              size="lg"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="mr-2 h-5 w-5 animate-pulse" />
                  Đang phát...
                </>
              ) : (
                <>
                  <Volume2 className="mr-2 h-5 w-5" />
                  Nghe mẫu
                </>
              )}
              <span className="absolute inset-0 bg-blue-400/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            </Button>
          </div>
        </div>
        
        {userTranscript && (
          <div className="mt-6 pt-4 border-t">
            <div className="mb-2 flex justify-between items-center">
              <p className="font-medium">Câu của bạn:</p>
              <div>
                {scoreDetails && (
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Điểm: {scoreDetails.overallScore}/100</span>
                    {scoreDetails.overallScore >= 80 ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <p className={`p-3 rounded-md ${
              scoreDetails?.overallScore >= 80 
                ? 'bg-green-50 text-green-700' 
                : 'bg-orange-50 text-orange-700'
            }`}>
              {userTranscript}
            </p>
            
            {scoreDetails && (
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Điểm tổng thể:</span>
                  <span>{scoreDetails.overallScore}%</span>
                </div>
                <Progress 
                  value={scoreDetails.overallScore} 
                  className={`h-2.5 ${
                    scoreDetails.overallScore > 80 ? 'bg-green-100' : 
                    scoreDetails.overallScore > 60 ? 'bg-yellow-100' : 
                    'bg-orange-100'}`} 
                />
                
                <p className="mt-2 text-sm">
                  {scoreDetails.overallScore > 90 ? 'Tuyệt vời! Phát âm của bạn rất chuẩn.' :
                   scoreDetails.overallScore > 80 ? 'Rất tốt! Tiếp tục duy trì.' :
                   scoreDetails.overallScore > 60 ? 'Khá tốt! Tiếp tục luyện tập.' :
                   'Hãy lắng nghe và thử lại để cải thiện phát âm.'}
                </p>
                
                <div className="flex mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFeedback(!showFeedback)}
                    className="mr-2"
                  >
                    <Info className="mr-1 h-4 w-4 text-blue-500" />
                    {showFeedback ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <img 
                      src="/lovable-uploads/e18c16ba-65ea-46f6-b13e-e2216e5d0616.png" 
                      alt="Visual pronunciation guide" 
                      className="mr-1 h-4 w-4" 
                    />
                    Hỗ trợ phát âm
                  </Button>
                </div>
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
          onClick={handleListen} 
          disabled={isListening || attemptsLeft <= 0}
          className="bg-hamaspeak-teal hover:bg-hamaspeak-teal/90"
          size="lg"
        >
          {isListening ? (
            <>
              <MicOff className="mr-2 h-5 w-5 animate-pulse" />
              Đang nghe...
            </>
          ) : (
            <>
              <Mic className="mr-2 h-5 w-5" />
              Nói theo
            </>
          )}
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
          disabled={attemptsLeft === 3 && !scoreDetails}
          className="bg-hamaspeak-blue hover:bg-hamaspeak-blue/90"
          size="lg"
        >
          {currentPhraseIndex < analysisResult.phrases.length - 1 
            ? 'Cụm từ tiếp theo' 
            : 'Bước tiếp theo'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-6 flex justify-center">
        <Button variant="link" size="sm" className="text-xs text-gray-500">
          <HelpCircle className="h-3 w-3 mr-1" />
          Hướng dẫn phát âm
        </Button>
      </div>
    </Card>
  );
};

export default Step3EnglishSpeaking;

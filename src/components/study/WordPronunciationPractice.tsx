
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Volume2,
  Mic,
  MicOff,
  Video,
  ThumbsUp,
  ThumbsDown,
  RefreshCcw,
  X,
  RepeatIcon,
  InfoIcon,
  CheckCircle,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from "@/components/ui/badge";

interface WordPronunciationPracticeProps {
  word: string;
  ipa: string;
  onClose: () => void;
  onPlayReference: (word: string) => void;
  onListen: (word: string) => Promise<{ transcript: string; score: number }>;
  videoTutorialUrl?: string;
  examples?: { text: string; translation: string }[];
  tips?: string[];
}

const WordPronunciationPractice: React.FC<WordPronunciationPracticeProps> = ({
  word,
  ipa,
  onClose,
  onPlayReference,
  onListen,
  videoTutorialUrl,
  examples = [],
  tips = [],
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [attempts, setAttempts] = useState<{ score: number; transcript: string }[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [showTips, setShowTips] = useState(false);
  
  // Start listening for pronunciation
  const handleListen = async () => {
    if (isListening) return;
    
    setIsListening(true);
    try {
      const result = await onListen(word);
      setAttempts([...attempts, result]);
      setCurrentAttempt(attempts.length);
    } catch (error) {
      console.error('Error during speech recognition:', error);
    } finally {
      setIsListening(false);
    }
  };
  
  // Play reference audio
  const handlePlayReference = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    await onPlayReference(word);
    setIsPlaying(false);
  };
  
  // Get the last attempt or undefined if no attempts yet
  const latestAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : undefined;
  
  // Get score category
  const getScoreCategory = (score: number) => {
    if (score >= 90) return { text: 'Xuất sắc', color: 'bg-green-500' };
    if (score >= 80) return { text: 'Tốt', color: 'bg-green-400' };
    if (score >= 70) return { text: 'Khá', color: 'bg-yellow-400' };
    if (score >= 60) return { text: 'Trung bình', color: 'bg-orange-400' };
    return { text: 'Cần cải thiện', color: 'bg-red-400' };
  };
  
  const getMouthPosition = (word: string) => {
    // Simple mouthshape guidance based on first character
    const firstChar = word.charAt(0).toLowerCase();
    
    if (['a', 'e', 'i', 'o', 'u'].includes(firstChar)) {
      return "Hơi mở rộng môi, hơi căng";
    } else if (['b', 'p', 'm'].includes(firstChar)) {
      return "Đóng hai môi lại, sau đó bung ra";
    } else if (['f', 'v'].includes(firstChar)) {
      return "Đặt răng trên nhẹ vào môi dưới";
    } else if (['t', 'd', 'n'].includes(firstChar)) {
      return "Đặt lưỡi lên sau răng cửa trên";
    } else if (['s', 'z'].includes(firstChar)) {
      return "Đặt lưỡi gần răng cửa, tạo khe hẹp";
    } else if (['r'].includes(firstChar)) {
      return "Cuộn lưỡi nhẹ về phía sau, không chạm vào bất kỳ phần nào của miệng";
    } else if (['l'].includes(firstChar)) {
      return "Đặt đầu lưỡi lên phía sau răng cửa trên";
    }
    
    return "Phát âm tự nhiên, lưu ý nghe mẫu để bắt chước";
  };

  return (
    <Card className="p-4 border-2 border-blue-100 animate-fade-in max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-blue-700">Luyện từ: <span className="font-bold">{word}</span></h3>
        <Button size="icon" variant="ghost" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Pronunciation guide */}
      <div className="bg-blue-50 p-3 rounded-lg mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="font-medium">Phát âm chuẩn:</div>
          <Badge variant="outline" className="font-mono">
            [{ipa}]
          </Badge>
        </div>
        
        <div className="flex gap-2 mt-3">
          <Button 
            onClick={handlePlayReference}
            disabled={isPlaying} 
            size="sm"
            className="flex-1"
          >
            {isPlaying ? (
              <>Đang phát...</>
            ) : (
              <><Volume2 className="mr-2 h-3 w-3" /> Nghe mẫu</>
            )}
          </Button>
          
          {videoTutorialUrl && (
            <Button 
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Video className="mr-2 h-3 w-3" /> Video hướng dẫn
            </Button>
          )}
        </div>
        
        <div className="mt-3 text-sm">
          <Button 
            variant="link" 
            size="sm" 
            className="p-0 h-auto text-blue-600"
            onClick={() => setShowTips(!showTips)}
          >
            <InfoIcon className="h-3 w-3 mr-1" /> 
            {showTips ? 'Ẩn hướng dẫn phát âm' : 'Xem hướng dẫn phát âm'}
          </Button>
          
          {showTips && (
            <div className="mt-2 bg-white p-2 rounded-md">
              <div>
                <span className="font-medium">Vị trí miệng:</span> {getMouthPosition(word)}
              </div>
              <div className="mt-1">
                <span className="font-medium">Trọng âm:</span> {word.length > 1 ? "Nhấn mạnh âm tiết đầu tiên" : "Nhấn rõ âm"}
              </div>
              {tips.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-xs">
                  {tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Practice section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Luyện tập:</h4>
          <Badge variant="outline" className="text-xs">
            Lần thử {attempts.length + 1}
          </Badge>
        </div>
        
        <Button 
          onClick={handleListen}
          disabled={isListening}
          className={`w-full ${isListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
        >
          {isListening ? (
            <><MicOff className="mr-2 h-4 w-4 animate-pulse" /> Dừng ghi âm</>
          ) : (
            <><Mic className="mr-2 h-4 w-4" /> Bắt đầu nói</>
          )}
        </Button>
        
        {/* Latest attempt result */}
        {latestAttempt && (
          <div className="mt-3">
            <div className="flex justify-between items-center mt-2 mb-1">
              <span className="text-sm">Kết quả:</span>
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">{latestAttempt.score}%</span>
                {latestAttempt.score >= 80 ? (
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ThumbsDown className="h-4 w-4 text-orange-500" />
                )}
              </div>
            </div>
            
            <Progress 
              value={latestAttempt.score} 
              className={`h-2 ${
                latestAttempt.score >= 80 ? 'bg-green-100' : 
                latestAttempt.score >= 60 ? 'bg-yellow-100' : 
                'bg-orange-100'
              }`} 
            />
            
            <div className="mt-2 text-sm">
              <span className="font-medium">Bạn nói:</span>
              <div className="bg-gray-50 p-2 rounded mt-1">
                {latestAttempt.transcript || word}
                {latestAttempt.score >= 90 && (
                  <CheckCircle className="inline-block ml-1 h-3 w-3 text-green-500" />
                )}
              </div>
            </div>
            
            {latestAttempt.score < 80 && (
              <div className="mt-2 bg-yellow-50 p-2 rounded text-xs">
                <p className="font-medium">Gợi ý:</p>
                <ul className="list-disc pl-4 mt-1">
                  <li>Chú ý đến âm đầu/cuối của từ</li>
                  <li>Nghe lại mẫu và cố gắng bắt chước chính xác</li>
                  <li>Phát âm chậm rãi và rõ ràng hơn</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Example usage */}
      {examples.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Ví dụ:</h4>
          <div className="bg-gray-50 rounded-md p-2 space-y-2 max-h-36 overflow-y-auto">
            {examples.map((example, i) => (
              <div key={i} className="text-sm">
                <p className="font-medium">{example.text}</p>
                <p className="text-gray-600 text-xs">{example.translation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className="flex justify-between mt-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setAttempts([]);
            setCurrentAttempt(0);
          }}
          disabled={attempts.length === 0}
        >
          <RefreshCcw className="mr-2 h-3 w-3" /> Làm lại
        </Button>
        
        <Button 
          size="sm"
          disabled={attempts.length === 0 || latestAttempt?.score < 70}
          className="bg-green-500 hover:bg-green-600"
        >
          <CheckCircle className="mr-2 h-3 w-3" /> Hoàn thành
        </Button>
      </div>
      
      {/* Progress history */}
      {attempts.length > 1 && (
        <div className="mt-4">
          <h4 className="text-xs font-medium mb-1">Lịch sử luyện tập:</h4>
          <div className="flex h-6 bg-gray-100 rounded-full overflow-hidden">
            {attempts.map((attempt, i) => (
              <div 
                key={i}
                className={`h-full flex-1 flex items-center justify-center cursor-pointer ${
                  i === currentAttempt ? 'border-2 border-blue-500' : ''
                } ${
                  attempt.score >= 90 ? 'bg-green-500' :
                  attempt.score >= 80 ? 'bg-green-400' :
                  attempt.score >= 70 ? 'bg-yellow-400' :
                  attempt.score >= 60 ? 'bg-orange-400' :
                  'bg-red-400'
                }`}
                onClick={() => setCurrentAttempt(i)}
              >
                <span className="text-white text-xs font-bold">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default WordPronunciationPractice;


import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Info,
  HelpCircle,
  Volume2,
  Lightbulb,
  MoveDown,
  ArrowRight,
  Play,
  CheckCircle2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScoreDetails {
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  intonationScore: number;
  stressScore: number;
  rhythmScore: number;
  wordErrorRate?: number;
}

interface WordFeedback {
  word: string;
  ipa: string;
  correct: boolean;
  suggestedIpa?: string;
  videoTutorialUrl?: string;
}

interface PronunciationFeedbackProps {
  scoreDetails: ScoreDetails;
  feedback: WordFeedback[];
  onPracticeWord?: (word: string) => void;
  onPlayReference?: (word: string) => void;
  transcript: string;
  referenceText: string;
}

const PronunciationFeedback: React.FC<PronunciationFeedbackProps> = ({
  scoreDetails,
  feedback,
  onPracticeWord,
  onPlayReference,
  transcript,
  referenceText
}) => {
  const [selectedTab, setSelectedTab] = useState("overview");

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-green-400";
    if (score >= 70) return "bg-yellow-400";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 50) return "bg-orange-400";
    return "bg-red-400";
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return "Xuất sắc";
    if (score >= 80) return "Tốt";
    if (score >= 70) return "Khá";
    if (score >= 60) return "Trung bình";
    if (score >= 50) return "Cần cải thiện";
    return "Yếu";
  };

  // Create comparison display between reference and user transcript
  const compareTexts = () => {
    const referenceWords = referenceText.split(/\s+/);
    const userWords = transcript.split(/\s+/);
    
    // Find missed or incorrect words
    const wordComparisons = referenceWords.map((refWord, i) => {
      const cleanRefWord = refWord.toLowerCase().replace(/[.,!?;:]/g, '');
      const userWord = userWords[i]?.toLowerCase().replace(/[.,!?;:]/g, '');
      
      // Check if words match
      const isMatch = userWord === cleanRefWord;
      
      // Check if word is in user transcript somewhere
      const isInUserTranscript = userWords.some(w => 
        w.toLowerCase().replace(/[.,!?;:]/g, '') === cleanRefWord
      );
      
      return {
        reference: refWord,
        user: userWord || '',
        isMatch,
        isInUserTranscript
      };
    });
    
    return wordComparisons;
  };

  const wordComparisons = compareTexts();
  
  // Format pronunciation suggestions based on feedback
  const getPronunciationTip = (word: string) => {
    // Common difficult English sounds for Vietnamese speakers
    const difficultSounds: Record<string, string> = {
      'th': 'Đặt đầu lưỡi giữa răng, không phải /t/ hoặc /s/',
      'ch': 'Phát âm như "tsh", không phải /c/ trong tiếng Việt',
      'j': 'Phát âm như "dzh", không phải như /d/ trong tiếng Việt',
      'r': 'Cuộn lưỡi lại, không phát âm như /z/ trong tiếng Việt',
      'l': 'Đặt đầu lưỡi chạm vào mái vọng, không phát âm như /l/ trong tiếng Việt',
      'v': 'Răng cắn nhẹ môi dưới, không phát âm như /j/ trong tiếng Việt',
      'z': 'Như /s/ nhưng với sự rung của dây thanh quản',
      'sh': 'Như /s/ nhưng lưỡi đặt xa hơn',
      'w': 'Môi tròn như phát âm /u/, không phát như /qu/ trong tiếng Việt',
      'ed': 'Chú ý cách phát âm đuôi -ed, có thể là /t/, /d/ hoặc /id/'
    };
    
    // Check if word contains any difficult sounds
    for (const [sound, tip] of Object.entries(difficultSounds)) {
      if (word.toLowerCase().includes(sound)) {
        return tip;
      }
    }
    
    return "Chú ý phát âm rõ ràng từng âm tiết";
  };

  return (
    <Card className="p-4 mb-6 border-2 border-blue-100 animate-fade-in">
      <h3 className="font-bold mb-2 flex items-center">
        <Info className="h-4 w-4 mr-2 text-blue-500" />
        Chi tiết phân tích phát âm
      </h3>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="details">Chi tiết</TabsTrigger>
          <TabsTrigger value="tips">Hướng dẫn</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Điểm tổng thể:</span>
            <Badge variant="outline" className={`font-medium ${scoreDetails.overallScore >= 80 ? 'text-green-600' : scoreDetails.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {scoreDetails.overallScore}% - {getScoreText(scoreDetails.overallScore)}
            </Badge>
          </div>
          
          <Progress value={scoreDetails.overallScore} className="h-2" />
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <div className="text-sm flex justify-between">
                <span>Độ chính xác</span>
                <span>{scoreDetails.accuracyScore}%</span>
              </div>
              <Progress value={scoreDetails.accuracyScore} className={`h-1.5 ${getScoreColor(scoreDetails.accuracyScore)}`} />
            </div>
            
            <div>
              <div className="text-sm flex justify-between">
                <span>Độ trôi chảy</span>
                <span>{scoreDetails.fluencyScore}%</span>
              </div>
              <Progress value={scoreDetails.fluencyScore} className={`h-1.5 ${getScoreColor(scoreDetails.fluencyScore)}`} />
            </div>
            
            <div>
              <div className="text-sm flex justify-between">
                <span>Ngữ điệu</span>
                <span>{scoreDetails.intonationScore}%</span>
              </div>
              <Progress value={scoreDetails.intonationScore} className={`h-1.5 ${getScoreColor(scoreDetails.intonationScore)}`} />
            </div>
            
            <div>
              <div className="text-sm flex justify-between">
                <span>Trọng âm</span>
                <span>{scoreDetails.stressScore}%</span>
              </div>
              <Progress value={scoreDetails.stressScore} className={`h-1.5 ${getScoreColor(scoreDetails.stressScore)}`} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="details">
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">So sánh phát âm:</h4>
              <div className="space-y-2">
                <div className="bg-white rounded p-2">
                  <div className="text-xs text-gray-500 mb-1">Bản gốc:</div>
                  <div className="flex flex-wrap gap-1">
                    {wordComparisons.map((comp, i) => (
                      <span 
                        key={`ref-${i}`}
                        className={`px-1 rounded ${!comp.isInUserTranscript ? 'bg-red-100' : ''}`}
                        title={!comp.isInUserTranscript ? "Từ này bị thiếu trong phát âm của bạn" : ""}
                      >
                        {comp.reference}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded p-2">
                  <div className="text-xs text-gray-500 mb-1">Phát âm của bạn:</div>
                  <div className="flex flex-wrap gap-1">
                    {transcript.split(/\s+/).map((word, i) => (
                      <span 
                        key={`user-${i}`} 
                        className={`px-1 rounded ${
                          !referenceText.toLowerCase().includes(word.toLowerCase().replace(/[.,!?;:]/g, '')) 
                            ? 'bg-yellow-100' 
                            : ''
                        }`}
                        title={
                          !referenceText.toLowerCase().includes(word.toLowerCase().replace(/[.,!?;:]/g, ''))
                            ? "Từ này không có trong bản gốc"
                            : ""
                        }
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex text-xs">
                <div className="flex items-center mr-3">
                  <span className="inline-block w-3 h-3 bg-red-100 rounded mr-1"></span>
                  <span>Từ bị thiếu</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-yellow-100 rounded mr-1"></span>
                  <span>Từ thừa/sai</span>
                </div>
              </div>
            </div>
            
            {feedback.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Từ cần luyện tập:</h4>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {feedback.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div>
                        <span className="font-medium">{item.word}</span>
                        <span className="text-xs text-gray-500 ml-1">[{item.ipa}]</span>
                      </div>
                      <div className="flex gap-1">
                        {onPlayReference && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 w-7 p-1"
                            onClick={() => onPlayReference(item.word)}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {onPracticeWord && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => onPracticeWord(item.word)}
                          >
                            Luyện tập
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="tips">
          <div className="space-y-3">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <h4 className="font-medium flex items-center">
                <Lightbulb className="h-4 w-4 mr-1 text-yellow-500" />
                Gợi ý cải thiện phát âm
              </h4>
              
              <ul className="mt-2 space-y-2 text-sm">
                {scoreDetails.accuracyScore < 80 && (
                  <li className="flex">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
                    <span>Tập trung vào việc phát âm đúng từng từ, đặc biệt là những từ dài</span>
                  </li>
                )}
                
                {scoreDetails.fluencyScore < 80 && (
                  <li className="flex">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
                    <span>Luyện tập đọc to và trôi chảy hơn, hạn chế dừng giữa câu</span>
                  </li>
                )}
                
                {scoreDetails.intonationScore < 80 && (
                  <li className="flex">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
                    <span>Chú ý ngữ điệu lên xuống tự nhiên khi nói câu hỏi hoặc câu khẳng định</span>
                  </li>
                )}
                
                {scoreDetails.stressScore < 80 && (
                  <li className="flex">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
                    <span>Nhấn mạnh đúng âm tiết trong từ nhiều âm tiết (ví dụ: im-POR-tant, not IM-por-tant)</span>
                  </li>
                )}
                
                <li className="flex">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
                  <span>Nghe và bắt chước người bản xứ nhiều lần trước khi thử nói</span>
                </li>
                
                <li className="flex">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
                  <span>Ghi âm và so sánh phát âm của bạn với bản gốc</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium flex items-center">
                <HelpCircle className="h-4 w-4 mr-1 text-blue-500" />
                Tài nguyên bổ sung
              </h4>
              
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center">
                  <Play className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                  <a 
                    href="https://youtu.be/n4NVPg2kHv4" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Video: Cách phát âm tiếng Anh chuẩn
                  </a>
                </div>
                
                <div className="flex items-center">
                  <Play className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                  <a 
                    href="https://youtu.be/9M8akT2_WDI" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Video: Bí quyết phát âm đúng ngữ điệu
                  </a>
                </div>
                
                <div className="flex items-center">
                  <MoveDown className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                  <a 
                    href="https://www.bbc.co.uk/learningenglish/english/features/pronunciation" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    BBC Learning English: Pronunciation
                  </a>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs h-8">
                <Info className="h-3 w-3 mr-1" />
                Về phân tích phát âm
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Phân tích dựa trên so sánh phát âm của bạn với bản chuẩn, đánh giá nhiều yếu tố như độ chính xác, trọng âm và ngữ điệu.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button size="sm" variant="outline" className="text-xs h-8 flex items-center">
          <img 
            src="/lovable-uploads/c3146207-9ae1-4262-99d7-da87abd01610.png" 
            alt="Pronunciation guide" 
            className="h-4 w-4 mr-1" 
          />
          Xem biểu đồ phát âm
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
};

export default PronunciationFeedback;

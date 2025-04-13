
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Mic,
  Volume2,
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Share2,
  Video
} from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types for pronunciation feedback
export interface PronunciationScoreDetails {
  overallScore: number;
  fluencyScore: number;
  accuracyScore: number;
  intonationScore: number;
  stressScore: number;
  rhythmScore: number;
  wordErrorRate: number;
}

export interface PronunciationFeedback {
  word: string;
  ipa: string;
  correct: boolean;
  suggestedIpa?: string;
  audioUrl?: string;
  videoTutorialUrl?: string;
}

interface PronunciationFeedbackProps {
  scoreDetails: PronunciationScoreDetails;
  feedback: PronunciationFeedback[];
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
  referenceText,
}) => {
  const [showAllDetails, setShowAllDetails] = useState(false);
  
  // Calculate score category
  const getScoreCategory = (score: number) => {
    if (score >= 90) return { text: 'Xuất sắc', color: 'bg-green-500' };
    if (score >= 80) return { text: 'Tốt', color: 'bg-green-400' };
    if (score >= 70) return { text: 'Khá', color: 'bg-yellow-400' };
    if (score >= 60) return { text: 'Trung bình', color: 'bg-orange-400' };
    return { text: 'Cần cải thiện', color: 'bg-red-400' };
  };

  const scoreCategory = getScoreCategory(scoreDetails.overallScore);
  
  // Group feedback by correctness
  const correctWords = feedback.filter(item => item.correct);
  const incorrectWords = feedback.filter(item => !item.correct);

  return (
    <Card className="p-4 mt-4 border-2 border-gray-200 animate-fade-in">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">Đánh giá phát âm của bạn</h3>
          <Badge className={`${scoreCategory.color.replace('bg-', 'bg-opacity-80 bg-')} text-white`}>
            {scoreCategory.text}
          </Badge>
        </div>
        
        {/* Overall score section */}
        <div className="bg-gray-50 p-3 rounded-lg mb-3">
          <div className="flex justify-between mb-1">
            <span className="font-medium">Điểm tổng thể:</span>
            <span className="font-bold">{scoreDetails.overallScore}%</span>
          </div>
          <Progress 
            value={scoreDetails.overallScore} 
            className={`h-2.5 ${
              scoreDetails.overallScore > 80 ? 'bg-green-100' : 
              scoreDetails.overallScore > 60 ? 'bg-yellow-100' : 
              'bg-orange-100'
            }`}
          />
        </div>
      </div>
      
      {/* Transcript comparison */}
      <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm">
        <div className="mb-2">
          <span className="font-medium">Nội dung mẫu:</span>
          <p className="pl-2 border-l-2 border-blue-400 ml-1 mt-1">
            {referenceText}
          </p>
        </div>
        <div>
          <span className="font-medium">Nội dung của bạn:</span>
          <p className="pl-2 border-l-2 border-green-400 ml-1 mt-1">
            {transcript}
          </p>
        </div>
      </div>
      
      {/* Detailed scores accordion */}
      <Accordion type="single" collapsible className="mb-4">
        <AccordionItem value="detailed-scores">
          <AccordionTrigger className="text-sm font-medium">
            Chi tiết điểm phát âm
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <span>Độ chính xác</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Đánh giá mức độ chính xác của từng âm tiết khi phát âm</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="font-medium">{scoreDetails.accuracyScore}%</span>
              </div>
              <Progress value={scoreDetails.accuracyScore} className="h-1.5" />
              
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-1">
                  <span>Ngữ điệu</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Đánh giá sự lên xuống giọng đúng chỗ</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="font-medium">{scoreDetails.intonationScore}%</span>
              </div>
              <Progress value={scoreDetails.intonationScore} className="h-1.5" />
              
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-1">
                  <span>Trọng âm</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Đánh giá việc nhấn trọng âm đúng vị trí trong từ và câu</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="font-medium">{scoreDetails.stressScore}%</span>
              </div>
              <Progress value={scoreDetails.stressScore} className="h-1.5" />
              
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-1">
                  <span>Nhịp điệu</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Đánh giá sự trôi chảy và nhịp điệu tự nhiên của câu nói</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="font-medium">{scoreDetails.rhythmScore}%</span>
              </div>
              <Progress value={scoreDetails.rhythmScore} className="h-1.5" />
              
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-1">
                  <span>Độ trôi chảy</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Khả năng nói trôi chảy, không ngắt quãng</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="font-medium">{scoreDetails.fluencyScore}%</span>
              </div>
              <Progress value={scoreDetails.fluencyScore} className="h-1.5" />
            </div>
            
            {/* Visual chart representation */}
            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
                <BarChart className="h-3 w-3" /> Xem biểu đồ chi tiết
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {/* Word-level feedback */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-sm">Phân tích từng từ</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAllDetails(!showAllDetails)}
            className="h-7 text-xs"
          >
            {showAllDetails ? (
              <><ChevronUp className="h-3 w-3 mr-1" /> Ẩn bớt</>
            ) : (
              <><ChevronDown className="h-3 w-3 mr-1" /> Xem tất cả</>
            )}
          </Button>
        </div>
        
        {incorrectWords.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Từ cần cải thiện ({incorrectWords.length}):</span>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
              {incorrectWords.slice(0, showAllDetails ? undefined : 4).map((item, idx) => (
                <div key={idx} className="bg-orange-50 p-2 rounded-md text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{item.word}</span>
                    <div className="flex gap-1">
                      {onPlayReference && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-5 w-5"
                          onClick={() => onPlayReference(item.word)}
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      )}
                      {item.videoTutorialUrl && (
                        <Button size="icon" variant="ghost" className="h-5 w-5">
                          <Video className="h-3 w-3 text-blue-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col text-xs">
                    <div className="flex items-center">
                      <span className="mr-1">IPA đúng:</span>
                      <span className="font-mono bg-white px-1 rounded">[{item.ipa}]</span>
                    </div>
                    {item.suggestedIpa && (
                      <div className="flex items-center mt-1">
                        <span className="mr-1">Bạn phát âm:</span>
                        <span className="font-mono bg-white px-1 rounded">[{item.suggestedIpa}]</span>
                      </div>
                    )}
                    {onPracticeWord && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2 h-7 text-xs"
                        onClick={() => onPracticeWord(item.word)}
                      >
                        <Mic className="h-3 w-3 mr-1" /> Luyện tập
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {incorrectWords.length > 4 && !showAllDetails && (
              <div className="text-center mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => setShowAllDetails(true)}
                >
                  + Xem thêm {incorrectWords.length - 4} từ
                </Button>
              </div>
            )}
          </div>
        )}
        
        {correctWords.length > 0 && showAllDetails && (
          <div className="mb-3">
            <div className="flex items-center gap-1 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Từ phát âm tốt ({correctWords.length}):</span>
            </div>
            <div className="grid grid-cols-3 gap-2 max-h-24 overflow-y-auto">
              {correctWords.map((item, idx) => (
                <div key={idx} className="bg-green-50 p-2 rounded-md text-xs flex justify-between items-center">
                  <span>{item.word}</span>
                  <span className="font-mono text-green-600">[{item.ipa}]</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Suggestions for improvement */}
      <Accordion type="single" collapsible className="mb-4">
        <AccordionItem value="improvement-tips">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-1">
              <Info className="h-4 w-4 text-blue-500" />
              Gợi ý cải thiện
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {scoreDetails.accuracyScore < 80 && (
                <div className="bg-blue-50 p-2 rounded-md">
                  <h5 className="text-sm font-medium mb-1">Cải thiện độ chính xác:</h5>
                  <ul className="text-xs list-disc pl-4 space-y-1">
                    <li>Tập trung vào từng âm cơ bản, đặc biệt là các nguyên âm và phụ âm khó</li>
                    <li>Dành thời gian luyện tập các từ đơn trước khi chuyển sang cụm từ dài</li>
                    <li>Tập phân biệt các cặp âm thường bị nhầm lẫn như /p/-/b/, /t/-/d/, /s/-/sh/</li>
                    <li>
                      <Button variant="link" className="h-5 p-0 text-xs text-blue-600" asChild>
                        <a href="#" target="_blank">Xem video hướng dẫn phát âm chuẩn</a>
                      </Button>
                    </li>
                  </ul>
                </div>
              )}
              
              {scoreDetails.intonationScore < 80 && (
                <div className="bg-blue-50 p-2 rounded-md">
                  <h5 className="text-sm font-medium mb-1">Cải thiện ngữ điệu:</h5>
                  <ul className="text-xs list-disc pl-4 space-y-1">
                    <li>Lắng nghe và bắt chước ngữ điệu của người bản xứ</li>
                    <li>Chú ý các từ được nhấn mạnh để thể hiện cảm xúc và ý nghĩa</li>
                    <li>Ghi âm và so sánh ngữ điệu của bạn với bản gốc</li>
                    <li>
                      <Button variant="link" className="h-5 p-0 text-xs text-blue-600" asChild>
                        <a href="#" target="_blank">Bài tập luyện ngữ điệu</a>
                      </Button>
                    </li>
                  </ul>
                </div>
              )}
              
              {scoreDetails.rhythmScore < 80 && (
                <div className="bg-blue-50 p-2 rounded-md">
                  <h5 className="text-sm font-medium mb-1">Cải thiện nhịp điệu:</h5>
                  <ul className="text-xs list-disc pl-4 space-y-1">
                    <li>Tập nói theo nhịp, sử dụng phương pháp đánh nhịp bằng tay</li>
                    <li>Chú ý đến việc nối âm giữa các từ (linking)</li>
                    <li>Phân biệt giữa âm tiết nhấn mạnh và âm tiết nhẹ</li>
                    <li>
                      <Button variant="link" className="h-5 p-0 text-xs text-blue-600" asChild>
                        <a href="#" target="_blank">Phương pháp luyện nhịp điệu tiếng Anh</a>
                      </Button>
                    </li>
                  </ul>
                </div>
              )}
              
              {scoreDetails.stressScore < 80 && (
                <div className="bg-blue-50 p-2 rounded-md">
                  <h5 className="text-sm font-medium mb-1">Cải thiện trọng âm:</h5>
                  <ul className="text-xs list-disc pl-4 space-y-1">
                    <li>Học quy tắc trọng âm trong tiếng Anh (âm tiết đầu, giữa, cuối)</li>
                    <li>Đánh dấu trọng âm trong văn bản trước khi đọc</li>
                    <li>Chú ý các từ có trọng âm thay đổi theo ngữ cảnh</li>
                    <li>
                      <Button variant="link" className="h-5 p-0 text-xs text-blue-600" asChild>
                        <a href="#" target="_blank">Bài tập về trọng âm từ và câu</a>
                      </Button>
                    </li>
                  </ul>
                </div>
              )}
              
              {scoreDetails.fluencyScore < 80 && (
                <div className="bg-blue-50 p-2 rounded-md">
                  <h5 className="text-sm font-medium mb-1">Cải thiện độ trôi chảy:</h5>
                  <ul className="text-xs list-disc pl-4 space-y-1">
                    <li>Tập đọc to hàng ngày, bắt đầu từ chậm đến nhanh dần</li>
                    <li>Sử dụng phương pháp bắt chước (shadowing) - nói theo đồng thời với bản gốc</li>
                    <li>Tập trung vào cụm từ thay vì từng từ riêng lẻ</li>
                    <li>
                      <Button variant="link" className="h-5 p-0 text-xs text-blue-600" asChild>
                        <a href="#" target="_blank">Phương pháp luyện nói trôi chảy</a>
                      </Button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {/* Practice recommendations */}
      <div className="flex justify-end mt-3 gap-2">
        <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
          <Share2 className="h-3 w-3" /> Chia sẻ kết quả
        </Button>
        <Button className="text-xs flex items-center gap-1" size="sm">
          <Video className="h-3 w-3" /> Xem video hướng dẫn
        </Button>
      </div>
    </Card>
  );
};

export default PronunciationFeedback;

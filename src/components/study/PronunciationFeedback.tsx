
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Info } from 'lucide-react';
import { ScoreDetails, WordFeedback } from '@/types/pronunciation';

export interface PronunciationFeedbackProps {
  scoreDetails: ScoreDetails;
  feedback?: WordFeedback[];
  onPracticeWord?: (word: string) => void;
  onPlayReference?: (word: string) => void;
  transcript?: string;
  referenceText?: string;
}

const PronunciationFeedback: React.FC<PronunciationFeedbackProps> = ({
  scoreDetails,
  feedback = [],
  onPracticeWord,
  onPlayReference,
  transcript,
  referenceText
}) => {
  // Ensure we have all the necessary scores with defaults
  const scores = {
    overallScore: scoreDetails.overallScore || 0,
    accuracyScore: scoreDetails.accuracyScore || 0,
    fluencyScore: scoreDetails.fluencyScore || 0,
    completenessScore: scoreDetails.completenessScore || 0, 
    pronScore: scoreDetails.pronScore || 0,
    intonationScore: scoreDetails.intonationScore || scoreDetails.fluencyScore || 0,
    stressScore: scoreDetails.stressScore || scoreDetails.accuracyScore || 0,
    rhythmScore: scoreDetails.rhythmScore || scoreDetails.fluencyScore || 0
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-green-400';
    if (score >= 70) return 'bg-yellow-400';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <Card className="mb-6 p-4 bg-white">
      <h3 className="text-lg font-semibold mb-3">Chi tiết phát âm</h3>
      
      <div className="space-y-4">
        {/* Overall score */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium">Tổng điểm:</span>
            <div className="flex items-center">
              <span className={`text-lg font-bold ${scores.overallScore >= 80 ? 'text-green-600' : 'text-orange-500'}`}>
                {scores.overallScore.toFixed(0)}%
              </span>
              {scores.overallScore >= 80 ? (
                <ThumbsUp className="ml-2 h-4 w-4 text-green-500" />
              ) : (
                <ThumbsDown className="ml-2 h-4 w-4 text-orange-500" />
              )}
            </div>
          </div>
        </div>
        
        {/* Detailed scores */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Độ chính xác</span>
              <span>{scores.accuracyScore.toFixed(0)}%</span>
            </div>
            <Progress value={scores.accuracyScore} className="h-1" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Độ trôi chảy</span>
              <span>{scores.fluencyScore.toFixed(0)}%</span>
            </div>
            <Progress value={scores.fluencyScore} className="h-1" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Đầy đủ</span>
              <span>{scores.completenessScore.toFixed(0)}%</span>
            </div>
            <Progress value={scores.completenessScore} className="h-1" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Phát âm</span>
              <span>{scores.pronScore.toFixed(0)}%</span>
            </div>
            <Progress value={scores.pronScore} className="h-1" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Ngữ điệu</span>
              <span>{scores.intonationScore.toFixed(0)}%</span>
            </div>
            <Progress value={scores.intonationScore} className="h-1" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Trọng âm</span>
              <span>{scores.stressScore.toFixed(0)}%</span>
            </div>
            <Progress value={scores.stressScore} className="h-1" />
          </div>
        </div>
        
        {/* Word feedback */}
        {feedback && feedback.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mt-2 mb-1">Các từ cần cải thiện:</h4>
            <div className="flex flex-wrap gap-2">
              {feedback.map((item, index) => (
                <Button 
                  key={index} 
                  size="sm" 
                  variant="outline"
                  className="text-xs"
                  onClick={() => onPracticeWord && onPracticeWord(item.word)}
                >
                  <Info className="mr-1 h-3 w-3 text-blue-500" />
                  {item.word}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Text comparison if available */}
        {transcript && referenceText && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-sm">
              <div className="mb-2">
                <span className="font-medium">Bạn đã nói:</span>
                <p className="bg-gray-50 p-2 rounded">{transcript}</p>
              </div>
              <div>
                <span className="font-medium">Chuẩn:</span>
                <p className="bg-gray-50 p-2 rounded">{referenceText}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PronunciationFeedback;

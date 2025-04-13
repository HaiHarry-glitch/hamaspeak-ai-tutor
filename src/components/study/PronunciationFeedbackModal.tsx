
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Volume2,
  Mic,
  Info,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Gauge,
  Waveform,
  Music
} from 'lucide-react';
import {
  EnhancedPronunciationScore,
  WordPronunciationAnalysis,
  DetailedPronunciationFeedback,
  ProblemArea
} from '@/utils/speechUtils';

interface PronunciationFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  scoreData?: EnhancedPronunciationScore;
  wordAnalysis?: WordPronunciationAnalysis[];
  originalText: string;
  onPracticeWord?: (word: string) => void;
}

const PronunciationFeedbackModal: React.FC<PronunciationFeedbackModalProps> = ({
  isOpen,
  onClose,
  scoreData,
  wordAnalysis,
  originalText,
  onPracticeWord
}) => {
  if (!scoreData) return null;

  // Calculate component scores for the chart
  const scoreChartData = [
    { name: 'Độ chính xác', score: scoreData.accuracyScore },
    { name: 'Độ lưu loát', score: scoreData.fluencyScore },
    { name: 'Nhịp điệu', score: scoreData.rhythmScore },
    { name: 'Ngữ điệu', score: scoreData.intonationScore },
  ];
  
  // Function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-emerald-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };
  
  // Function to get progress bar color
  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-emerald-400';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-orange-400';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gradient">Phân tích phát âm chi tiết</DialogTitle>
          <DialogDescription>
            Kết quả đánh giá phát âm của bạn với các chỉ số chi tiết và hướng dẫn cải thiện
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="relative mr-4">
                <Gauge className="h-16 w-16 text-hamaspeak-purple" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold">
                  {scoreData.overallScore}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Điểm tổng thể</h3>
                <p className="text-gray-600 text-sm">
                  {scoreData.overallScore >= 90 ? 'Xuất sắc' :
                   scoreData.overallScore >= 80 ? 'Rất tốt' :
                   scoreData.overallScore >= 70 ? 'Tốt' :
                   scoreData.overallScore >= 60 ? 'Khá' : 'Cần cải thiện'}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                className="glass-button" 
                onClick={() => {
                  // Speech synthesis for original text
                  const utterance = new SpeechSynthesisUtterance(originalText);
                  speechSynthesis.speak(utterance);
                }}
              >
                <Volume2 className="mr-2 h-4 w-4" />
                Nghe mẫu
              </Button>
              
              <Button className="glass-button bg-hamaspeak-teal hover:bg-hamaspeak-teal/90">
                <Mic className="mr-2 h-4 w-4" />
                Nói lại
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="details">Chi tiết</TabsTrigger>
              <TabsTrigger value="problems">Cần cải thiện</TabsTrigger>
              <TabsTrigger value="practice">Luyện tập</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="p-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="text-lg font-medium mb-4">Điểm các thành phần</h3>
                  <div className="space-y-4">
                    {scoreChartData.map((item) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">{item.name}</span>
                          <span className={`text-sm font-medium ${getScoreColor(item.score)}`}>
                            {item.score}/100
                          </span>
                        </div>
                        <Progress
                          value={item.score}
                          className="h-2"
                          style={{ backgroundColor: 'rgba(0,0,0,0.1)' }} 
                        />
                        <div 
                          className={`h-2 rounded-full -mt-2 ${getProgressColor(item.score)}`}
                          style={{ 
                            width: `${item.score}%`,
                            transition: 'width 0.5s ease'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={scoreChartData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="score" fill="#6366F1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="text-lg font-medium mb-3">Phản hồi</h3>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium flex items-center text-green-600 mb-2">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Điểm mạnh
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {scoreData.feedback.strengths.map((strength, idx) => (
                        <li key={idx}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium flex items-center text-amber-600 mb-2">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Cần cải thiện
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {scoreData.feedback.improvements.map((improvement, idx) => (
                        <li key={idx}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Bài tập luyện tập</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {scoreData.feedback.practiceExercises.map((exercise, idx) => (
                        <li key={idx}>{exercise}</li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="details">
              {scoreData.wordByWordAnalysis ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Phân tích từng từ</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scoreData.wordByWordAnalysis.map((word, idx) => (
                      <Card key={idx} className="p-4 border-l-4" style={{
                        borderLeftColor: word.score >= 90 ? '#10b981' : 
                                        word.score >= 70 ? '#f59e0b' : 
                                        '#ef4444'
                      }}>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-lg font-medium">{word.word}</h4>
                          <span className={`text-sm font-bold px-2 py-1 rounded ${
                            word.score >= 90 ? 'bg-green-100 text-green-700' :
                            word.score >= 70 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {word.score}%
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>Phiên âm chuẩn:</span>
                            <span className="font-medium">[{word.correctIPA}]</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Phiên âm của bạn:</span>
                            <span className={`font-medium ${
                              word.score >= 90 ? 'text-green-600' :
                              'text-amber-600'
                            }`}>
                              [{word.userIPA}]
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-sm bg-gray-50 p-3 rounded-lg">
                          <p className="flex items-start">
                            <Info className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                            <span>{word.feedbackTip}</span>
                          </p>
                        </div>
                        
                        <div className="mt-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full"
                            onClick={() => onPracticeWord && onPracticeWord(word.word)}
                          >
                            Luyện phát âm từ này
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="text-lg font-medium mb-3">Phân tích âm điệu</h3>
                    <div className="flex items-center mb-4">
                      <Waveform className="h-5 w-5 mr-2 text-purple-500" />
                      <span className="text-sm font-medium">Nhịp điệu: </span>
                      <span className="text-sm ml-2">{scoreData.rhythmScore}%</span>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <Music className="h-5 w-5 mr-2 text-blue-500" />
                      <span className="text-sm font-medium">Ngữ điệu: </span>
                      <span className="text-sm ml-2">{scoreData.intonationScore}%</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      Nhịp điệu và ngữ điệu là hai yếu tố quan trọng trong việc nói tiếng Anh tự nhiên.
                      Tập trung vào việc nhấn các từ trọng âm (danh từ, động từ, tính từ) hơn các từ chức năng.
                    </p>
                    
                    <h4 className="text-sm font-medium mb-2">Bài tập cải thiện</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Đánh dấu các âm tiết được nhấn mạnh trong câu và thực hành nhấn mạnh chúng</li>
                      <li>Ghi âm các đoạn tin tức và bắt chước mẫu nói của người dẫn chương trình</li>
                      <li>Thực hành ngữ điệu tăng dần cho câu hỏi và ngữ điệu giảm dần cho câu trần thuật</li>
                    </ul>
                  </Card>
                  
                  <Card className="p-4">
                    <h3 className="text-lg font-medium mb-3">Phân tích độ chuẩn xác</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Độ chính xác phát âm</span>
                          <span className={getScoreColor(scoreData.accuracyScore)}>
                            {scoreData.accuracyScore}%
                          </span>
                        </div>
                        <Progress 
                          value={scoreData.accuracyScore}
                          className="h-2"
                        />
                        <div 
                          className={`h-2 rounded-full -mt-2 ${getProgressColor(scoreData.accuracyScore)}`}
                          style={{ 
                            width: `${scoreData.accuracyScore}%`,
                            transition: 'width 0.5s ease'
                          }}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Độ lưu loát</span>
                          <span className={getScoreColor(scoreData.fluencyScore)}>
                            {scoreData.fluencyScore}%
                          </span>
                        </div>
                        <Progress 
                          value={scoreData.fluencyScore}
                          className="h-2"
                        />
                        <div 
                          className={`h-2 rounded-full -mt-2 ${getProgressColor(scoreData.fluencyScore)}`}
                          style={{ 
                            width: `${scoreData.fluencyScore}%`,
                            transition: 'width 0.5s ease'
                          }}
                        />
                      </div>
                    </div>
                    
                    <h4 className="text-sm font-medium mt-4 mb-2">Âm khó phát âm</h4>
                    <div className="space-y-3">
                      {scoreData.problemSounds.map((problem, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center mb-1">
                            <span className="text-sm font-medium mr-2">Âm [{problem.phoneme}]:</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              Khó
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{problem.description}</p>
                          <div className="text-sm">
                            <span className="text-xs font-medium">Ví dụ: </span>
                            {problem.examples.map((ex, i) => (
                              <span key={i} className="mr-2 italic">
                                {ex}{i < problem.examples.length - 1 ? ',' : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="problems">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Âm khó cần tập trung cải thiện</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scoreData.problemSounds.map((problem, idx) => (
                      <Card key={idx} className="p-4">
                        <h4 className="font-medium flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                          Âm [{problem.phoneme}]
                        </h4>
                        
                        <p className="text-sm text-gray-600 my-2">{problem.description}</p>
                        
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <h5 className="text-sm font-medium mb-1">Từ luyện tập:</h5>
                          <div className="flex flex-wrap gap-2">
                            {problem.examples.map((word, i) => (
                              <div 
                                key={i}
                                className="px-3 py-1 bg-white rounded-full border border-gray-200 flex items-center"
                              >
                                <span className="text-sm">{word}</span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 ml-1 text-gray-500 hover:text-hamaspeak-blue"
                                  onClick={() => {
                                    // Speak the word
                                    const utterance = new SpeechSynthesisUtterance(word);
                                    speechSynthesis.speak(utterance);
                                  }}
                                >
                                  <Volume2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <Button 
                            size="sm" 
                            className="w-full"
                            variant="outline"
                            onClick={() => onPracticeWord && onPracticeWord(problem.examples[0])}
                          >
                            Luyện tập âm này
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Mẹo cải thiện phát âm</h3>
                  <Card className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Bài tập luyện tập</h4>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                          {scoreData.feedback.practiceExercises.map((exercise, idx) => (
                            <li key={idx}>{exercise}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Tài nguyên học tập</h4>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                          <li>Sử dụng ứng dụng luyện phát âm như ELSA Speak hoặc Speechling</li>
                          <li>Học bảng ký hiệu IPA để hiểu cách phát âm chính xác</li>
                          <li>Xem video hướng dẫn phát âm trên YouTube và làm theo</li>
                          <li>Tìm một người bản xứ hoặc giáo viên để nhận phản hồi trực tiếp</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="practice">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Luyện tập cặp từ tối thiểu</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { pair: "ship / sheep", focus: "ɪ vs iː" },
                      { pair: "bit / beat", focus: "ɪ vs iː" },
                      { pair: "live / leave", focus: "ɪ vs iː" },
                      { pair: "thin / tin", focus: "θ vs t" },
                      { pair: "three / tree", focus: "θ vs t" },
                      { pair: "vest / best", focus: "v vs b" },
                    ].map((item, idx) => (
                      <Card key={idx} className="p-3">
                        <h4 className="font-medium mb-1">{item.pair}</h4>
                        <p className="text-xs text-gray-500 mb-2">Phân biệt âm: [{item.focus}]</p>
                        <div className="flex justify-between">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const utterance = new SpeechSynthesisUtterance(item.pair.split(' / ')[0]);
                              speechSynthesis.speak(utterance);
                            }}
                          >
                            <Volume2 className="h-3 w-3 mr-1" />
                            Từ 1
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const utterance = new SpeechSynthesisUtterance(item.pair.split(' / ')[1]);
                              speechSynthesis.speak(utterance);
                            }}
                          >
                            <Volume2 className="h-3 w-3 mr-1" />
                            Từ 2
                          </Button>
                          <Button size="sm">
                            <Mic className="h-3 w-3 mr-1" />
                            Thực hành
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Tongue Twisters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { text: "She sells seashells by the seashore.", focus: "s, ʃ" },
                      { text: "Red lorry, yellow lorry.", focus: "r, l" },
                      { text: "Three free thugs threw thirty thimbles.", focus: "θ, ð" },
                      { text: "Vincent vowed vengeance very vehemently.", focus: "v" },
                    ].map((item, idx) => (
                      <Card key={idx} className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{item.text}</h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            [{item.focus}]
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const utterance = new SpeechSynthesisUtterance(item.text);
                              speechSynthesis.speak(utterance);
                            }}
                          >
                            <Volume2 className="h-3 w-3 mr-1" />
                            Nghe mẫu
                          </Button>
                          <Button size="sm">
                            <Mic className="h-3 w-3 mr-1" />
                            Luyện tập
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <Card className="p-4">
                  <h3 className="text-lg font-medium mb-3">Lịch trình luyện tập đề xuất</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="bg-hamaspeak-purple text-white rounded-full h-6 w-6 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                      <div>
                        <h4 className="font-medium">Luyện phát âm cơ bản (5-10 phút mỗi ngày)</h4>
                        <p className="text-sm text-gray-600">Tập trung vào cặp từ tối thiểu và âm riêng lẻ</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <span className="bg-hamaspeak-blue text-white rounded-full h-6 w-6 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                      <div>
                        <h4 className="font-medium">Tongue twisters (5 phút mỗi ngày)</h4>
                        <p className="text-sm text-gray-600">Luyện các âm khó với độ phức tạp tăng dần</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <span className="bg-hamaspeak-teal text-white rounded-full h-6 w-6 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                      <div>
                        <h4 className="font-medium">Nhịp điệu và ngữ điệu (5-10 phút mỗi ngày)</h4>
                        <p className="text-sm text-gray-600">Đọc to và thu âm các câu ngắn, tập trung vào trọng âm và ngữ điệu</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <span className="bg-green-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                      <div>
                        <h4 className="font-medium">Thực hành đối thoại (10-15 phút mỗi ngày)</h4>
                        <p className="text-sm text-gray-600">Áp dụng kỹ năng phát âm vào các đoạn hội thoại thực tế</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex justify-end mt-6 space-x-2">
          <DialogClose asChild>
            <Button variant="outline">Đóng</Button>
          </DialogClose>
          <Button onClick={() => onPracticeWord && onPracticeWord('')}>
            Luyện tập ngay
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PronunciationFeedbackModal;

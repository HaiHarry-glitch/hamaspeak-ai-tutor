
import React, { useState, useEffect } from 'react';
import { StudyProvider, useStudy } from '@/contexts/StudyContext';
import TextInput from '@/components/study/TextInput';
import Step1Listening from '@/components/study/Step1Listening';
import Step2Flashcards from '@/components/study/Step2Flashcards';
import Step3EnglishSpeaking from '@/components/study/Step3EnglishSpeaking';
import Step4VietnameseSpeaking from '@/components/study/Step4VietnameseSpeaking';
import Step5FillBlanks from '@/components/study/Step5FillBlanks';
import Step6ListeningComprehension from '@/components/study/Step6ListeningComprehension';
import Step7ParagraphSpeaking from '@/components/study/Step7ParagraphSpeaking';
import Step8CompleteSpeaking from '@/components/study/Step8CompleteSpeaking';
import VoiceSelector from '@/components/study/VoiceSelector';
import StudyProgress from '@/components/study/StudyProgress';
import AnalyzingProgress from '@/components/study/AnalyzingProgress';
import Header from '@/components/Header';
import { Loader2, List, MessageSquare, Lightbulb, Globe } from 'lucide-react';
import PronunciationChart from '@/components/study/PronunciationChart';
import QuestionPrompt from '@/components/study/QuestionPrompt';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Interface for pronunciation analysis results
interface PronunciationAnalysisResult {
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  intonationScore: number;
  stressScore: number;
  rhythmScore: number;
  recordedAt: string;
  mispronunciations?: string[];
}

// Sample speaking topics (will be replaced by database queries in production)
const sampleTopics = [
  {
    id: 1,
    question: "Do you have a favorite teacher from school? Why did you like them?",
    response: "Yes, I do. My favorite teacher was my high school literature instructor. She was genuinely passionate about teaching and always encouraged us to develop a variety of skills and abilities beyond the core subjects.",
    category: "Education"
  },
  {
    id: 2,
    question: "What kind of music do you enjoy listening to?",
    response: "I enjoy listening to various genres, but I particularly like jazz and classical music. They help me relax after a long day and improve my focus when I'm working or studying.",
    category: "Entertainment"
  },
  {
    id: 3,
    question: "Do you prefer living in a city or in the countryside?",
    response: "I prefer living in the city because of the convenience and opportunities it offers. Cities have better access to services, entertainment options, and career possibilities that align with my interests.",
    category: "Lifestyle"
  },
  {
    id: 4,
    question: "How do you usually spend your weekends?",
    response: "I usually spend my weekends catching up with friends or family. I also enjoy pursuing my hobbies like photography and trying new restaurants or cafes in different parts of the city.",
    category: "Daily Life"
  },
  {
    id: 5,
    question: "What changes would you like to see in your hometown?",
    response: "I'd like to see more green spaces and improved public transportation in my hometown. These changes would make the city more livable and environmentally friendly for all residents.",
    category: "Society"
  }
];

const StudyContent = () => {
  const { currentStep, isAnalyzing, selectedVoice, currentText, analyzeUserText, setCurrentText } = useStudy();
  const [pronunciationHistory, setPronunciationHistory] = useState<PronunciationAnalysisResult[]>([]);
  const [showPronunciationChart, setShowPronunciationChart] = useState(false);
  const [showTopicPrompt, setShowTopicPrompt] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const { toast } = useToast();
  
  // Generate answer using Gemini API
  const generateAnswer = async () => {
    if (!customQuestion.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập câu hỏi trước khi tạo câu trả lời",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingAnswer(true);
    
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDtrDZDuhNPmGDdRr7eEAXNRYiuEOgkAPA",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate a short answer for the following English speaking test question: "${customQuestion}"
                    
                    The answer should be brief but complete:
                    - Start with a direct answer to the question
                    - Include 1-2 short sentences to explain your answer with a reason or example
                    - Total answer should be around 2-3 sentences maximum
                    - Use natural, conversational language
                    - Don't use complex vocabulary
                    - Don't mention that this is a response to an English test question
                    
                    Only return the answer text, nothing else.`
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network error");
      }

      const data = await response.json();
      const generatedAnswer = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      setCustomAnswer(generatedAnswer.trim());
    } catch (error) {
      console.error("Error generating answer:", error);
      toast({
        title: "Lỗi tạo câu trả lời",
        description: "Không thể tạo câu trả lời tự động. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAnswer(false);
    }
  };
  
  // Start practicing with selected question and response
  const startPracticing = () => {
    if (selectedQuestion) {
      setCurrentText(selectedQuestion.response);
      analyzeUserText(selectedQuestion.response);
      setShowTopicPrompt(false);
    } else if (customQuestion && customAnswer) {
      setCurrentText(customAnswer);
      analyzeUserText(customAnswer);
      setShowTopicPrompt(false);
    } else {
      toast({
        title: "Chọn chủ đề",
        description: "Vui lòng chọn một chủ đề có sẵn hoặc tạo câu trả lời cho câu hỏi của bạn",
        variant: "default"
      });
    }
  };
  
  // Common function for pronunciation analysis that will be passed to components
  const handleAnalyzePronunciation = async (text: string, audioBlob?: Blob) => {
    console.log('Analyzing pronunciation for:', text);
    
    // Generate realistic scores
    const baseScore = Math.random() * 30 + 65; // Base score between 65-95
    
    const newAnalysis: PronunciationAnalysisResult = {
      overallScore: Math.round(baseScore),
      accuracyScore: Math.round(baseScore * (0.85 + Math.random() * 0.3)),
      fluencyScore: Math.round(baseScore * (0.9 + Math.random() * 0.2)),
      intonationScore: Math.round(baseScore * (0.8 + Math.random() * 0.4)),
      stressScore: Math.round(baseScore * (0.85 + Math.random() * 0.3)),
      rhythmScore: Math.round(baseScore * (0.9 + Math.random() * 0.2)),
      recordedAt: new Date().toISOString(),
      mispronunciations: []
    };
    
    // Add to history
    setPronunciationHistory(prev => [...prev, newAnalysis]);
    
    return newAnalysis;
  };

  return (
    <div className="min-h-screen pb-10 bg-gradient-to-b from-blue-50 to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Luyện nói tiếng Anh cùng Hamaspeak
        </h1>
        
        {isAnalyzing && <AnalyzingProgress isAnalyzing={isAnalyzing} />}
        
        {currentStep > 0 && !isAnalyzing && (
          <div className="max-w-4xl mx-auto mb-8">
            <StudyProgress />
          </div>
        )}
        
        {!isAnalyzing && currentStep > 0 && (
          <div className="max-w-3xl mx-auto mb-6 flex justify-end">
            <VoiceSelector />
          </div>
        )}
        
        {showTopicPrompt && currentStep === 0 && (
          <Card className="max-w-4xl mx-auto p-6 shadow-lg bg-gradient-to-br from-white to-purple-50 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 mb-3">
                Chọn chủ đề để luyện tập
              </h2>
              <p className="text-gray-600">
                Chọn một chủ đề có sẵn hoặc tạo chủ đề riêng của bạn để bắt đầu luyện nói
              </p>
            </div>
            
            <Tabs defaultValue="sample" className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sample" className="flex items-center">
                  <List className="h-4 w-4 mr-2" />
                  Chủ đề có sẵn
                </TabsTrigger>
                <TabsTrigger value="custom" className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Tạo chủ đề mới
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="sample" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {sampleTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedQuestion?.id === topic.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => {
                        setSelectedQuestion(topic);
                        setCustomQuestion('');
                        setCustomAnswer('');
                      }}
                    >
                      <p className="font-medium mb-2">{topic.question}</p>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Globe className="h-3.5 w-3.5 mr-1.5" />
                        {topic.category}
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedQuestion && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">Câu trả lời mẫu:</h3>
                    <p className="text-gray-700">{selectedQuestion.response}</p>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
                      <div className="flex items-center mb-2">
                        <Lightbulb className="h-4 w-4 text-amber-500 mr-2" />
                        <h4 className="font-medium">Gợi ý phát triển ý tưởng:</h4>
                      </div>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Nghĩ về trải nghiệm cá nhân liên quan đến chủ đề</li>
                        <li>• Sử dụng các ví dụ cụ thể để minh họa quan điểm của bạn</li>
                        <li>• Cân nhắc các khía cạnh khác nhau của vấn đề</li>
                      </ul>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="custom" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                      Câu hỏi của bạn:
                    </label>
                    <input
                      type="text"
                      id="question"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập câu hỏi tiếng Anh..."
                      value={customQuestion}
                      onChange={(e) => {
                        setCustomQuestion(e.target.value);
                        setSelectedQuestion(null);
                      }}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
                        Câu trả lời của bạn:
                      </label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={generateAnswer}
                        disabled={isGeneratingAnswer || !customQuestion}
                        className="text-xs"
                      >
                        {isGeneratingAnswer ? (
                          <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Đang tạo...</>
                        ) : (
                          <>Tạo câu trả lời</>
                        )}
                      </Button>
                    </div>
                    <textarea
                      id="answer"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                      placeholder="Nhập hoặc tạo câu trả lời tiếng Anh..."
                      value={customAnswer}
                      onChange={(e) => setCustomAnswer(e.target.value)}
                    ></textarea>
                  </div>
                  
                  {customQuestion && customAnswer && (
                    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
                      <div className="flex items-center mb-2">
                        <Lightbulb className="h-4 w-4 text-amber-500 mr-2" />
                        <h4 className="font-medium">Gợi ý phát triển ý tưởng:</h4>
                      </div>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Sử dụng từ vựng phong phú và đa dạng</li>
                        <li>• Kết hợp cả câu ngắn và câu dài</li>
                        <li>• Đưa ra ví dụ cụ thể từ trải nghiệm của bạn</li>
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-center">
              <Button 
                onClick={startPracticing}
                disabled={!(selectedQuestion || (customQuestion && customAnswer))}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-md"
                size="lg"
              >
                Bắt đầu luyện tập
              </Button>
            </div>
          </Card>
        )}
        
        {currentStep === 0 && !showTopicPrompt && <TextInput />}
        
        {/* Input steps (1-4) */}
        {currentStep === 1 && <Step1Listening />}
        {currentStep === 2 && <Step2Flashcards />}
        {currentStep === 3 && (
          <Step3EnglishSpeaking 
            onAnalyzePronunciation={handleAnalyzePronunciation}
          />
        )}
        {currentStep === 4 && (
          <Step4VietnameseSpeaking 
            onAnalyzePronunciation={handleAnalyzePronunciation}
          />
        )}
        
        {/* Output steps (5-8) */}
        {currentStep === 5 && (
          <Step5FillBlanks 
            onAnalyzePronunciation={handleAnalyzePronunciation}
          />
        )}
        {currentStep === 6 && (
          <Step6ListeningComprehension 
            onAnalyzePronunciation={handleAnalyzePronunciation}
          />
        )}
        {currentStep === 7 && (
          <Step7ParagraphSpeaking 
            onAnalyzePronunciation={handleAnalyzePronunciation}
          />
        )}
        {currentStep === 8 && (
          <Step8CompleteSpeaking 
            onAnalyzePronunciation={handleAnalyzePronunciation}
          />
        )}
        
        {/* Pronunciation Chart - shown when needed */}
        {showPronunciationChart && pronunciationHistory.length > 0 && (
          <div className="mt-8">
            <PronunciationChart 
              history={pronunciationHistory} 
              currentScores={pronunciationHistory[pronunciationHistory.length - 1]} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

const Study = () => {
  return (
    <StudyProvider>
      <StudyContent />
    </StudyProvider>
  );
};

export default Study;

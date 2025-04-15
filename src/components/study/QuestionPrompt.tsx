
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { List, MessageSquare, Lightbulb, Loader2 } from 'lucide-react';

interface QuestionPromptProps {
  onSelect: (question: string, answer: string) => void;
  sampleQuestions: Array<{
    id: number;
    question: string;
    response: string;
    category: string;
  }>;
}

const QuestionPrompt: React.FC<QuestionPromptProps> = ({ onSelect, sampleQuestions }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  
  // Generate answer using Gemini API
  const generateAnswer = async () => {
    if (!customQuestion.trim()) return;
    
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
    } finally {
      setIsGeneratingAnswer(false);
    }
  };
  
  // Start practicing with selected question and response
  const handleSelect = () => {
    if (selectedQuestion) {
      onSelect(selectedQuestion.question, selectedQuestion.response);
    } else if (customQuestion && customAnswer) {
      onSelect(customQuestion, customAnswer);
    }
  };

  return (
    <Card className="p-6 shadow-lg bg-gradient-to-br from-white to-purple-50 animate-fade-in">
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
            {sampleQuestions.map((topic) => (
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
                <div className="text-sm text-gray-500">
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
          onClick={handleSelect}
          disabled={!(selectedQuestion || (customQuestion && customAnswer))}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-md"
          size="lg"
        >
          Bắt đầu luyện tập
        </Button>
      </div>
    </Card>
  );
};

export default QuestionPrompt;

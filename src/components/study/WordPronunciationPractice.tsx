
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Volume2,
  Mic,
  MicOff,
  X,
  ArrowRight,
  RefreshCw,
  Info,
  Check,
  AlertTriangle,
  Wand2,
} from 'lucide-react';
import {
  speakText,
  startSpeechRecognition,
  stopSpeechRecognition,
  analyzeWordPronunciation,
  getIpaTranscription,
  WordPronunciationAnalysis
} from '@/utils/speechUtils';

interface WordPronunciationPracticeProps {
  isOpen: boolean;
  onClose: () => void;
  word: string;
  selectedVoice?: string;
}

const WordPronunciationPractice: React.FC<WordPronunciationPracticeProps> = ({
  isOpen,
  onClose,
  word,
  selectedVoice = ''
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attempts, setAttempts] = useState<WordPronunciationAnalysis[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<WordPronunciationAnalysis | null>(null);
  const [wordIPA, setWordIPA] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('practice');
  
  // Similar words for context
  const [similarWords, setSimilarWords] = useState<string[]>([]);
  
  useEffect(() => {
    if (isOpen && word) {
      // Get IPA for the word
      const fetchIPA = async () => {
        const ipa = await getIpaTranscription(word);
        setWordIPA(ipa);
        
        // Generate similar words based on the current word
        generateSimilarWords(word);
      };
      
      fetchIPA();
      setAttempts([]);
      setCurrentAttempt(null);
    }
  }, [isOpen, word]);
  
  // Generate similar words for context
  const generateSimilarWords = (currentWord: string) => {
    // Based on the word's first letter and approximate length
    const firstLetter = currentWord.charAt(0).toLowerCase();
    const length = currentWord.length;
    
    // Common English words by starting letter
    const commonWords: Record<string, string[]> = {
      'a': ['about', 'after', 'again', 'all', 'almost', 'also', 'always', 'and', 'any', 'ask'],
      'b': ['back', 'bad', 'because', 'been', 'before', 'best', 'better', 'between', 'big', 'both'],
      'c': ['call', 'can', 'come', 'could', 'country', 'create', 'car', 'city', 'child', 'change'],
      'd': ['day', 'did', 'different', 'do', 'does', 'don\'t', 'down', 'during', 'doctor', 'door'],
      'e': ['each', 'end', 'even', 'every', 'example', 'experience', 'eye', 'early', 'easy', 'enough'],
      'f': ['face', 'fact', 'family', 'far', 'feel', 'few', 'find', 'first', 'for', 'from'],
      'g': ['get', 'give', 'go', 'good', 'great', 'group', 'grow', 'game', 'girl', 'government'],
      'h': ['had', 'hand', 'has', 'have', 'he', 'head', 'hear', 'help', 'her', 'high'],
      'i': ['idea', 'if', 'important', 'in', 'into', 'is', 'it', 'its', 'itself', 'industry'],
      'j': ['job', 'join', 'just', 'jump', 'juice', 'journey', 'judge', 'jacket', 'joy', 'jungle'],
      'k': ['keep', 'kind', 'know', 'knowledge', 'key', 'kill', 'kid', 'kiss', 'kitchen', 'knee'],
      'l': ['large', 'last', 'late', 'lead', 'learn', 'leave', 'left', 'less', 'life', 'like'],
      'm': ['make', 'man', 'many', 'may', 'me', 'mean', 'might', 'more', 'most', 'move'],
      'n': ['name', 'need', 'never', 'new', 'next', 'nice', 'no', 'not', 'now', 'number'],
      'o': ['of', 'off', 'often', 'old', 'on', 'one', 'only', 'or', 'other', 'out'],
      'p': ['part', 'people', 'person', 'place', 'play', 'point', 'problem', 'put', 'paper', 'past'],
      'q': ['question', 'quick', 'quickly', 'quiet', 'quite', 'quote', 'quality', 'queen', 'quest', 'quiz'],
      'r': ['reach', 'read', 'real', 'really', 'right', 'run', 'rather', 'reason', 'result', 'room'],
      's': ['same', 'say', 'see', 'seem', 'should', 'show', 'small', 'some', 'still', 'such'],
      't': ['take', 'talk', 'tell', 'than', 'that', 'the', 'their', 'them', 'then', 'there'],
      'u': ['under', 'up', 'us', 'use', 'used', 'unit', 'until', 'upon', 'usual', 'understand'],
      'v': ['very', 'view', 'voice', 'visit', 'vote', 'value', 'various', 'vast', 'video', 'village'],
      'w': ['wait', 'walk', 'want', 'was', 'way', 'we', 'well', 'what', 'when', 'which'],
      'x': ['x-ray', 'xerox', 'xylophone', 'xenon', 'xbox', 'xmas', 'extra', 'exit', 'extreme', 'exchange'],
      'y': ['year', 'yes', 'yet', 'you', 'young', 'your', 'yield', 'yard', 'yellow', 'yesterday'],
      'z': ['zero', 'zone', 'zoom', 'zeal', 'zebra', 'zenith', 'zest', 'zinc', 'zombie', 'zigzag']
    };
    
    let wordsWithSameLetter = commonWords[firstLetter] || commonWords['a'];
    
    // Filter words with somewhat similar length (±2)
    const similarLengthWords = wordsWithSameLetter.filter(w => 
      Math.abs(w.length - length) <= 2 && w.toLowerCase() !== currentWord.toLowerCase()
    );
    
    // If we don't have enough similar length words, just use any from that letter
    if (similarLengthWords.length < 5) {
      wordsWithSameLetter = wordsWithSameLetter.filter(w => 
        w.toLowerCase() !== currentWord.toLowerCase()
      );
      
      // Shuffle and take up to 5
      setSimilarWords(shuffle(wordsWithSameLetter).slice(0, 5));
    } else {
      // Shuffle and take up to 5
      setSimilarWords(shuffle(similarLengthWords).slice(0, 5));
    }
  };
  
  // Helper function to shuffle an array
  const shuffle = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  const handleSpeak = async () => {
    if (isSpeaking || !word) return;
    
    setIsSpeaking(true);
    try {
      await speakText(word, selectedVoice, 0.8);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };
  
  const handleListen = async () => {
    if (!word) return;
    
    if (isListening) {
      try {
        stopSpeechRecognition();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      } finally {
        setIsListening(false);
      }
      return;
    }
    
    setIsListening(true);
    setIsLoading(true);
    
    try {
      // Start speech recognition
      await startSpeechRecognition('en-US');
      
      // Simulate API call to analyze pronunciation
      const result = await analyzeWordPronunciation(word, "audio-blob-placeholder");
      
      // Add to attempts
      setAttempts(prev => [...prev, result]);
      setCurrentAttempt(result);
      
    } catch (error) {
      console.error('Speech recognition error:', error);
    } finally {
      setIsListening(false);
      setIsLoading(false);
    }
  };
  
  const handleSimilarWordSelect = (selectedWord: string) => {
    // Get IPA for the word
    const fetchIPA = async () => {
      const ipa = await getIpaTranscription(selectedWord);
      setWordIPA(ipa);
    };
    
    fetchIPA();
    setAttempts([]);
    setCurrentAttempt(null);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gradient">Luyện phát âm từng từ</DialogTitle>
          <DialogDescription>
            Luyện phát âm chính xác từng từ với phản hồi chi tiết
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <div className="flex justify-between items-center mb-6 bg-gray-50 rounded-lg p-4">
            <div>
              <h2 className="text-2xl font-bold text-hamaspeak-blue">{word}</h2>
              <div className="text-sm text-gray-500 mt-1">
                <span>Phiên âm: </span>
                <span className="font-mono">[{wordIPA}]</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
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
                disabled={isLoading}
                className={`glass-button ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-hamaspeak-teal hover:bg-hamaspeak-teal/90'}`}
              >
                {isListening ? (
                  <>
                    <MicOff className="mr-2 h-4 w-4 animate-pulse" />
                    Dừng ghi âm
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Nói từ này
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="practice" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="practice">Luyện tập</TabsTrigger>
              <TabsTrigger value="guide">Hướng dẫn phát âm</TabsTrigger>
            </TabsList>
            
            <TabsContent value="practice" className="p-1">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin h-8 w-8 border-4 border-hamaspeak-blue border-t-transparent rounded-full"></div>
                </div>
              ) : currentAttempt ? (
                <Card className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium">Kết quả phát âm</h3>
                      {currentAttempt.score >= 90 ? (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-600">
                          Xuất sắc
                        </span>
                      ) : currentAttempt.score >= 70 ? (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-600">
                          Tốt
                        </span>
                      ) : (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-600">
                          Cần cải thiện
                        </span>
                      )}
                    </div>
                    <span className={`text-lg font-bold ${
                      currentAttempt.score >= 90 ? 'text-green-600' :
                      currentAttempt.score >= 70 ? 'text-yellow-600' :
                      'text-orange-600'
                    }`}>
                      {currentAttempt.score}%
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Độ chính xác</span>
                        <span>{currentAttempt.score}%</span>
                      </div>
                      <Progress 
                        value={currentAttempt.score} 
                        className="h-2"
                        indicatorClassName={`${
                          currentAttempt.score >= 90 ? 'bg-green-500' :
                          currentAttempt.score >= 70 ? 'bg-yellow-500' :
                          'bg-orange-500'
                        }`}
                      />
                    </div>
                    
                    <div className="flex justify-between space-x-4">
                      <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium mb-1">Phiên âm chuẩn</h4>
                        <p className="font-mono text-hamaspeak-blue">[{currentAttempt.correctIPA}]</p>
                      </div>
                      <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium mb-1">Phiên âm của bạn</h4>
                        <p className="font-mono text-hamaspeak-purple">[{currentAttempt.userIPA}]</p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex">
                        <Info className="h-5 w-5 text-blue-500 mr-2 shrink-0" />
                        <p className="text-sm text-blue-700">{currentAttempt.feedbackTip}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" onClick={handleSpeak}>
                        <Volume2 className="mr-2 h-4 w-4" />
                        Nghe lại
                      </Button>
                      <Button onClick={handleListen}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Thử lại
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Card className="p-4">
                    <div className="flex items-center mb-4">
                      <Info className="h-5 w-5 text-blue-500 mr-2" />
                      <h3 className="font-medium">Hướng dẫn</h3>
                    </div>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                      <li>Nhấn <strong>Nghe mẫu</strong> để nghe phát âm chuẩn</li>
                      <li>Nhấn <strong>Nói từ này</strong> và đọc to từ trên màn hình</li>
                      <li>Nhận phản hồi chi tiết về độ chính xác phát âm của bạn</li>
                      <li>Lặp lại nhiều lần để cải thiện phát âm</li>
                    </ol>
                  </Card>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Các từ tương tự để luyện tập:</h3>
                    <div className="flex flex-wrap gap-2">
                      {similarWords.map((similarWord, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSimilarWordSelect(similarWord)}
                        >
                          {similarWord}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {attempts.length > 1 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Lịch sử nỗ lực ({attempts.length})</h3>
                  <div className="space-y-2">
                    {attempts.slice().reverse().slice(0, 5).map((attempt, idx) => (
                      <div 
                        key={idx} 
                        className="flex justify-between items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setCurrentAttempt(attempt)}
                      >
                        <div className="flex items-center">
                          {attempt.score >= 90 ? (
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                          ) : attempt.score >= 70 ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                          ) : (
                            <X className="h-4 w-4 text-orange-500 mr-2" />
                          )}
                          <span className="text-sm">{attempts.length - idx}</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`text-sm mr-3 ${
                            attempt.score >= 90 ? 'text-green-600' :
                            attempt.score >= 70 ? 'text-yellow-600' :
                            'text-orange-600'
                          }`}>
                            {attempt.score}%
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="guide" className="p-1">
              <div className="space-y-6">
                <Card className="p-4">
                  <h3 className="font-medium mb-3">Hướng dẫn phát âm "{word}"</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <span className="text-sm font-medium">Phát âm chuẩn:</span>
                        <span className="ml-2 font-mono">[{wordIPA}]</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={handleSpeak}>
                        <Volume2 className="h-3 w-3 mr-1" />
                        Nghe
                      </Button>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Hướng dẫn phát âm:</h4>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm">
                        <PronunciationGuide word={word} ipa={wordIPA} />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Các lỗi phát âm phổ biến:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <CommonErrorsForWord word={word} />
                      </ul>
                    </div>
                  </div>
                </Card>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Phân tích từng âm tiết:</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <SyllableBreakdown word={word} />
                  </div>
                </div>
                
                <Card className="p-4">
                  <h3 className="font-medium mb-3 flex items-center">
                    <Wand2 className="h-4 w-4 mr-2 text-hamaspeak-purple" />
                    Mẹo luyện tập
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Thực hành phát âm từng âm tiết một cách riêng biệt trước khi kết hợp chúng</li>
                    <li>Sử dụng gương để quan sát vị trí môi và lưỡi của bạn khi phát âm</li>
                    <li>Luyện tập từ này trong các câu ngắn để cải thiện phát âm trong ngữ cảnh</li>
                    <li>Thu âm và so sánh phát âm của bạn với phát âm mẫu</li>
                  </ul>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Câu luyện tập:</h4>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <PracticeSentences word={word} />
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
          <Button onClick={handleListen}>
            <Mic className="mr-2 h-4 w-4" />
            Luyện tập ngay
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper component for pronunciation guide
const PronunciationGuide: React.FC<{ word: string; ipa: string }> = ({ word, ipa }) => {
  // This is a simple guide based on the word
  const firstLetter = word.charAt(0).toLowerCase();
  
  const commonGuides: Record<string, React.ReactNode> = {
    'th': (
      <p>
        Đặt lưỡi giữa răng và thở ra nhẹ nhàng để tạo ra âm "th". 
        Đảm bảo lưỡi thò ra nhẹ giữa răng của bạn.
      </p>
    ),
    'r': (
      <p>
        Cong lưỡi về phía sau mà không chạm vào vòm miệng. 
        Đây là âm "r" của tiếng Anh, khác với âm "r" trong tiếng Việt.
      </p>
    ),
    'v': (
      <p>
        Đặt răng trên lên môi dưới và tạo ra âm rung. 
        Đảm bảo phát âm âm "v" khác với âm "b".
      </p>
    ),
    'w': (
      <p>
        Làm tròn môi và sau đó nhanh chóng làm phẳng chúng khi phát âm "w".
        Không nên phát âm như âm "qu" trong tiếng Việt.
      </p>
    ),
    'j': (
      <p>
        Phát âm "j" như trong từ "job" bằng cách bắt đầu với "d" sau đó nhanh chóng chuyển sang "zh".
      </p>
    ),
    's': (
      <p>
        Giữ lưỡi đằng sau răng và thổi không khí ra nhẹ nhàng. Không nên phát âm như "x" trong tiếng Việt.
      </p>
    ),
    'a': (
      <p>
        Chú ý phân biệt giữa các loại nguyên âm "a" khác nhau trong tiếng Anh. 
        Trong từ này, tập trung vào cách phát âm nguyên âm chính xác.
      </p>
    ),
    'e': (
      <p>
        Mở miệng rộng hơn so với âm "i". Đảm bảo phát âm đúng độ dài của nguyên âm.
      </p>
    ),
    'i': (
      <p>
        Phân biệt rõ giữa âm "i" ngắn như trong "ship" và âm "i" dài như trong "sheep".
      </p>
    ),
  };
  
  // Check if we have specific guidance for this word's starting sound
  const guide = commonGuides[firstLetter] || (
    <p>
      Tập trung vào việc phát âm rõ ràng mỗi âm tiết. 
      Chú ý đến vị trí lưỡi và môi khi phát âm. 
      Nghe mẫu phát âm nhiều lần và bắt chước càng gần càng tốt.
    </p>
  );
  
  return (
    <div className="space-y-2">
      {guide}
      <div className="mt-2 pt-2 border-t">
        <span className="font-medium">Phiên âm IPA: </span>
        <span className="font-mono">[{ipa}]</span>
      </div>
    </div>
  );
};

// Helper component for common errors
const CommonErrorsForWord: React.FC<{ word: string }> = ({ word }) => {
  // This could be expanded with a larger word database
  const firstLetter = word.charAt(0).toLowerCase();
  
  // Some common errors for Vietnamese speakers
  const commonErrors: Record<string, string[]> = {
    'th': [
      'Phát âm "th" thành "t" hoặc "d"',
      'Không đặt lưỡi giữa răng'
    ],
    'r': [
      'Phát âm "r" giống như trong tiếng Việt (gần với âm "z")',
      'Phát âm cuộn lưỡi quá mạnh'
    ],
    'v': [
      'Phát âm "v" thành "b"',
      'Không tạo đủ ma sát giữa răng và môi'
    ],
    'l': [
      'Bỏ qua âm "l" ở cuối từ',
      'Phát âm "l" không rõ ràng'
    ],
    'w': [
      'Phát âm "w" như "qu" trong tiếng Việt',
      'Không làm tròn môi đủ'
    ],
    'j': [
      'Phát âm "j" thành "z" hoặc "ch"',
      'Không kết hợp đúng âm "d" và "zh"'
    ],
    's': [
      'Phát âm "s" thành "x" như trong tiếng Việt',
      'Phát âm "s" quá nhẹ ở cuối từ'
    ],
    'p': [
      'Không phát âm rõ "p" ở cuối từ',
      'Không thổi hơi đủ mạnh'
    ],
    't': [
      'Không phát âm rõ "t" ở cuối từ',
      'Không thổi hơi đủ mạnh'
    ],
    'k': [
      'Không phát âm rõ "k" ở cuối từ',
      'Phát âm "k" quá mềm'
    ]
  };
  
  const errors = commonErrors[firstLetter] || [
    'Nhấn sai trọng âm trong từ',
    'Phát âm nguyên âm không chính xác',
    'Không phân biệt rõ giữa nguyên âm dài và ngắn'
  ];
  
  return (
    <>
      {errors.map((error, idx) => (
        <li key={idx}>{error}</li>
      ))}
    </>
  );
};

// Helper component for syllable breakdown
const SyllableBreakdown: React.FC<{ word: string }> = ({ word }) => {
  // Simple syllable analysis
  const syllables: string[] = [];
  let currentSyllable = '';
  const vowels = 'aeiouy';
  
  // Very simple syllable division - not perfect but gives an idea
  for (let i = 0; i < word.length; i++) {
    currentSyllable += word[i];
    
    // If this is a vowel and next char is consonant
    if (
      vowels.includes(word[i].toLowerCase()) && 
      i + 1 < word.length && 
      !vowels.includes(word[i+1].toLowerCase())
    ) {
      // Check if there are two consonants in a row
      if (
        i + 2 < word.length && 
        !vowels.includes(word[i+2].toLowerCase())
      ) {
        // End syllable after this vowel
        syllables.push(currentSyllable);
        currentSyllable = '';
      }
    }
  }
  
  // Add any remaining syllable
  if (currentSyllable) {
    syllables.push(currentSyllable);
  }
  
  // If we couldn't break it down, just use the word itself
  if (syllables.length === 0) {
    syllables.push(word);
  }
  
  return (
    <>
      {syllables.map((syllable, idx) => (
        <Card key={idx} className="p-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium text-lg">{syllable}</span>
              <span className="ml-3 text-sm text-gray-500">Âm tiết {idx + 1}</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => {
              const utterance = new SpeechSynthesisUtterance(syllable);
              speechSynthesis.speak(utterance);
            }}>
              <Volume2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {idx === 0 && syllables.length > 1 ? (
              <span>Nhấn mạnh âm tiết này</span>
            ) : (
              <span>Phát âm bình thường</span>
            )}
          </div>
        </Card>
      ))}
    </>
  );
};

// Helper component for practice sentences
const PracticeSentences: React.FC<{ word: string }> = ({ word }) => {
  // Generate some practice sentences based on the word
  const generateSentences = (word: string): string[] => {
    const commonSentenceTemplates = [
      `The ${word} is very important.`,
      `I like this ${word} very much.`,
      `Can you please give me that ${word}?`,
      `We need to talk about the ${word}.`,
      `How many ${word}s do you have?`
    ];
    
    const verbSentenceTemplates = [
      `I ${word} every day.`,
      `She ${word}s very well.`,
      `They will ${word} tomorrow.`,
      `Have you ever ${word}ed before?`,
      `We are ${word}ing right now.`
    ];
    
    const adjectiveSentenceTemplates = [
      `This is a very ${word} day.`,
      `The ${word} weather makes me happy.`,
      `I find this situation quite ${word}.`,
      `What a ${word} experience!`,
      `The most ${word} part was at the end.`
    ];
    
    // Try to guess if word is a verb, adjective or noun (very naive approach)
    if (word.endsWith('ing') || word.endsWith('ed') || 
        ['go', 'see', 'come', 'get', 'make', 'know', 'take', 'find', 'use', 'give', 
         'tell', 'work', 'call', 'try', 'ask', 'need', 'feel', 'become', 'leave', 'put'].includes(word)) {
      return verbSentenceTemplates;
    } else if (word.endsWith('y') || word.endsWith('al') || word.endsWith('ic') || word.endsWith('ous') || 
               word.endsWith('ful') || word.endsWith('less') ||
               ['good', 'new', 'old', 'big', 'high', 'small', 'large', 'long', 'great', 'little', 
                'own', 'other', 'right', 'only', 'same', 'next', 'best', 'sure'].includes(word)) {
      return adjectiveSentenceTemplates;
    } else {
      return commonSentenceTemplates;
    }
  };
  
  const sentences = generateSentences(word);
  
  return (
    <div className="space-y-3">
      {sentences.map((sentence, idx) => (
        <div key={idx} className="flex justify-between items-center">
          <p className="text-sm">{sentence}</p>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => {
            const utterance = new SpeechSynthesisUtterance(sentence);
            speechSynthesis.speak(utterance);
          }}>
            <Volume2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default WordPronunciationPractice;

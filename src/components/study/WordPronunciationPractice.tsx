
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Play, Square, Volume2, Lightbulb } from 'lucide-react';
import { analyzeWordPronunciation } from '@/utils/speechUtils';

interface WordPronunciationPracticeProps {
  isOpen: boolean;
  onClose: () => void;
  word: string;
  selectedVoice?: SpeechSynthesisVoice;
}

const WordPronunciationPractice: React.FC<WordPronunciationPracticeProps> = ({
  isOpen,
  onClose,
  word,
  selectedVoice
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [pronunciation, setPronunciation] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Reset state when word changes
  useEffect(() => {
    setRecordedAudio(null);
    setAudioURL(null);
    setScore(null);
    setPronunciation(null);
    setIsRecording(false);
    setIsAnalyzing(false);
  }, [word]);
  
  // Start recording function
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedAudio(blob);
        setAudioURL(URL.createObjectURL(blob));
        
        // Stop all tracks from the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };
  
  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };
  
  // Speak the word
  const speakWord = () => {
    if (!word) return;
    
    const utterance = new SpeechSynthesisUtterance(word);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    speechSynthesis.cancel(); // Cancel any ongoing speech
    speechSynthesis.speak(utterance);
  };
  
  // Analyze pronunciation
  const analyzePronunciation = async () => {
    if (!recordedAudio || !word) return;
    
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeWordPronunciation(word, recordedAudio);
      setPronunciation(result);
      setScore(result.score);
    } catch (error) {
      console.error("Error analyzing pronunciation:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-emerald-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  // Get progress bar color based on score
  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-emerald-400';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-400';
  };
  
  // If no word is selected, don't show the dialog
  if (!word) return null;
  
  return (
    <Dialog open={isOpen && !!word} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl text-gradient">Luyện phát âm từ</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <Card className="p-4 mb-4">
            <h2 className="text-2xl font-bold text-center mb-3">{word}</h2>
            
            <div className="flex justify-center mb-2">
              <Button 
                variant="outline"
                onClick={speakWord}
                className="flex items-center"
              >
                <Volume2 className="mr-2 h-4 w-4" />
                Nghe phát âm
              </Button>
            </div>
            
            {pronunciation && (
              <div className="text-center mb-3">
                <p className="text-sm text-gray-600">Phiên âm: [{pronunciation.correctIPA}]</p>
              </div>
            )}
            
            <div className="flex justify-center space-x-3 mt-4">
              {!isRecording ? (
                <Button 
                  onClick={startRecording} 
                  variant="default"
                  className="bg-hamaspeak-purple hover:bg-hamaspeak-purple/90"
                  disabled={isAnalyzing}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Bắt đầu ghi âm
                </Button>
              ) : (
                <Button 
                  onClick={stopRecording} 
                  variant="destructive"
                >
                  <Square className="mr-2 h-4 w-4" />
                  Dừng ghi âm
                </Button>
              )}
            </div>
          </Card>
          
          {recordedAudio && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Bản ghi âm của bạn</h3>
              
              <div className="flex items-center space-x-2 mb-4">
                <audio src={audioURL || ''} controls className="w-full" />
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={analyzePronunciation} 
                  disabled={isAnalyzing}
                  className="bg-hamaspeak-teal hover:bg-hamaspeak-teal/90"
                >
                  {isAnalyzing ? 'Đang phân tích...' : 'Phân tích phát âm'}
                </Button>
              </div>
            </div>
          )}
          
          {score !== null && pronunciation && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Kết quả phân tích</h3>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">Điểm phát âm:</span>
                  <span className={`font-bold text-lg ${getScoreColor(score)}`}>{score}/100</span>
                </div>
                
                <Progress value={score} className="h-2" />
                <div 
                  className={`h-2 rounded-full -mt-2 ${getProgressColor(score)}`}
                  style={{ 
                    width: `${score}%`,
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
              
              <Tabs defaultValue="feedback">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="feedback">Phản hồi</TabsTrigger>
                  <TabsTrigger value="compare">So sánh</TabsTrigger>
                </TabsList>
                
                <TabsContent value="feedback" className="space-y-4">
                  <Card className="p-4">
                    <div className="flex items-start">
                      <Lightbulb className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                      <p className="text-sm">{pronunciation.feedbackTip}</p>
                    </div>
                  </Card>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Âm cần lưu ý:</h4>
                    <div className="space-y-2">
                      {pronunciation.problemPhonemes
                        .filter((p: any) => !p.correct)
                        .map((phoneme: any, idx: number) => (
                          <Card key={idx} className="p-3 bg-gray-50">
                            <div className="flex items-start">
                              <span className="bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 text-xs mr-2">
                                Âm [{phoneme.phoneme}]
                              </span>
                              <span className="text-sm">
                                Tập trung vào vị trí của miệng và lưỡi khi phát âm
                              </span>
                            </div>
                          </Card>
                        ))}
                        
                      {pronunciation.problemPhonemes.filter((p: any) => !p.correct).length === 0 && (
                        <p className="text-sm text-gray-600">Không phát hiện lỗi âm nào. Phát âm tốt!</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="compare">
                  <Card className="p-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Phiên âm chuẩn:</h4>
                          <div className="bg-gray-50 p-2 rounded text-center">
                            [{pronunciation.correctIPA}]
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Phiên âm của bạn:</h4>
                          <div className="bg-gray-50 p-2 rounded text-center">
                            [{pronunciation.userIPA}]
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Thực hành:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Nghe phát âm mẫu vài lần</li>
                          <li>Chú ý đến vị trí miệng, lưỡi và môi khi phát âm</li>
                          <li>Tập nói từng âm riêng biệt trước, sau đó nói cả từ</li>
                          <li>Ghi âm và so sánh với mẫu</li>
                        </ol>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-center mt-6">
                <Button onClick={startRecording} disabled={isRecording} className="bg-hamaspeak-blue hover:bg-hamaspeak-blue/90">
                  <Mic className="mr-2 h-4 w-4" />
                  Thử lại
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WordPronunciationPractice;

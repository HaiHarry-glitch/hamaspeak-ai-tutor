
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Volume2, Video, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedPronunciationTipsProps {
  word: string;
  ipa: string;
  onClose?: () => void;
  onPlayAudio?: (word: string) => Promise<void>;
  soundType?: 'vowel' | 'consonant' | 'diphthong';
}

const EnhancedPronunciationTips: React.FC<EnhancedPronunciationTipsProps> = ({
  word,
  ipa,
  onClose,
  onPlayAudio,
  soundType = 'vowel'
}) => {
  // Helper function to get mouth position guidance based on sound
  const getMouthPositionGuidance = () => {
    // Detect sound type from word or IPA
    const firstChar = word.charAt(0).toLowerCase();
    const lastChar = word.charAt(word.length - 1).toLowerCase();
    
    // Simple mapping of common sounds to mouth positions
    if (/[aeiou]/.test(firstChar)) {
      return {
        image: "/lovable-uploads/148a1fd2-8c36-46f8-8ad4-01df9c96967a.png",
        description: "Mở miệng để phát âm rõ nguyên âm, tùy theo nguyên âm mà độ mở và hình dạng môi sẽ khác nhau.",
        tips: [
          "Giữ cằm thả lỏng khi phát âm",
          "Chú ý đến vị trí lưỡi theo hướng dẫn",
          "Phát âm nguyên âm rõ ràng không bị nuốt"
        ]
      };
    } else if (/[ptk]/.test(firstChar)) {
      return {
        image: "/lovable-uploads/b13ce414-0a10-4ab3-b8db-f04fcf7aa8ca.png", 
        description: "Phát âm phụ âm không vang bằng cách thả lưỡi hoặc môi đột ngột tạo tiếng nổ nhỏ.",
        tips: [
          "Đặt lưỡi hoặc môi ở đúng vị trí",
          "Giữ hơi trước khi thả ra",
          "Thả ra đột ngột để tạo âm rõ ràng"
        ]
      };
    } else if (/[bdg]/.test(firstChar)) {
      return {
        image: "/lovable-uploads/b8b03cf4-4eb8-414f-8983-95e926640e55.png",
        description: "Phát âm phụ âm vang bằng cách giữ dây thanh quản rung lên khi phát âm.",
        tips: [
          "Cảm nhận sự rung ở cổ họng khi phát âm",
          "Đảm bảo dây thanh quản hoạt động",
          "Giữ hơi đủ lâu để tạo âm vang"
        ]
      };
    } else {
      return {
        image: "/lovable-uploads/c3146207-9ae1-4262-99d7-da87abd01610.png",
        description: "Chú ý đến vị trí lưỡi, môi và dòng khí khi phát âm các phụ âm khác nhau.",
        tips: [
          "Quan sát hình ảnh miêu tả vị trí lưỡi",
          "Thực hành từng âm riêng biệt",
          "Kết hợp âm với nguyên âm để luyện tập"
        ]
      };
    }
  };
  
  const mouthPosition = getMouthPositionGuidance();
  
  // Get common pronunciation problems for Vietnamese speakers
  const getCommonProblems = () => {
    const commonIssues = {
      "th": {
        problem: "Người Việt thường phát âm 'th' như 't' hoặc 's'",
        solution: "Đặt lưỡi giữa răng, không phải sau răng"
      },
      "r": {
        problem: "Người Việt thường phát âm 'r' như 'z' hoặc 'j'",
        solution: "Uốn lưỡi lên phía sau, không chạm vào nóc miệng"
      },
      "l": {
        problem: "Phát âm 'l' không đúng vị trí lưỡi",
        solution: "Đặt đầu lưỡi vào nóc miệng phía sau răng cửa"
      },
      "v": {
        problem: "Người Việt thường phát âm 'v' như 'j'",
        solution: "Cắn nhẹ môi dưới và thổi hơi ra"
      },
      "s": {
        problem: "Phát âm 's' không rõ hoặc như 'x' trong tiếng Việt",
        solution: "Tạo rãnh giữa lưỡi và thổi hơi qua rãnh đó"
      }
      // More issues could be added
    };
    
    // Look for problematic sounds in the word
    for (const [sound, issue] of Object.entries(commonIssues)) {
      if (word.toLowerCase().includes(sound)) {
        return issue;
      }
    }
    
    return {
      problem: "Chú ý đến trọng âm và ngữ điệu khi phát âm từ này",
      solution: "Lắng nghe cẩn thận và bắt chước cách phát âm mẫu"
    };
  };
  
  const commonProblem = getCommonProblems();
  
  return (
    <Card className="p-4 border-2 border-blue-100 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-blue-700">Hướng dẫn phát âm: <span className="font-bold">{word}</span></h3>
      </div>
      
      <Tabs defaultValue="visual">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="visual">Trực quan</TabsTrigger>
          <TabsTrigger value="technical">Kỹ thuật</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visual" className="space-y-4">
          <div className="text-center">
            <img 
              src={mouthPosition.image}
              alt="Mouth position" 
              className="mx-auto mb-3 max-h-48 object-contain"
            />
            <p className="text-sm text-gray-700">{mouthPosition.description}</p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium mb-2 text-sm">Mẹo phát âm:</h4>
            <ul className="text-sm space-y-1">
              {mouthPosition.tips.map((tip, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <Button 
            className="w-full"
            onClick={() => onPlayAudio && onPlayAudio(word)}
          >
            <Volume2 className="mr-2 h-4 w-4" />
            Nghe mẫu phát âm
          </Button>
        </TabsContent>
        
        <TabsContent value="technical" className="space-y-4">
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex justify-between">
              <div>
                <h4 className="font-medium">Phát âm chuẩn:</h4>
                <div className="font-mono text-lg">[{ipa}]</div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onPlayAudio && onPlayAudio(word)}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <Info className="h-4 w-4 mr-1 text-amber-500" />
              Lỗi thường gặp:
            </h4>
            <p className="text-sm text-amber-700">{commonProblem.problem}</p>
            <h4 className="font-medium mt-3 mb-1">Khắc phục:</h4>
            <p className="text-sm text-green-700">{commonProblem.solution}</p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium mb-2">So sánh âm:</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-2 rounded">
                <div className="text-xs text-gray-500">Tiếng Anh:</div>
                <div className="font-medium">{word} [{ipa}]</div>
              </div>
              <div className="bg-white p-2 rounded">
                <div className="text-xs text-gray-500">Tiếng Việt tương tự:</div>
                <div className="font-medium">
                  {word.startsWith('th') ? '"t" hoặc "s"' :
                   word.startsWith('r') ? '"r" hoặc "z"' :
                   word.startsWith('v') ? '"v" hoặc "d"' :
                   "Không có âm tương đương"}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="video" className="text-center">
          <div className="bg-gray-100 p-10 rounded-lg mb-4 flex items-center justify-center">
            <div className="text-center">
              <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p>Video hướng dẫn phát âm</p>
              <p className="text-sm text-gray-500 mt-1">Nhấn nút bên dưới để xem video</p>
            </div>
          </div>
          
          <Button 
            className="w-full mb-3"
            variant="outline"
          >
            <Video className="mr-2 h-4 w-4" />
            Xem video hướng dẫn
          </Button>
          
          <p className="text-xs text-gray-500">
            Video sẽ hướng dẫn cách phát âm đúng cách, bao gồm những điểm cần lưu ý khi phát âm từ "{word}".
          </p>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default EnhancedPronunciationTips;

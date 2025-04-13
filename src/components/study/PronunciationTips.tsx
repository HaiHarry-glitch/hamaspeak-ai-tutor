
import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import {
  HelpCircle,
  Video,
  BookOpen,
  Lightbulb,
  Mic,
  Info,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PronunciationTipCategory {
  title: string;
  icon: React.ReactNode;
  tips: {
    title: string;
    description: string;
    videoUrl?: string;
    imageUrl?: string;
  }[];
}

const PronunciationTips = () => {
  const categories: PronunciationTipCategory[] = [
    {
      title: "Ngữ điệu (Intonation)",
      icon: <Volume2 className="h-4 w-4 text-blue-500" />,
      tips: [
        {
          title: "Lên giọng khi hỏi Yes/No",
          description: "Trong câu hỏi Yes/No, giọng thường lên cao ở cuối câu. Ví dụ: 'Are you ready?'",
          videoUrl: "#",
          imageUrl: "/assets/intonation-rising.png"
        },
        {
          title: "Xuống giọng khi kết thúc câu khẳng định",
          description: "Khi kết thúc câu khẳng định, giọng thường đi xuống. Ví dụ: 'I am ready.'",
          videoUrl: "#"
        },
        {
          title: "Nhấn mạnh từ quan trọng",
          description: "Nhấn mạnh từ quan trọng nhất trong câu để truyền tải ý nghĩa rõ ràng hơn.",
          videoUrl: "#"
        }
      ]
    },
    {
      title: "Trọng âm (Word Stress)",
      icon: <BookOpen className="h-4 w-4 text-green-500" />,
      tips: [
        {
          title: "Quy tắc trọng âm danh từ 2 âm tiết",
          description: "Hầu hết các danh từ có 2 âm tiết sẽ nhấn mạnh âm tiết đầu tiên: TABLE, WATER, PENCIL",
          videoUrl: "#",
          imageUrl: "/assets/word-stress-nouns.png"
        },
        {
          title: "Quy tắc trọng âm động từ 2 âm tiết",
          description: "Hầu hết các động từ có 2 âm tiết sẽ nhấn mạnh âm tiết thứ hai: preSENT, deCIDE, beCOME",
          videoUrl: "#"
        },
        {
          title: "Hậu tố ảnh hưởng đến trọng âm",
          description: "Các hậu tố như -tion, -sion, -ity thay đổi vị trí trọng âm: educate → educAtion",
          videoUrl: "#"
        }
      ]
    },
    {
      title: "Nối âm (Linking)",
      icon: <Lightbulb className="h-4 w-4 text-yellow-500" />,
      tips: [
        {
          title: "Nối âm từ kết thúc bằng phụ âm với từ bắt đầu bằng nguyên âm",
          description: "Khi một từ kết thúc bằng phụ âm và từ tiếp theo bắt đầu bằng nguyên âm, nối chúng lại: 'pick up' → 'pi-kup'",
          videoUrl: "#",
          imageUrl: "/assets/linking-consonant-vowel.png"
        },
        {
          title: "Thêm âm /j/ khi nối",
          description: "Khi từ kết thúc bằng /i:/, /ɪ/, /eɪ/, /ɔɪ/ và từ tiếp theo bắt đầu bằng nguyên âm, thêm âm /j/: 'she is' → 'she-yis'",
          videoUrl: "#"
        },
        {
          title: "Thêm âm /w/ khi nối",
          description: "Khi từ kết thúc bằng /u:/, /ʊ/, /aʊ/, /əʊ/ và từ tiếp theo bắt đầu bằng nguyên âm, thêm âm /w/: 'go out' → 'go-wout'",
          videoUrl: "#"
        }
      ]
    },
    {
      title: "Nhịp điệu (Rhythm)",
      icon: <Mic className="h-4 w-4 text-purple-500" />,
      tips: [
        {
          title: "Từ chức năng và từ nội dung",
          description: "Từ nội dung (danh từ, động từ chính, tính từ) được nhấn mạnh, còn từ chức năng (mạo từ, giới từ, trợ động từ) thường không nhấn mạnh.",
          videoUrl: "#",
          imageUrl: "/assets/rhythm-content-function.png"
        },
        {
          title: "Tập nói theo nhịp",
          description: "Sử dụng nhịp đập tay hoặc metronome để luyện tập nhịp điệu khi nói. Bắt đầu chậm rồi tăng dần tốc độ.",
          videoUrl: "#"
        },
        {
          title: "Chú ý các âm tiết được rút ngắn",
          description: "Trong tiếng Anh tự nhiên, các âm tiết không nhấn mạnh thường được phát âm nhanh và nhẹ hơn.",
          videoUrl: "#"
        }
      ]
    },
    {
      title: "Âm khó (Difficult Sounds)",
      icon: <Info className="h-4 w-4 text-red-500" />,
      tips: [
        {
          title: "Âm /θ/ và /ð/",
          description: "Đặt lưỡi giữa răng trên và dưới, thổi không khí qua khe hẹp. /θ/ là âm không thanh ('think'), /ð/ là âm hữu thanh ('the').",
          videoUrl: "#",
          imageUrl: "/assets/difficult-sounds-th.png"
        },
        {
          title: "Phân biệt /l/ và /r/",
          description: "Với âm /l/, đặt đầu lưỡi chạm vào phía sau răng cửa trên. Với âm /r/, cuộn lưỡi về phía sau mà không chạm vào bất kỳ phần nào của miệng.",
          videoUrl: "#"
        },
        {
          title: "Âm /w/ và /v/",
          description: "Với âm /w/, môi tròn và không chạm răng. Với âm /v/, răng trên chạm nhẹ vào môi dưới.",
          videoUrl: "#"
        }
      ]
    }
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Các mẹo phát âm tiếng Anh</h3>
        <HelpCircle className="h-5 w-5 text-blue-500" />
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Dưới đây là các mẹo giúp cải thiện phát âm tiếng Anh của bạn. Nhấn vào từng mục để xem chi tiết.
      </p>
      
      <Accordion type="single" collapsible className="w-full">
        {categories.map((category, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`}>
            <AccordionTrigger className="hover:text-blue-600 transition-colors">
              <div className="flex items-center gap-2">
                {category.icon}
                <span>{category.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {category.tips.map((tip, tipIdx) => (
                  <div key={tipIdx} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-1 mb-2">
                      <Lightbulb className="h-3 w-3 text-yellow-500" />
                      <h4 className="font-medium text-sm">{tip.title}</h4>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      {tip.description}
                    </p>
                    
                    {tip.imageUrl && (
                      <div className="bg-white border rounded-md p-2 mb-2 flex justify-center">
                        <div className="w-full h-24 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                          Hình minh họa: {tip.title}
                        </div>
                      </div>
                    )}
                    
                    {tip.videoUrl && (
                      <Button 
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                      >
                        <Video className="h-3 w-3 mr-2" /> Xem video hướng dẫn
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      <div className="mt-4 text-center">
        <Button className="text-sm">
          <Video className="h-4 w-4 mr-2" /> Xem tất cả video hướng dẫn
        </Button>
      </div>
    </Card>
  );
};

export default PronunciationTips;

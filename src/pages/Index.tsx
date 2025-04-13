
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import HamaspeakLogo from '@/components/HamaspeakLogo';
import Scene3D from '@/components/3d/Scene3D';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, BookOpen, Laptop, MessageSquare } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Index = () => {
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 overflow-hidden">
      {/* 3D background effects */}
      <div className="fixed inset-0 z-0 opacity-50 pointer-events-none">
        <Scene3D className="h-full" brain={true} particles={true} height="100%" />
      </div>
      
      <div className="relative z-10">
        <Header className="absolute top-0 left-0 right-0" />
        
        <main className="container mx-auto px-4 pt-32 pb-16 md:pt-40">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="relative">
                <HamaspeakLogo className="w-44 md:w-56 mb-6" />
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gradient">
                  Phương Pháp Học Tiếng Anh<br />
                  <span className="text-3xl md:text-4xl">Hiệu Quả & Thông Minh</span>
                </h1>
              </div>
              
              <p className="text-lg md:text-xl text-gray-600 max-w-lg">
                Ứng dụng trí tuệ nhân tạo hỗ trợ người Việt Nam học tiếng Anh 
                với 8 bước đột phá giúp bạn phát âm chuẩn và tự tin giao tiếp.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="text-md glass-button">
                  <Link to="/study">
                    Bắt Đầu Học Ngay
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="text-md">
                  <Link to="/method">
                    Tìm Hiểu Phương Pháp
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="h-64 md:h-80 lg:h-96">
                <div className="absolute inset-0 md:-top-12 md:scale-125">
                  <Scene3D brain={true} particles={false} height="100%" />
                </div>
              </div>
              
              <div className="absolute bottom-4 right-4 md:bottom-0 md:right-0">
                <span className="bg-background/80 backdrop-blur-sm text-sm text-muted-foreground px-3 py-1 rounded-full">
                  AI-Powered Learning
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-24 md:mt-32">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Tại sao chọn <span className="text-gradient">Hamaspeak</span>?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card/30 backdrop-blur-sm p-6 rounded-lg border border-border/50 hover-scale">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Laptop className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Học Tập Thông Minh</h3>
                <p className="text-muted-foreground">
                  Phương pháp 8 bước độc đáo giúp não bộ xử lý từ đơn giản đến phức tạp,
                  từ nghe đến nói để phát triển kỹ năng giao tiếp.
                </p>
              </div>
              
              <div className="bg-card/30 backdrop-blur-sm p-6 rounded-lg border border-border/50 hover-scale">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Nội Dung Cá Nhân Hoá</h3>
                <p className="text-muted-foreground">
                  Học với bất kỳ nội dung nào bạn chọn. Tự do nhập văn bản, bài báo 
                  hay đoạn hội thoại bạn muốn thực hành.
                </p>
              </div>
              
              <div className="bg-card/30 backdrop-blur-sm p-6 rounded-lg border border-border/50 hover-scale">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Giọng Nói Tương Tác</h3>
                <p className="text-muted-foreground">
                  Công nghệ AI phân tích phát âm của bạn, cho phép bạn luyện tập với
                  phản hồi và điều chỉnh theo thời gian thực.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;

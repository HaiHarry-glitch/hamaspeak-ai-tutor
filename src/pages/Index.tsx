
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import Header from '@/components/Header';

interface HeaderProps {
  className?: string;
}

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-hamaspeak-bg to-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-12 mt-12 md:mt-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
            Hamaspeak
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto">
            Ứng dụng luyện nói tiếng Anh hiệu quả với AI
          </p>
        </section>
        
        <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="p-8 glass-card transform transition-all hover:scale-105">
            <h2 className="text-2xl font-bold mb-4 text-hamaspeak-dark">
              8 bước luyện nói mỗi ngày
            </h2>
            <p className="text-gray-600 mb-6">
              Phương pháp khoa học giúp bạn phát triển kỹ năng nói tiếng Anh 
              một cách toàn diện từ phát âm, từ vựng đến phản xạ giao tiếp.
            </p>
            <Link to="/study">
              <Button className="w-full glass-button">
                Bắt đầu luyện tập <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>
          
          <Card className="p-8 glass-card transform transition-all hover:scale-105">
            <h2 className="text-2xl font-bold mb-4 text-hamaspeak-dark">
              Khám phá phương pháp
            </h2>
            <p className="text-gray-600 mb-6">
              Tìm hiểu về khoa học đằng sau phương pháp học ngôn ngữ mới
              và cách Hamaspeak áp dụng công nghệ AI để hỗ trợ việc học.
            </p>
            <Link to="/method">
              <Button className="w-full glass-button">
                Khám phá phương pháp <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </section>
        
        <section className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-hamaspeak-dark">
            Tại sao chọn Hamaspeak?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="w-16 h-16 rounded-full bg-hamaspeak-purple/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-hamaspeak-purple text-2xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Phương pháp khoa học</h3>
              <p className="text-gray-600">Dựa trên nghiên cứu về cách não bộ học ngôn ngữ hiệu quả</p>
            </div>
            
            <div>
              <div className="w-16 h-16 rounded-full bg-hamaspeak-teal/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-hamaspeak-teal text-2xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Đánh giá chi tiết</h3>
              <p className="text-gray-600">Nhận phản hồi cụ thể về phát âm và cách cải thiện</p>
            </div>
            
            <div>
              <div className="w-16 h-16 rounded-full bg-hamaspeak-purple/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-hamaspeak-purple text-2xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Thực hành hàng ngày</h3>
              <p className="text-gray-600">Luyện tập mỗi ngày với các bài học ngắn hiệu quả</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;

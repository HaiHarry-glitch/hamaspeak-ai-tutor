
import React from 'react';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, MessageCircle, Users, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-2 text-gradient">Về Hamaspeak</h1>
            <p className="text-lg text-gray-600">
              Nền tảng học nói tiếng Anh hiệu quả cùng Hải Harry
            </p>
          </div>
          
          <div className="glass-card p-8 mb-10">
            <div className="flex flex-col md:flex-row gap-6 items-center mb-8">
              <div className="w-40 h-40 rounded-full bg-gradient-to-r from-hamaspeak-blue to-hamaspeak-purple flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                <span className="text-white text-5xl font-bold">HH</span>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-2 text-hamaspeak-purple">Hải Harry</h2>
                <p className="text-gray-600 mb-4">Người sáng lập Hamaspeak</p>
                <p className="mb-2">
                  Với hơn 10 năm kinh nghiệm giảng dạy tiếng Anh, Hải Harry đã phát triển 
                  phương pháp Hamaspeak để giúp hàng ngàn người Việt Nam tự tin nói tiếng Anh.
                </p>
                <p>
                  Phương pháp độc đáo 8 bước của Hải Harry tập trung vào việc phát triển kỹ năng 
                  nói thông qua các bài tập tương tác và phản hồi tức thời.
                </p>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-6 text-center">Tại sao chọn Hamaspeak?</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <Card className="glass-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start mb-4">
                <div className="bg-hamaspeak-blue/10 p-3 rounded-full mr-4">
                  <BookOpen className="h-6 w-6 text-hamaspeak-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-hamaspeak-blue">Phương pháp khoa học</h3>
                </div>
              </div>
              <p>
                Phương pháp 8 bước được thiết kế dựa trên nghiên cứu về cách học ngôn ngữ hiệu quả, 
                giúp phát triển đồng thời nhiều kỹ năng ngôn ngữ.
              </p>
            </Card>
            
            <Card className="glass-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start mb-4">
                <div className="bg-hamaspeak-purple/10 p-3 rounded-full mr-4">
                  <MessageCircle className="h-6 w-6 text-hamaspeak-purple" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-hamaspeak-purple">Phản hồi tức thời</h3>
                </div>
              </div>
              <p>
                Công nghệ nhận diện giọng nói tiên tiến giúp đánh giá phát âm và cung cấp 
                phản hồi ngay lập tức, giúp người học cải thiện nhanh chóng.
              </p>
            </Card>
            
            <Card className="glass-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start mb-4">
                <div className="bg-hamaspeak-teal/10 p-3 rounded-full mr-4">
                  <Users className="h-6 w-6 text-hamaspeak-teal" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-hamaspeak-teal">Cộng đồng học tập</h3>
                </div>
              </div>
              <p>
                Tham gia cộng đồng Hamaspeak để chia sẻ kinh nghiệm, động viên nhau và 
                cùng tiến bộ trong việc học tiếng Anh.
              </p>
            </Card>
            
            <Card className="glass-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start mb-4">
                <div className="bg-hamaspeak-blue/10 p-3 rounded-full mr-4">
                  <Award className="h-6 w-6 text-hamaspeak-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-hamaspeak-blue">Kết quả thực tế</h3>
                </div>
              </div>
              <p>
                Hàng ngàn học viên đã cải thiện khả năng nói tiếng Anh của mình với Hamaspeak, 
                đạt được sự tự tin trong giao tiếp hàng ngày và công việc.
              </p>
            </Card>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Bắt đầu hành trình học tiếng Anh ngay hôm nay</h2>
            <Link to="/study">
              <Button className="glass-button px-8 py-6 text-lg">
                Học ngay với Hamaspeak
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

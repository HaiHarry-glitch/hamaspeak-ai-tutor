
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import HamaspeakLogo from '@/components/HamaspeakLogo';
import { Mic, VolumeUp, CheckCircle, ArrowRight, User, Star, Sparkles } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-gradient">Hamaspeak: </span> 
                <span className="block mt-2">Học nói tiếng Anh cực dễ</span>
              </h1>
              <p className="text-lg mb-8 text-gray-700">
                Phương pháp học độc đáo với 8 bước giúp bạn nói tiếng Anh tự tin và 
                trôi chảy cùng Hải Harry.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/study">
                  <Button className="glass-button px-8 py-6 text-lg">
                    Học ngay
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/method">
                  <Button variant="outline" className="px-8 py-6 text-lg">
                    Tìm hiểu phương pháp
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="md:w-1/2 relative">
              <div className="w-72 h-72 md:w-96 md:h-96 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-radial from-hamaspeak-purple/20 to-transparent rounded-full animate-pulse-glow"></div>
                <div className="absolute w-full h-full flex items-center justify-center">
                  <HamaspeakLogo size={120} showText={false} className="animate-float" />
                </div>
                <div className="absolute top-10 left-0 glass-card p-4 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center">
                    <div className="bg-hamaspeak-blue/10 p-2 rounded-full mr-3">
                      <VolumeUp className="h-5 w-5 text-hamaspeak-blue" />
                    </div>
                    <span className="font-medium">Luyện nghe</span>
                  </div>
                </div>
                <div className="absolute bottom-20 right-0 glass-card p-4 shadow-lg animate-float" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center">
                    <div className="bg-hamaspeak-purple/10 p-2 rounded-full mr-3">
                      <Mic className="h-5 w-5 text-hamaspeak-purple" />
                    </div>
                    <span className="font-medium">Luyện nói</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-10 glass-card p-4 shadow-lg animate-float" style={{ animationDelay: '3s' }}>
                  <div className="flex items-center">
                    <div className="bg-hamaspeak-teal/10 p-2 rounded-full mr-3">
                      <CheckCircle className="h-5 w-5 text-hamaspeak-teal" />
                    </div>
                    <span className="font-medium">Chấm điểm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Feature Section */}
      <section className="py-16 bg-gradient-to-r from-hamaspeak-blue/5 to-hamaspeak-purple/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Đặc điểm nổi bật</h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-600">
              Hamaspeak cung cấp một phương pháp học toàn diện, giúp bạn cải thiện khả năng nói tiếng Anh nhanh chóng
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card p-6 hover:shadow-xl transition-all">
              <div className="bg-hamaspeak-blue/10 p-4 rounded-full inline-flex mb-4">
                <VolumeUp className="h-8 w-8 text-hamaspeak-blue" />
              </div>
              <h3 className="text-xl font-bold mb-3">Luyện nghe chuyên sâu</h3>
              <p>
                Nghe và làm quen với phát âm chuẩn của từng cụm từ tiếng Anh, giúp bạn 
                nhận biết được các âm tiếng Anh chính xác.
              </p>
            </Card>
            
            <Card className="glass-card p-6 hover:shadow-xl transition-all">
              <div className="bg-hamaspeak-purple/10 p-4 rounded-full inline-flex mb-4">
                <Mic className="h-8 w-8 text-hamaspeak-purple" />
              </div>
              <h3 className="text-xl font-bold mb-3">Luyện nói có phản hồi</h3>
              <p>
                Nói tiếng Anh và nhận phản hồi tức thời về độ chính xác của phát âm, 
                giúp bạn cải thiện nhanh chóng.
              </p>
            </Card>
            
            <Card className="glass-card p-6 hover:shadow-xl transition-all">
              <div className="bg-hamaspeak-teal/10 p-4 rounded-full inline-flex mb-4">
                <Sparkles className="h-8 w-8 text-hamaspeak-teal" />
              </div>
              <h3 className="text-xl font-bold mb-3">Phân tích AI</h3>
              <p>
                Công nghệ AI tiên tiến phân tích đoạn văn thành các cụm từ có ý nghĩa, 
                giúp bạn học hiệu quả hơn.
              </p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Method Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Phương pháp 8 bước</h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-600">
              Tiếp cận tập trung vào kỹ năng nói thông qua 8 bước được thiết kế khoa học
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-4 inset-y-0 w-1 bg-gradient-to-b from-hamaspeak-blue via-hamaspeak-purple to-hamaspeak-teal"></div>
              
              <div className="space-y-8 relative">
                <div className="flex">
                  <div className="bg-hamaspeak-blue text-white rounded-full h-9 w-9 flex items-center justify-center font-bold relative z-10 mr-6">1</div>
                  <div className="glass-card p-4 flex-1">
                    <h3 className="font-bold mb-1">Luyện nghe</h3>
                    <p className="text-gray-600">Nghe và nhìn từng cụm từ tiếng Anh</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="bg-hamaspeak-purple text-white rounded-full h-9 w-9 flex items-center justify-center font-bold relative z-10 mr-6">2</div>
                  <div className="glass-card p-4 flex-1">
                    <h3 className="font-bold mb-1">Hiểu nghĩa</h3>
                    <p className="text-gray-600">Đọc nghĩa tiếng Việt của từng cụm từ</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="bg-hamaspeak-teal text-white rounded-full h-9 w-9 flex items-center justify-center font-bold relative z-10 mr-6">3</div>
                  <div className="glass-card p-4 flex-1">
                    <h3 className="font-bold mb-1">Nghe và nhắc lại</h3>
                    <p className="text-gray-600">Lặp lại từng cụm từ tiếng Anh và được chấm điểm</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="bg-hamaspeak-blue text-white rounded-full h-9 w-9 flex items-center justify-center font-bold relative z-10 mr-6">4</div>
                  <div className="glass-card p-4 flex-1">
                    <h3 className="font-bold mb-1">Nói theo nghĩa</h3>
                    <p className="text-gray-600">Nhìn nghĩa tiếng Việt và nói bằng tiếng Anh</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="bg-hamaspeak-purple text-white rounded-full h-9 w-9 flex items-center justify-center font-bold relative z-10 mr-6">5</div>
                  <div className="glass-card p-4 flex-1">
                    <h3 className="font-bold mb-1">Luyện nghe câu dài</h3>
                    <p className="text-gray-600">Nghe và hiểu các câu hoàn chỉnh</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="bg-hamaspeak-teal text-white rounded-full h-9 w-9 flex items-center justify-center font-bold relative z-10 mr-6">6</div>
                  <div className="glass-card p-4 flex-1">
                    <h3 className="font-bold mb-1">Luyện nói từng câu</h3>
                    <p className="text-gray-600">Nói lại các câu hoàn chỉnh với gợi ý</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="bg-hamaspeak-blue text-white rounded-full h-9 w-9 flex items-center justify-center font-bold relative z-10 mr-6">7</div>
                  <div className="glass-card p-4 flex-1">
                    <h3 className="font-bold mb-1">Luyện nói cả đoạn</h3>
                    <p className="text-gray-600">Nói lại toàn bộ đoạn văn với gợi ý</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="bg-hamaspeak-purple text-white rounded-full h-9 w-9 flex items-center justify-center font-bold relative z-10 mr-6">8</div>
                  <div className="glass-card p-4 flex-1">
                    <h3 className="font-bold mb-1">Nói hoàn chỉnh</h3>
                    <p className="text-gray-600">Nói toàn bộ đoạn văn chỉ với nghĩa tiếng Việt</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Link to="/method">
                <Button variant="outline" className="px-6">
                  Tìm hiểu thêm về phương pháp
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-gradient-to-r from-hamaspeak-blue/5 to-hamaspeak-purple/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Người học nói gì về Hamaspeak</h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-600">
              Hàng ngàn người đã cải thiện kỹ năng nói tiếng Anh của họ với Hamaspeak
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-hamaspeak-blue/20 rounded-full flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-hamaspeak-blue" />
                </div>
                <div>
                  <h4 className="font-bold">Nguyễn Văn A</h4>
                  <div className="flex text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </div>
              <p className="italic">
                "Sau 3 tháng học với Hamaspeak, tôi đã tự tin giao tiếp tiếng Anh trong công việc. 
                Phương pháp 8 bước thực sự hiệu quả!"
              </p>
            </Card>
            
            <Card className="glass-card p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-hamaspeak-purple/20 rounded-full flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-hamaspeak-purple" />
                </div>
                <div>
                  <h4 className="font-bold">Trần Thị B</h4>
                  <div className="flex text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </div>
              <p className="italic">
                "Phần mềm chấm điểm phát âm giúp tôi nhận ra những lỗi sai của mình. 
                Giờ đây phát âm của tôi đã cải thiện rất nhiều!"
              </p>
            </Card>
            
            <Card className="glass-card p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-hamaspeak-teal/20 rounded-full flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-hamaspeak-teal" />
                </div>
                <div>
                  <h4 className="font-bold">Lê Văn C</h4>
                  <div className="flex text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </div>
              <p className="italic">
                "Cách học theo cụm từ nhỏ rất hiệu quả. Tôi không còn cảm thấy quá tải khi học 
                những đoạn văn dài nữa."
              </p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto glass-card p-10 text-center bg-gradient-to-r from-hamaspeak-blue/10 via-hamaspeak-purple/10 to-hamaspeak-teal/10">
            <h2 className="text-3xl font-bold mb-4">Sẵn sàng nói tiếng Anh tự tin?</h2>
            <p className="text-lg mb-8">
              Bắt đầu hành trình học tiếng Anh với phương pháp 8 bước Hamaspeak ngay hôm nay!
            </p>
            <Link to="/study">
              <Button className="glass-button px-8 py-6 text-lg">
                Học ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

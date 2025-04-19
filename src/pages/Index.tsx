
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, BookOpen, GraduationCap, BarChart, Award } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Hamaspeak
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-10">
            Nền tảng học tiếng Anh thông minh với công nghệ AI nhận diện phát âm
          </p>
          
          <div className="space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row justify-center">
            <Button 
              asChild
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-lg py-6 px-8"
            >
              <Link to="/study">
                <Mic className="mr-2 h-5 w-5" /> 
                Luyện nói ngay
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-blue-600 text-blue-600 hover:bg-blue-50 text-lg py-6 px-8"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Tìm hiểu thêm
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tính năng nổi bật</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Phân tích phát âm" 
              description="Công nghệ AI nhận diện và đánh giá khả năng phát âm của bạn, đưa ra phản hồi chi tiết."
              icon={<Mic />}
            />
            
            <FeatureCard 
              title="Học từ vựng theo chủ đề" 
              description="Hệ thống học từ vựng được phân loại theo chủ đề, giúp bạn ghi nhớ hiệu quả."
              icon={<BookOpen />}
            />
            
            <FeatureCard 
              title="Luyện tập toàn diện" 
              description="8 bước luyện tập từ đơn giản đến phức tạp, giúp nâng cao kỹ năng nói."
              icon={<GraduationCap />}
            />
          </div>
        </div>
      </section>
      
      {/* How it works */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Quy trình học tập</h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-0 ml-6 md:ml-8 h-full w-0.5 bg-blue-300"></div>
              
              <StepItem 
                number="1" 
                title="Nhập văn bản hoặc chọn chủ đề"
                description="Bắt đầu bằng việc nhập văn bản bạn muốn luyện tập hoặc chọn một chủ đề có sẵn."
              />
              
              <StepItem 
                number="2" 
                title="Nghe và làm quen với từ vựng"
                description="Nghe phát âm chuẩn và làm quen với từng từ vựng, cụm từ trong bài."
              />
              
              <StepItem 
                number="3" 
                title="Luyện tập phát âm"
                description="Luyện tập phát âm từng cụm từ, nhận phản hồi chi tiết về độ chính xác."
              />
              
              <StepItem 
                number="4" 
                title="Hoàn thành bài tập"
                description="Thực hiện các bài tập như điền vào chỗ trống, trả lời câu hỏi để củng cố kiến thức."
              />
              
              <StepItem 
                number="5" 
                title="Nói toàn bộ đoạn văn"
                description="Nói toàn bộ đoạn văn và nhận đánh giá tổng thể về khả năng phát âm của bạn."
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Gói dịch vụ</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PriceCard 
              title="Miễn phí"
              price="0"
              features={[
                "3 lượt sử dụng miễn phí",
                "Phân tích phát âm cơ bản",
                "Truy cập các chủ đề có sẵn"
              ]}
              buttonText="Bắt đầu miễn phí"
              highlighted={false}
              to="/study"
            />
            
            <PriceCard 
              title="Tiêu chuẩn"
              price="99k"
              period="/tháng"
              features={[
                "Không giới hạn lượt sử dụng",
                "Phân tích phát âm chi tiết",
                "Tất cả chủ đề IELTS/TOEIC",
                "Lịch sử luyện tập"
              ]}
              buttonText="Đăng ký ngay"
              highlighted={true}
              to="/pricing"
            />
            
            <PriceCard 
              title="Premium"
              price="199k"
              period="/tháng"
              features={[
                "Tất cả tính năng Tiêu chuẩn",
                "Tư vấn 1-1 với giáo viên",
                "Lộ trình học cá nhân hóa",
                "Ưu tiên cập nhật tính năng mới"
              ]}
              buttonText="Nâng cấp"
              highlighted={false}
              to="/pricing"
            />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">Hamaspeak</h3>
              <p className="text-gray-400">© 2023 Hamaspeak. Mọi quyền được bảo lưu.</p>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="hover:text-blue-400">Điều khoản</a>
              <a href="#" className="hover:text-blue-400">Chính sách</a>
              <a href="#" className="hover:text-blue-400">Liên hệ</a>
              <a href="#" className="hover:text-blue-400">Trợ giúp</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature card component
const FeatureCard = ({ title, description, icon }) => {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="bg-blue-100 text-blue-600 w-12 h-12 flex items-center justify-center rounded-full mb-4">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
};

// Step item component
const StepItem = ({ number, title, description }) => {
  return (
    <div className="relative pl-12 md:pl-16 pb-10">
      <div className="absolute left-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Price card component
const PriceCard = ({ title, price, period = "", features, buttonText, highlighted, to }) => {
  return (
    <Card className={`border ${highlighted ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-200'}`}>
      <CardHeader className={highlighted ? 'bg-blue-50' : ''}>
        <CardTitle className="text-xl mb-2">{title}</CardTitle>
        <div className="text-3xl font-bold flex items-baseline">
          {price}<span className="text-sm font-normal text-gray-500 ml-1">{period}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Award className="h-4 w-4 mr-2 text-blue-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          asChild
          className={`w-full ${highlighted ? 'bg-blue-600 hover:bg-blue-700' : ''}`} 
          variant={highlighted ? 'default' : 'outline'}
        >
          <Link to={to}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Index;

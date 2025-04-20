import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TextRotate } from '@/components/ui/text-rotate';
import { Mic, BookOpen, GraduationCap, Award } from 'lucide-react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { cn } from "@/lib/utils"

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-4 overflow-hidden">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-white">
            Hamaspeak
          </h1>
          <div className="text-xl md:text-2xl text-gray-300 mb-10">
            <p className="mb-4">Nền tảng học tiếng Anh thông minh với</p>
            <TextRotate 
              words={[
                "công nghệ AI nhận diện phát âm",
                "phân tích phát âm chi tiết",
                "luyện tập toàn diện"
              ]}
              className="h-24"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center mt-12">
            <Button 
              asChild
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-lg py-6 px-8 rounded-full"
            >
              <Link to="/study">
                <Mic className="mr-2 h-5 w-5" /> 
                Luyện nói ngay
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-900/10 text-lg py-6 px-8 rounded-full"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Tìm hiểu thêm
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/30 rounded-full filter blur-3xl animate-blob" />
          <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-purple-500/30 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-pink-500/30 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-black/50 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Tính năng nổi bật
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Gói dịch vụ
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={cn(
                  "bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300",
                  plan.highlighted && "border-blue-500 scale-105"
                )}
              >
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">{plan.title}</CardTitle>
                  <div className="text-3xl font-bold text-white flex items-baseline">
                    {plan.price}<span className="text-sm font-normal text-gray-400 ml-1">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-300">
                        <Award className="h-4 w-4 mr-2 text-blue-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    asChild
                    className={cn(
                      "w-full rounded-full",
                      plan.highlighted ? "bg-blue-600 hover:bg-blue-700" : "border-2 border-blue-600 bg-transparent hover:bg-blue-900/10"
                    )}
                  >
                    <Link to={plan.to}>{plan.buttonText}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    title: "Phân tích phát âm",
    description: "Công nghệ AI nhận diện và đánh giá khả năng phát âm của bạn, đưa ra phản hồi chi tiết.",
    icon: <Mic className="w-6 h-6 text-blue-400" />
  },
  {
    title: "Học từ vựng theo chủ đề",
    description: "Hệ thống học từ vựng được phân loại theo chủ đề, giúp bạn ghi nhớ hiệu quả.",
    icon: <BookOpen className="w-6 h-6 text-blue-400" />
  },
  {
    title: "Luyện tập toàn diện",
    description: "8 bước luyện tập từ đơn giản đến phức tạp, giúp nâng cao kỹ năng nói.",
    icon: <GraduationCap className="w-6 h-6 text-blue-400" />
  }
];

const pricingPlans = [
  {
    title: "Miễn phí",
    price: "0",
    features: [
      "3 lượt sử dụng miễn phí",
      "Phân tích phát âm cơ bản",
      "Truy cập các chủ đề có sẵn"
    ],
    buttonText: "Bắt đầu miễn phí",
    highlighted: false,
    to: "/study"
  },
  {
    title: "Tiêu chuẩn",
    price: "99k",
    period: "/tháng",
    features: [
      "Không giới hạn lượt sử dụng",
      "Phân tích phát âm chi tiết",
      "Tất cả chủ đề IELTS/TOEIC",
      "Lịch sử luyện tập"
    ],
    buttonText: "Đăng ký ngay",
    highlighted: true,
    to: "/pricing"
  },
  {
    title: "Premium",
    price: "199k",
    period: "/tháng",
    features: [
      "Tất cả tính năng Tiêu chuẩn",
      "Tư vấn 1-1 với giáo viên",
      "Lộ trình học cá nhân hóa",
      "Ưu tiên cập nhật tính năng mới"
    ],
    buttonText: "Nâng cấp",
    highlighted: false,
    to: "/pricing"
  }
];

export default Index;

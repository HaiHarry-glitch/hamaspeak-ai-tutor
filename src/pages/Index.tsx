
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import HamaspeakLogo from '@/components/HamaspeakLogo';
import { Mic, Volume, CheckCircle, ArrowRight, User, Star, Sparkles, ChevronDown, Play } from 'lucide-react';

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({
    hero: false,
    features: false,
    method: false,
    testimonials: false,
    cta: false
  });

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      // Check if page is scrolled
      setIsScrolled(window.scrollY > 50);
      
      // Check which sections are visible
      const sections = document.querySelectorAll('section[id]');
      const checkVisibility = () => {
        const newVisibility: Record<string, boolean> = {...visibleSections};
        
        sections.forEach((section) => {
          const sectionId = section.id;
          const sectionTop = section.getBoundingClientRect().top;
          const isVisible = sectionTop < window.innerHeight - 100;
          
          if (isVisible) {
            newVisibility[sectionId] = true;
          }
        });
        
        setVisibleSections(newVisibility);
      };
      
      checkVisibility();
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial load
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleSections]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header className={`transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm' : ''}`} />
      
      {/* Hero Section */}
      <section id="hero" className={`py-16 md:py-24 transition-all duration-1000 ${visibleSections.hero ? 'opacity-100' : 'opacity-0'}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2 transform transition-all duration-700 delay-300" 
                style={{ 
                  transform: visibleSections.hero ? 'translateX(0)' : 'translateX(-50px)',
                  opacity: visibleSections.hero ? 1 : 0
                }}>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                <span className="text-gradient animate-gradient-shift">Hamaspeak: </span> 
                <span className="block mt-2 drop-shadow-sm">Học nói tiếng Anh cực dễ</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-700 max-w-xl">
                Phương pháp học độc đáo với 8 bước giúp bạn nói tiếng Anh tự tin và 
                trôi chảy cùng Hải Harry.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/study">
                  <Button className="glass-button px-8 py-6 text-lg group relative overflow-hidden">
                    <span className="relative z-10 flex items-center">
                      Học ngay
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 bg-white/20 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500"></span>
                  </Button>
                </Link>
                <Link to="/method">
                  <Button variant="outline" className="px-8 py-6 text-lg border-2 hover:bg-gray-100/50 transition-all duration-300 hover:border-hamaspeak-purple">
                    Tìm hiểu phương pháp
                  </Button>
                </Link>
              </div>
              
              <div className="mt-8 flex">
                <button 
                  onClick={() => scrollToSection('features')}
                  className="flex items-center gap-2 text-gray-600 hover:text-hamaspeak-purple transition-colors animate-bounce-slow"
                >
                  <span>Khám phá thêm</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="md:w-1/2 relative transform transition-all duration-700 delay-500" 
                style={{ 
                  transform: visibleSections.hero ? 'translateX(0)' : 'translateX(50px)',
                  opacity: visibleSections.hero ? 1 : 0
                }}>
              <div className="w-72 h-72 md:w-96 md:h-96 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-radial from-hamaspeak-purple/20 to-transparent rounded-full animate-pulse-glow"></div>
                <div className="absolute w-full h-full flex items-center justify-center">
                  <HamaspeakLogo size={150} showText={false} className="animate-float" interactive={true} />
                </div>
                <div className="absolute top-10 left-0 glass-card p-4 shadow-lg animate-float hover:scale-105 transition-transform duration-300" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center">
                    <div className="bg-hamaspeak-blue/10 p-2 rounded-full mr-3">
                      <Volume className="h-5 w-5 text-hamaspeak-blue" />
                    </div>
                    <span className="font-medium">Luyện nghe</span>
                  </div>
                </div>
                <div className="absolute bottom-20 right-0 glass-card p-4 shadow-lg animate-float hover:scale-105 transition-transform duration-300" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center">
                    <div className="bg-hamaspeak-purple/10 p-2 rounded-full mr-3">
                      <Mic className="h-5 w-5 text-hamaspeak-purple" />
                    </div>
                    <span className="font-medium">Luyện nói</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-10 glass-card p-4 shadow-lg animate-float hover:scale-105 transition-transform duration-300" style={{ animationDelay: '3s' }}>
                  <div className="flex items-center">
                    <div className="bg-hamaspeak-teal/10 p-2 rounded-full mr-3">
                      <CheckCircle className="h-5 w-5 text-hamaspeak-teal" />
                    </div>
                    <span className="font-medium">Chấm điểm</span>
                  </div>
                </div>
                
                {/* Add netflix-style play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <Link to="/study" className="bg-white/90 rounded-full p-4 shadow-xl transform hover:scale-110 transition-transform">
                    <Play className="h-12 w-12 text-hamaspeak-purple fill-hamaspeak-purple" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Feature Section */}
      <section id="features" className={`py-16 bg-gradient-to-r from-hamaspeak-blue/5 to-hamaspeak-purple/5 transition-all duration-1000 relative overflow-hidden ${visibleSections.features ? 'opacity-100' : 'opacity-0'}`}>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-hamaspeak-blue rounded-full filter blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-hamaspeak-purple rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 transform transition-all duration-700"
              style={{ 
                transform: visibleSections.features ? 'translateY(0)' : 'translateY(50px)',
                opacity: visibleSections.features ? 1 : 0
              }}>
            <h2 className="text-3xl font-bold mb-4">Đặc điểm nổi bật</h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-600">
              Hamaspeak cung cấp một phương pháp học toàn diện, giúp bạn cải thiện khả năng nói tiếng Anh nhanh chóng
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card p-6 hover:shadow-xl transition-all transform hover:-translate-y-2 duration-300 border-t-4 border-hamaspeak-blue"
                  style={{ 
                    transform: visibleSections.features ? 'translateY(0)' : 'translateY(50px)',
                    opacity: visibleSections.features ? 1 : 0,
                    transitionDelay: '200ms',
                    transitionDuration: '700ms'
                  }}>
              <div className="bg-hamaspeak-blue/10 p-4 rounded-full inline-flex mb-4 animate-pulse-slow">
                <Volume className="h-8 w-8 text-hamaspeak-blue" />
              </div>
              <h3 className="text-xl font-bold mb-3">Luyện nghe chuyên sâu</h3>
              <p>
                Nghe và làm quen với phát âm chuẩn của từng cụm từ tiếng Anh, giúp bạn 
                nhận biết được các âm tiếng Anh chính xác.
              </p>
            </Card>
            
            <Card className="glass-card p-6 hover:shadow-xl transition-all transform hover:-translate-y-2 duration-300 border-t-4 border-hamaspeak-purple"
                  style={{ 
                    transform: visibleSections.features ? 'translateY(0)' : 'translateY(50px)',
                    opacity: visibleSections.features ? 1 : 0,
                    transitionDelay: '400ms',
                    transitionDuration: '700ms'
                  }}>
              <div className="bg-hamaspeak-purple/10 p-4 rounded-full inline-flex mb-4 animate-pulse-slow">
                <Mic className="h-8 w-8 text-hamaspeak-purple" />
              </div>
              <h3 className="text-xl font-bold mb-3">Luyện nói có phản hồi</h3>
              <p>
                Nói tiếng Anh và nhận phản hồi tức thời về độ chính xác của phát âm, 
                giúp bạn cải thiện nhanh chóng.
              </p>
            </Card>
            
            <Card className="glass-card p-6 hover:shadow-xl transition-all transform hover:-translate-y-2 duration-300 border-t-4 border-hamaspeak-teal"
                  style={{ 
                    transform: visibleSections.features ? 'translateY(0)' : 'translateY(50px)',
                    opacity: visibleSections.features ? 1 : 0,
                    transitionDelay: '600ms',
                    transitionDuration: '700ms'
                  }}>
              <div className="bg-hamaspeak-teal/10 p-4 rounded-full inline-flex mb-4 animate-pulse-slow">
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
      <section id="method" className={`py-16 transition-all duration-1000 ${visibleSections.method ? 'opacity-100' : 'opacity-0'}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 transform transition-all duration-700"
              style={{ 
                transform: visibleSections.method ? 'translateY(0)' : 'translateY(50px)',
                opacity: visibleSections.method ? 1 : 0
              }}>
            <h2 className="text-3xl font-bold mb-4">Phương pháp 8 bước</h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-600">
              Tiếp cận tập trung vào kỹ năng nói thông qua 8 bước được thiết kế khoa học
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-4 inset-y-0 w-1 bg-gradient-to-b from-hamaspeak-blue via-hamaspeak-purple to-hamaspeak-teal animate-pulse-glow"></div>
              
              <div className="space-y-8 relative">
                {/* INPUT PHASE */}
                <div className="relative pl-8 pb-6">
                  <div className="absolute left-0 top-0 w-8 h-8 bg-gradient-to-r from-hamaspeak-blue to-hamaspeak-purple rounded-full flex items-center justify-center text-white font-bold z-20">
                    I
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-hamaspeak-blue mb-4">PHẦN INPUT</h3>
                </div>
                
                <div className="flex animate-slide-right" style={{animationDelay: '200ms'}}>
                  <div className="bg-hamaspeak-blue text-white rounded-full h-9 w-9 flex items-center justify-center font-bold relative z-10 mr-6">1</div>
                  <div className="glass-card p-4 flex-1 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gradient-to-r hover:from-white/80 hover:to-white/100">
                    <h3 className="font-bold mb-1">Luyện nghe</h3>
                    <p className="text-gray-600">Nghe và nhìn từng cụm từ tiếng Anh</p>
                  </div>
                </div>
                
                <div className="flex animate-slide-left" style={{animationDelay: '300ms'}}>
                  <div className="bg-hamaspeak-purple text-white rounded-full h-9 w-9 flex items-center justify-center font-bold relative z-10 mr-6">2</div>
                  <div className="glass-card p-4 flex-1 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gradient-to-r hover:from-white/80 hover:to-white/100">
                    <h3 className="font-bold mb-1">Hiểu nghĩa</h3>
                    <p className="text-gray-600">Đọc nghĩa tiếng Việt của từng cụm từ</p>
                  </div>
                </div>
                
                <div className="flex animate-slide-right" style={{animationDelay: '400ms'}}>
                  <div className="bg-hamaspeak-teal text-white rounded-full h-9 w-9 flex items-center justify-center font-bold relative z-10 mr-6">3</div>
                  <div className="glass-card p-4 flex-1 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gradient-to-r hover:from-white/80 hover:to-white/100">
                    <h3 className="font-bold mb-1">Nghe và nhắc lại</h3>
                    <p className="text-gray-600">Lặp lại từng cụm từ tiếng Anh và được chấm điểm</p>
                  </div>
                </div>
                
                <div className="flex animate-slide-left" style={{animationDelay: '500ms'}}>
                  <div className="bg-hamaspeak-blue text-white rounded-full h-9 w-9 flex items-center justify-center font-bold relative z-10 mr-6">4</div>
                  <div className="glass-card p-4 flex-1 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gradient-to-r hover:from-white/80 hover:to-white/100">
                    <h3 className="font-bold mb-1">Nói theo nghĩa</h3>
                    <p className="text-gray-600">Nhìn nghĩa tiếng Việt và nói bằng tiếng Anh</p>
                  </div>
                </div>
                
                {/* OUTPUT PHASE */}
                <div className="relative pl-8 pt-6 pb-6">
                  <div className="absolute left-0 top-6 w-8 h-8 bg-gradient-to-r from-hamaspeak-purple to-hamaspeak-teal rounded-full flex items-center justify-center text-white font-bold z-20">
                    O
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-hamaspeak-purple mb-4">PHẦN OUTPUT</h3>
                </div>
                
                <div className="flex animate-slide-right" style={{animationDelay: '600ms'}}>
                  <div className="bg-hamaspeak-purple text-white rounded-full h-9 w-9 flex items-center justify-center font-bold relative z-10 mr-6">5</div>
                  <div className="glass-card p-4 flex-1 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gradient-to-r hover:from-white/80 hover:to-white/100">
                    <h3 className="font-bold mb-1">Luyện nghe câu dài</h3>
                    <p className="text-gray-600">Nghe và hiểu các câu hoàn chỉnh</p>
                  </div>
                </div>
                
                <div className="flex animate-slide-left" style={{animationDelay: '700ms'}}>
                  <div className="bg-hamaspeak-teal text-white rounded-full h-9 w-9 flex items-center justify-center font-bold relative z-10 mr-6">6</div>
                  <div className="glass-card p-4 flex-1 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gradient-to-r hover:from-white/80 hover:to-white/100">
                    <h3 className="font-bold mb-1">Luyện nói từng câu</h3>
                    <p className="text-gray-600">Nói lại các câu hoàn chỉnh với gợi ý</p>
                  </div>
                </div>
                
                <div className="flex animate-slide-right" style={{animationDelay: '800ms'}}>
                  <div className="bg-hamaspeak-blue text-white rounded-full h-9 w-9 flex items-center justify-center font-bold relative z-10 mr-6">7</div>
                  <div className="glass-card p-4 flex-1 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gradient-to-r hover:from-white/80 hover:to-white/100">
                    <h3 className="font-bold mb-1">Luyện nói cả đoạn</h3>
                    <p className="text-gray-600">Nói lại toàn bộ đoạn văn với gợi ý</p>
                  </div>
                </div>
                
                <div className="flex animate-slide-left" style={{animationDelay: '900ms'}}>
                  <div className="bg-hamaspeak-purple text-white rounded-full h-9 w-9 flex items-center justify-center font-bold relative z-10 mr-6">8</div>
                  <div className="glass-card p-4 flex-1 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:bg-gradient-to-r hover:from-white/80 hover:to-white/100">
                    <h3 className="font-bold mb-1">Nói hoàn chỉnh</h3>
                    <p className="text-gray-600">Nói toàn bộ đoạn văn chỉ với nghĩa tiếng Việt</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Link to="/method">
                <Button variant="outline" className="px-6 hover:bg-gradient-to-r from-hamaspeak-blue/10 to-hamaspeak-purple/10 transition-all duration-300 group">
                  <span>Tìm hiểu thêm về phương pháp</span>
                  <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section id="testimonials" className={`py-16 bg-gradient-to-r from-hamaspeak-blue/5 to-hamaspeak-purple/5 transition-all duration-1000 ${visibleSections.testimonials ? 'opacity-100' : 'opacity-0'}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 transform transition-all duration-700"
              style={{ 
                transform: visibleSections.testimonials ? 'translateY(0)' : 'translateY(50px)',
                opacity: visibleSections.testimonials ? 1 : 0
              }}>
            <h2 className="text-3xl font-bold mb-4">Người học nói gì về Hamaspeak</h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-600">
              Hàng ngàn người đã cải thiện kỹ năng nói tiếng Anh của họ với Hamaspeak
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card p-6 transform hover:rotate-1 hover:scale-105 transition-all duration-300"
                  style={{ 
                    transform: visibleSections.testimonials ? 'translateY(0) rotate(0)' : 'translateY(50px) rotate(-2deg)',
                    opacity: visibleSections.testimonials ? 1 : 0,
                    transitionDelay: '200ms',
                    transitionDuration: '700ms'
                  }}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-hamaspeak-blue/20 rounded-full flex items-center justify-center mr-4 animate-pulse-slow">
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
              <p className="italic relative">
                <span className="absolute -top-4 -left-2 text-4xl text-hamaspeak-blue/20">"</span>
                Sau 3 tháng học với Hamaspeak, tôi đã tự tin giao tiếp tiếng Anh trong công việc. 
                Phương pháp 8 bước thực sự hiệu quả!
                <span className="absolute -bottom-4 -right-2 text-4xl text-hamaspeak-blue/20">"</span>
              </p>
            </Card>
            
            <Card className="glass-card p-6 transform hover:rotate-1 hover:scale-105 transition-all duration-300"
                  style={{ 
                    transform: visibleSections.testimonials ? 'translateY(0) rotate(0)' : 'translateY(50px) rotate(2deg)',
                    opacity: visibleSections.testimonials ? 1 : 0,
                    transitionDelay: '400ms',
                    transitionDuration: '700ms'
                  }}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-hamaspeak-purple/20 rounded-full flex items-center justify-center mr-4 animate-pulse-slow">
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
              <p className="italic relative">
                <span className="absolute -top-4 -left-2 text-4xl text-hamaspeak-purple/20">"</span>
                Phần mềm chấm điểm phát âm giúp tôi nhận ra những lỗi sai của mình. 
                Giờ đây phát âm của tôi đã cải thiện rất nhiều!
                <span className="absolute -bottom-4 -right-2 text-4xl text-hamaspeak-purple/20">"</span>
              </p>
            </Card>
            
            <Card className="glass-card p-6 transform hover:rotate-1 hover:scale-105 transition-all duration-300"
                  style={{ 
                    transform: visibleSections.testimonials ? 'translateY(0) rotate(0)' : 'translateY(50px) rotate(-2deg)',
                    opacity: visibleSections.testimonials ? 1 : 0,
                    transitionDelay: '600ms',
                    transitionDuration: '700ms'
                  }}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-hamaspeak-teal/20 rounded-full flex items-center justify-center mr-4 animate-pulse-slow">
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
              <p className="italic relative">
                <span className="absolute -top-4 -left-2 text-4xl text-hamaspeak-teal/20">"</span>
                Cách học theo cụm từ nhỏ rất hiệu quả. Tôi không còn cảm thấy quá tải khi học 
                những đoạn văn dài nữa.
                <span className="absolute -bottom-4 -right-2 text-4xl text-hamaspeak-teal/20">"</span>
              </p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section id="cta" className={`py-16 transition-all duration-1000 ${visibleSections.cta ? 'opacity-100' : 'opacity-0'}`}>
        <div className="container mx-auto px-4">
          <div 
            className="max-w-3xl mx-auto glass-card p-10 text-center bg-gradient-to-r from-hamaspeak-blue/10 via-hamaspeak-purple/10 to-hamaspeak-teal/10 relative overflow-hidden transform transition-all duration-700"
            style={{ 
              transform: visibleSections.cta ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.95)',
              opacity: visibleSections.cta ? 1 : 0
            }}
          >
            {/* Animated background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -right-10 top-10 w-40 h-40 bg-hamaspeak-blue/10 rounded-full filter blur-xl animate-float" style={{animationDelay: '0s'}}></div>
              <div className="absolute -left-10 top-20 w-32 h-32 bg-hamaspeak-purple/10 rounded-full filter blur-xl animate-float" style={{animationDelay: '1s'}}></div>
              <div className="absolute right-20 -bottom-10 w-36 h-36 bg-hamaspeak-teal/10 rounded-full filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
            </div>
            
            <h2 className="text-3xl font-bold mb-4 relative z-10">Sẵn sàng nói tiếng Anh tự tin?</h2>
            <p className="text-lg mb-8 relative z-10">
              Bắt đầu hành trình học tiếng Anh với phương pháp 8 bước Hamaspeak ngay hôm nay!
            </p>
            <Link to="/study" className="relative z-10 inline-block group">
              <Button className="glass-button px-8 py-6 text-lg relative overflow-hidden group">
                <span className="relative z-10 flex items-center">
                  Học ngay
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
                </span>
                <span className="absolute inset-0 bg-white/20 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500"></span>
              </Button>
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-hamaspeak-blue via-hamaspeak-purple to-hamaspeak-teal transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

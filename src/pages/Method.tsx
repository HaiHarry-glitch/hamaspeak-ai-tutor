import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Headphones, Mic, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import InteractiveDiagram from '@/components/method/InteractiveDiagram';
import Scene3D from '@/components/3d/Scene3D';

const Method = () => {
  const [visibleSections, setVisibleSections] = useState({
    hero: false,
    diagram: false,
    steps: false,
    benefits: false
  });
  
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      const checkVisibility = () => {
        const newVisibility = {...visibleSections};
        
        sections.forEach((section) => {
          const sectionId = section.id;
          const sectionTop = section.getBoundingClientRect().top;
          const isVisible = sectionTop < window.innerHeight - 100;
          
          if (isVisible) {
            newVisibility[sectionId as keyof typeof visibleSections] = true;
          }
        });
        
        setVisibleSections(newVisibility);
      };
      
      checkVisibility();
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleSections]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        <Scene3D className="h-full" brain={false} particles={true} height="100%" />
      </div>
      
      <div className="relative z-10">
        <Header />
        
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-4xl mx-auto">
            <section id="hero" className={`transition-all duration-1000 ${visibleSections.hero ? 'opacity-100' : 'opacity-0'}`}>
              <h1 className="text-4xl font-bold mb-2 text-center text-gradient">
                Phương pháp học nói tiếng Anh Hamaspeak
              </h1>
              <p className="text-center text-lg mb-10 text-gray-600">
                Học tiếng Anh hiệu quả với phương pháp 8 bước độc đáo của Hải Harry
              </p>
              
              <div className="glass-card p-8 mb-12 relative">
                <div className="absolute -z-10 right-0 bottom-0 opacity-20">
                  <Scene3D className="h-64 w-64" />
                </div>
                
                <h2 className="text-2xl font-bold mb-6 text-hamaspeak-purple">Tổng quan về phương pháp</h2>
                <p className="mb-4 relative z-10">
                  Hamaspeak là phương pháp học nói tiếng Anh hiệu quả được phát triển bởi Hải Harry, 
                  dựa trên nguyên lý khoa học về ngôn ngữ và phát triển kỹ năng nói. Phương pháp này 
                  chia quá trình học thành 8 bước cụ thể, giúp người học tiến bộ từng bước vững chắc, 
                  từ việc nghe và hiểu đến tự tin nói tiếng Anh.
                </p>
                <p className="relative z-10">
                  Mỗi bài học được chia thành các cụm từ ngắn, giúp người học dễ dàng tiếp thu và 
                  luyện tập. Người học sẽ được hướng dẫn qua 4 bước đầu vào và 4 bước đầu ra, 
                  đảm bảo sự phát triển toàn diện về kỹ năng nghe và nói tiếng Anh.
                </p>
              </div>
            </section>
            
            <section id="diagram" className={`mb-16 transition-all duration-1000 ${visibleSections.diagram ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
              <h2 className="text-3xl font-bold mb-6 text-center">Sơ đồ phương pháp</h2>
              <p className="text-center text-lg mb-6 text-gray-600">
                Sơ đồ minh hoạ cách thức hoạt động của phương pháp Hamaspeak
              </p>
              
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <InteractiveDiagram />
              </div>
            </section>
            
            <section id="steps" className={`transition-all duration-1000 ${visibleSections.steps ? 'opacity-100' : 'opacity-0'}`}>
              <h2 className="text-3xl font-bold mb-8 text-center">Phương pháp 8 bước</h2>
              <p className="text-center text-lg mb-12 text-gray-600">
                Tiếp cận tập trung vào kỹ năng nói thông qua 8 bước được thiết kế khoa học
              </p>
              
              <div className="relative">
                {/* Timeline line with gradient */}
                <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-hamaspeak-blue via-hamaspeak-purple to-hamaspeak-teal animate-pulse-glow"></div>
                
                {/* PHẦN INPUT */}
                <div className="relative mb-10">
                  <div className="flex justify-center items-center mb-6">
                    <div className="bg-white border-2 border-hamaspeak-purple rounded-full px-6 py-2 z-10 shadow-md">
                      <h3 className="text-xl font-bold text-hamaspeak-purple">PHẦN INPUT</h3>
                    </div>
                  </div>
                  
                  {/* Bước 1 */}
                  <div className="relative z-10 flex items-center mb-12">
                    <div className="hidden md:block w-5/12"></div>
                    <div className="flex justify-center items-center">
                      <div className="bg-hamaspeak-blue text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold shadow-lg z-20">1</div>
                    </div>
                    <div className="md:w-5/12 glass-card ml-4 md:ml-8 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-start mb-4">
                        <div className="bg-hamaspeak-blue/10 p-3 rounded-full mr-4">
                          <Headphones className="h-6 w-6 text-hamaspeak-blue" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-hamaspeak-blue">Luyện nghe</h3>
                          <p className="text-gray-600">Nghe và nhìn từng cụm từ tiếng Anh</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bước 2 */}
                  <div className="relative z-10 flex items-center mb-12">
                    <div className="md:w-5/12 glass-card mr-4 md:mr-8 p-6 shadow-lg md:text-right ml-auto hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-start mb-4 md:flex-row-reverse">
                        <div className="bg-hamaspeak-purple/10 p-3 rounded-full md:ml-4 mr-4 md:mr-0">
                          <FileText className="h-6 w-6 text-hamaspeak-purple" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-hamaspeak-purple">Hiểu nghĩa</h3>
                          <p className="text-gray-600">Đọc nghĩa tiếng Việt của từng cụm từ</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center items-center">
                      <div className="bg-hamaspeak-purple text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold shadow-lg z-20">2</div>
                    </div>
                    <div className="hidden md:block w-5/12"></div>
                  </div>
                  
                  {/* Bước 3 */}
                  <div className="relative z-10 flex items-center mb-12">
                    <div className="hidden md:block w-5/12"></div>
                    <div className="flex justify-center items-center">
                      <div className="bg-hamaspeak-teal text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold shadow-lg z-20">3</div>
                    </div>
                    <div className="md:w-5/12 glass-card ml-4 md:ml-8 p-6 shadow-lg">
                      <div className="flex items-start mb-4">
                        <div className="bg-hamaspeak-teal/10 p-3 rounded-full mr-4">
                          <Mic className="h-6 w-6 text-hamaspeak-teal" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-hamaspeak-teal">Nghe và nhắc lại</h3>
                          <p className="text-gray-600">Lặp lại từng cụm từ tiếng Anh và được chấm điểm</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bước 4 */}
                  <div className="relative z-10 flex items-center mb-12">
                    <div className="md:w-5/12 glass-card mr-4 md:mr-8 p-6 shadow-lg md:text-right ml-auto">
                      <div className="flex items-start mb-4 md:flex-row-reverse">
                        <div className="bg-hamaspeak-blue/10 p-3 rounded-full md:ml-4 mr-4 md:mr-0">
                          <CheckCircle className="h-6 w-6 text-hamaspeak-blue" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-hamaspeak-blue">Nói theo nghĩa</h3>
                          <p className="text-gray-600">Nhìn nghĩa tiếng Việt và nói lại bằng tiếng Anh</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center items-center">
                      <div className="bg-hamaspeak-blue text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold shadow-lg z-20">4</div>
                    </div>
                    <div className="hidden md:block w-5/12"></div>
                  </div>
                </div>
                
                {/* Transition arrow */}
                <div className="flex justify-center mb-10">
                  <div className="bg-white rounded-full p-4 shadow-lg z-20">
                    <ArrowRight className="h-8 w-8 text-hamaspeak-purple animate-pulse" />
                  </div>
                </div>
                
                {/* PHẦN OUTPUT */}
                <div className="relative">
                  <div className="flex justify-center items-center mb-6">
                    <div className="bg-white border-2 border-hamaspeak-teal rounded-full px-6 py-2 z-10 shadow-md">
                      <h3 className="text-xl font-bold text-hamaspeak-teal">PHẦN OUTPUT</h3>
                    </div>
                  </div>
                  
                  {/* Bước 5 */}
                  <div className="relative z-10 flex items-center mb-12">
                    <div className="hidden md:block w-5/12"></div>
                    <div className="flex justify-center items-center">
                      <div className="bg-hamaspeak-purple text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold shadow-lg z-20">5</div>
                    </div>
                    <div className="md:w-5/12 glass-card ml-4 md:ml-8 p-6 shadow-lg">
                      <div className="flex items-start mb-4">
                        <div className="bg-hamaspeak-purple/10 p-3 rounded-full mr-4">
                          <Headphones className="h-6 w-6 text-hamaspeak-purple" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-hamaspeak-purple">Luyện nghe câu dài</h3>
                          <p className="text-gray-600">Nghe hiểu các câu hoàn chỉnh trong tiếng Anh</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bước 6 */}
                  <div className="relative z-10 flex items-center mb-12">
                    <div className="md:w-5/12 glass-card mr-4 md:mr-8 p-6 shadow-lg md:text-right ml-auto">
                      <div className="flex items-start mb-4 md:flex-row-reverse">
                        <div className="bg-hamaspeak-teal/10 p-3 rounded-full md:ml-4 mr-4 md:mr-0">
                          <Mic className="h-6 w-6 text-hamaspeak-teal" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-hamaspeak-teal">Luyện nói từng câu</h3>
                          <p className="text-gray-600">Nói lại từng câu tiếng Anh hoàn chỉnh</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center items-center">
                      <div className="bg-hamaspeak-teal text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold shadow-lg z-20">6</div>
                    </div>
                    <div className="hidden md:block w-5/12"></div>
                  </div>
                  
                  {/* Bước 7 */}
                  <div className="relative z-10 flex items-center mb-12">
                    <div className="hidden md:block w-5/12"></div>
                    <div className="flex justify-center items-center">
                      <div className="bg-hamaspeak-blue text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold shadow-lg z-20">7</div>
                    </div>
                    <div className="md:w-5/12 glass-card ml-4 md:ml-8 p-6 shadow-lg">
                      <div className="flex items-start mb-4">
                        <div className="bg-hamaspeak-blue/10 p-3 rounded-full mr-4">
                          <FileText className="h-6 w-6 text-hamaspeak-blue" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-hamaspeak-blue">Luyện nói cả đoạn</h3>
                          <p className="text-gray-600">Nói lại toàn bộ đoạn văn tiếng Anh</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bước 8 */}
                  <div className="relative z-10 flex items-center">
                    <div className="md:w-5/12 glass-card mr-4 md:mr-8 p-6 shadow-lg md:text-right ml-auto">
                      <div className="flex items-start mb-4 md:flex-row-reverse">
                        <div className="bg-hamaspeak-purple/10 p-3 rounded-full md:ml-4 mr-4 md:mr-0">
                          <CheckCircle className="h-6 w-6 text-hamaspeak-purple" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-hamaspeak-purple">Nói hoàn chỉnh</h3>
                          <p className="text-gray-600">Từ nghĩa tiếng Việt, nói hoàn chỉnh đoạn văn tiếng Anh</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center items-center">
                      <div className="bg-hamaspeak-purple text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold shadow-lg z-20">8</div>
                    </div>
                    <div className="hidden md:block w-5/12"></div>
                  </div>
                </div>
              </div>
            </section>
            
            <section id="benefits" className={`transition-all duration-1000 ${visibleSections.benefits ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
              <div className="glass-card p-8 mt-16 relative">
                <div className="absolute -z-10 left-0 top-0 opacity-20">
                  <Scene3D className="h-48 w-48" />
                </div>
                
                <h2 className="text-2xl font-bold mb-6 text-hamaspeak-purple">Lợi ích của phương pháp Hamaspeak</h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-hamaspeak-teal mr-2 mt-0.5" />
                    <span>Phát triển đồng thời cả kỹ năng nghe và nói</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-hamaspeak-teal mr-2 mt-0.5" />
                    <span>Học theo cụm từ thực tế, dễ nhớ và áp dụng</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-hamaspeak-teal mr-2 mt-0.5" />
                    <span>Phản hồi tức thời về chất lượng phát âm giúp cải thiện nhanh chóng</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-hamaspeak-teal mr-2 mt-0.5" />
                    <span>Tăng dần độ khó, giúp người học xây dựng sự tự tin</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-hamaspeak-teal mr-2 mt-0.5" />
                    <span>Phương pháp học tương tác, hấp dẫn và hiệu quả</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Method;

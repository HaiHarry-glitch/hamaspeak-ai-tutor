
import React from 'react';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import { Headphones, Mic, FileText, CheckCircle, ArrowRight } from 'lucide-react';

const Method = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-center text-gradient">
            Phương pháp học nói tiếng Anh Hamaspeak
          </h1>
          <p className="text-center text-lg mb-10 text-gray-600">
            Học tiếng Anh hiệu quả với phương pháp 8 bước độc đáo của Hải Harry
          </p>
          
          <div className="glass-card p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6 text-hamaspeak-purple">Tổng quan về phương pháp</h2>
            <p className="mb-4">
              Hamaspeak là phương pháp học nói tiếng Anh hiệu quả được phát triển bởi Hải Harry, 
              dựa trên nguyên lý khoa học về ngôn ngữ và phát triển kỹ năng nói. Phương pháp này 
              chia quá trình học thành 8 bước cụ thể, giúp người học tiến bộ từng bước vững chắc, 
              từ việc nghe và hiểu đến tự tin nói tiếng Anh.
            </p>
            <p>
              Mỗi bài học được chia thành các cụm từ ngắn, giúp người học dễ dàng tiếp thu và 
              luyện tập. Người học sẽ được hướng dẫn qua 4 bước đầu vào và 4 bước đầu ra, 
              đảm bảo sự phát triển toàn diện về kỹ năng nghe và nói tiếng Anh.
            </p>
          </div>
          
          <h2 className="text-2xl font-bold mb-6 text-center">8 bước học hiệu quả</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <Card className="glass-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start mb-4">
                <div className="bg-hamaspeak-blue/10 p-3 rounded-full mr-4">
                  <Headphones className="h-6 w-6 text-hamaspeak-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-hamaspeak-blue">Bước 1: Luyện nghe</h3>
                  <p className="text-gray-600">(Input)</p>
                </div>
              </div>
              <p>
                Người học được nhìn từng cụm từ tiếng Anh và nghe cách phát âm chuẩn. 
                Bước này giúp quen với âm điệu và ngữ điệu tiếng Anh.
              </p>
            </Card>
            
            <Card className="glass-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start mb-4">
                <div className="bg-hamaspeak-purple/10 p-3 rounded-full mr-4">
                  <FileText className="h-6 w-6 text-hamaspeak-purple" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-hamaspeak-purple">Bước 2: Hiểu nghĩa</h3>
                  <p className="text-gray-600">(Input)</p>
                </div>
              </div>
              <p>
                Người học được cung cấp nghĩa tiếng Việt của từng cụm từ, giúp 
                hiểu chính xác ý nghĩa và ngữ cảnh sử dụng.
              </p>
            </Card>
            
            <Card className="glass-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start mb-4">
                <div className="bg-hamaspeak-teal/10 p-3 rounded-full mr-4">
                  <Mic className="h-6 w-6 text-hamaspeak-teal" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-hamaspeak-teal">Bước 3: Nghe và nhắc lại</h3>
                  <p className="text-gray-600">(Input)</p>
                </div>
              </div>
              <p>
                Người học lắng nghe và nhắc lại từng cụm từ, được chấm điểm phát âm 
                giúp cải thiện độ chuẩn xác trong phát âm.
              </p>
            </Card>
            
            <Card className="glass-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start mb-4">
                <div className="bg-hamaspeak-blue/10 p-3 rounded-full mr-4">
                  <CheckCircle className="h-6 w-6 text-hamaspeak-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-hamaspeak-blue">Bước 4: Nói theo nghĩa</h3>
                  <p className="text-gray-600">(Input)</p>
                </div>
              </div>
              <p>
                Người học nhìn nghĩa tiếng Việt và nói lại bằng tiếng Anh, 
                giúp phát triển khả năng chuyển đổi giữa hai ngôn ngữ.
              </p>
            </Card>
            
            <div className="md:col-span-2 flex justify-center items-center py-4">
              <ArrowRight className="h-8 w-8 text-hamaspeak-purple animate-pulse" />
            </div>
            
            <Card className="glass-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start mb-4">
                <div className="bg-hamaspeak-purple/10 p-3 rounded-full mr-4">
                  <Headphones className="h-6 w-6 text-hamaspeak-purple" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-hamaspeak-purple">Bước 5: Luyện nghe câu dài</h3>
                  <p className="text-gray-600">(Output)</p>
                </div>
              </div>
              <p>
                Người học được nghe và hiểu các câu dài hơn trong tiếng Anh, 
                chuẩn bị cho việc nói các câu hoàn chỉnh.
              </p>
            </Card>
            
            <Card className="glass-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start mb-4">
                <div className="bg-hamaspeak-teal/10 p-3 rounded-full mr-4">
                  <Mic className="h-6 w-6 text-hamaspeak-teal" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-hamaspeak-teal">Bước 6: Luyện nói từng câu</h3>
                  <p className="text-gray-600">(Output)</p>
                </div>
              </div>
              <p>
                Người học thấy câu tiếng Anh dạng đục lỗ, nghe và nói lại từng câu 
                với sự đánh giá về độ chính xác phát âm.
              </p>
            </Card>
            
            <Card className="glass-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start mb-4">
                <div className="bg-hamaspeak-blue/10 p-3 rounded-full mr-4">
                  <FileText className="h-6 w-6 text-hamaspeak-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-hamaspeak-blue">Bước 7: Luyện nói cả đoạn</h3>
                  <p className="text-gray-600">(Output)</p>
                </div>
              </div>
              <p>
                Người học thấy đoạn văn tiếng Anh dạng đục lỗ, nghe và nói lại 
                toàn bộ đoạn văn để luyện tập khả năng diễn đạt dài.
              </p>
            </Card>
            
            <Card className="glass-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start mb-4">
                <div className="bg-hamaspeak-purple/10 p-3 rounded-full mr-4">
                  <CheckCircle className="h-6 w-6 text-hamaspeak-purple" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-hamaspeak-purple">Bước 8: Nói hoàn chỉnh</h3>
                  <p className="text-gray-600">(Output)</p>
                </div>
              </div>
              <p>
                Người học thấy nghĩa tiếng Việt của cả đoạn văn, nghe tiếng Anh và 
                nói lại toàn bộ đoạn văn, hoàn thiện kỹ năng nói.
              </p>
            </Card>
          </div>
          
          <div className="glass-card p-8">
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
        </div>
      </div>
    </div>
  );
};

export default Method;

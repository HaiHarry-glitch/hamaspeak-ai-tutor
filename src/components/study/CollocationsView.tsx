import React from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, LightbulbIcon } from 'lucide-react';

const CollocationsView = () => {
  const { analysisResult, setCurrentStep } = useStudy();
  
  if (!analysisResult || !analysisResult.collocations) {
    return (
      <div className="text-center p-6">
        <p>Không có dữ liệu về collocations.</p>
      </div>
    );
  }
  
  const { collocations } = analysisResult;
  
  const handleContinue = () => {
    setCurrentStep(1); // Move to Step 1 (Listening)
  };

  return (
    <Card className="glass-card p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">Collocations (Cụm từ cố định)</h2>
        <p className="text-gray-600">
          Đây là các cụm từ thường đi cùng nhau trong đoạn văn của bạn. 
          Học và ghi nhớ các cụm từ này sẽ giúp bạn nói tiếng Anh tự nhiên hơn.
        </p>
      </div>
      
      {collocations.length > 0 ? (
        <>
          <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {collocations.map((collocation, index) => (
                <div 
                  key={index} 
                  className="p-3 rounded-lg bg-hamaspeak-purple/5 hover:bg-hamaspeak-purple/10 transition-colors border border-hamaspeak-purple/20"
                >
                  <div className="flex items-start">
                    <span className="inline-block p-1 bg-hamaspeak-purple/10 text-hamaspeak-purple rounded-full mr-2">
                      <LightbulbIcon className="h-4 w-4" />
                    </span>
                    <span>{collocation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-hamaspeak-blue/5 p-4 rounded-lg mb-6 border border-hamaspeak-blue/20">
            <h3 className="text-lg font-medium text-hamaspeak-blue mb-2">Tiếp theo: Luyện nghe Collocations</h3>
            <p className="text-sm text-gray-600">
              Ở bước tiếp theo, bạn sẽ luyện nghe từng collocation với ngữ cảnh phù hợp. 
              Điều này giúp bạn quen với cách phát âm và sử dụng các cụm từ cố định này một cách tự nhiên.
            </p>
          </div>
        </>
      ) : (
        <div className="text-center p-6 bg-gray-50 rounded-lg mb-6">
          <p>Không tìm thấy collocations trong đoạn văn của bạn.</p>
        </div>
      )}
      
      <div className="flex justify-center">
        <Button
          onClick={handleContinue}
          className="glass-button relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
          Bắt đầu luyện nghe Collocations
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default CollocationsView; 
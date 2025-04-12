import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, FileText, Volume, Mic, Sparkles } from 'lucide-react';

interface AnalyzingProgressProps {
  isAnalyzing: boolean;
}

const AnalyzingProgress: React.FC<AnalyzingProgressProps> = ({ isAnalyzing }) => {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Danh sách các giai đoạn phân tích
  const stages = [
    { name: 'Đang phân tích văn bản', icon: FileText, color: 'text-hamaspeak-blue' },
    { name: 'Tách thành cụm từ có ý nghĩa', icon: Sparkles, color: 'text-hamaspeak-purple' },
    { name: 'Dịch và tạo các phiên bản tập luyện', icon: Volume, color: 'text-hamaspeak-teal' },
    { name: 'Chuẩn bị bài tập phát âm', icon: Mic, color: 'text-hamaspeak-blue' },
  ];

  // Simulate analysis progress
  useEffect(() => {
    if (!isAnalyzing) {
      setStage(0);
      setProgress(0);
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next stage when progress reaches 100%
          setStage(currentStage => {
            if (currentStage < stages.length - 1) {
              return currentStage + 1;
            }
            return currentStage;
          });
          return 0;
        }
        return prev + 2; // Increment progress by 2%
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [isAnalyzing, stages.length]);

  if (!isAnalyzing) return null;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Main animation */}
      <div className="relative w-48 h-48 mb-8">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-radial from-hamaspeak-purple/20 to-transparent rounded-full animate-pulse-glow z-0"></div>
        
        {/* Rotating circle */}
        <motion.div 
          className="absolute inset-0 border-4 border-hamaspeak-purple/30 rounded-full z-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Second rotating circle */}
        <motion.div 
          className="absolute inset-4 border-4 border-hamaspeak-blue/30 rounded-full z-10"
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Icon at center */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-white/90 p-6 rounded-full shadow-lg"
          >
            {React.createElement(stages[stage].icon, { 
              className: `h-12 w-12 ${stages[stage].color}`,
              strokeWidth: 1.5 
            })}
          </motion.div>
        </div>
        
        {/* Particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-3 h-3 rounded-full bg-gradient-to-r from-hamaspeak-blue to-hamaspeak-purple`}
            style={{ 
              top: '50%', 
              left: '50%',
              opacity: 0.7
            }}
            animate={{
              x: [0, Math.cos(i * 60 * Math.PI/180) * 100],
              y: [0, Math.sin(i * 60 * Math.PI/180) * 100],
              opacity: [1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
      
      {/* Analytics text */}
      <motion.h2 
        className="text-2xl font-bold text-center mb-6 text-gradient"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Đang phân tích văn bản của bạn
      </motion.h2>
      
      {/* Current stage */}
      <div className="mb-8 text-center">
        <p className="text-lg font-medium mb-2">{stages[stage].name}</p>
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-hamaspeak-blue via-hamaspeak-purple to-hamaspeak-teal"
            style={{ width: `${progress}%` }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
      
      {/* Stages list */}
      <div className="space-y-3 w-full max-w-md">
        {stages.map((s, i) => (
          <div 
            key={i} 
            className={`flex items-center p-3 rounded-lg transition-all duration-300 ${
              i === stage ? 'bg-gradient-to-r from-hamaspeak-blue/10 to-hamaspeak-purple/10 shadow-sm' : 
              i < stage ? 'opacity-70' : 'opacity-50'
            }`}
          >
            <div className={`mr-4 ${i <= stage ? s.color : 'text-gray-400'}`}>
              {i < stage ? (
                <CheckCircle className="h-6 w-6" />
              ) : i === stage ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                React.createElement(s.icon, { className: "h-6 w-6", strokeWidth: 1.5 })
              )}
            </div>
            <div>
              <p className={`font-medium ${i <= stage ? 'text-gray-700' : 'text-gray-500'}`}>
                {s.name}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Tip */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Quá trình phân tích có thể mất một chút thời gian để đảm bảo chính xác.</p>
        <p>Sau khi phân tích hoàn tất, bạn sẽ được chuyển sang bước học đầu tiên.</p>
      </div>
    </div>
  );
};

export default AnalyzingProgress; 
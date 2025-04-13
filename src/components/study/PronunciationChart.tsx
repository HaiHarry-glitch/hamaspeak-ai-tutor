
import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface PronunciationData {
  overallScore: number;
  fluencyScore: number;
  accuracyScore: number;
  intonationScore: number;
  stressScore: number;
  rhythmScore: number;
  recordedAt: string; // ISO date string
}

interface PronunciationChartProps {
  history: PronunciationData[];
  currentScores: Omit<PronunciationData, 'recordedAt'>;
}

const PronunciationChart: React.FC<PronunciationChartProps> = ({ 
  history, 
  currentScores 
}) => {
  // Format the data for the radar chart
  const radarData = [
    { 
      category: 'Độ chính xác', 
      score: currentScores.accuracyScore, 
      fullMark: 100 
    },
    { 
      category: 'Ngữ điệu', 
      score: currentScores.intonationScore, 
      fullMark: 100 
    },
    { 
      category: 'Trọng âm', 
      score: currentScores.stressScore, 
      fullMark: 100 
    },
    { 
      category: 'Nhịp điệu', 
      score: currentScores.rhythmScore, 
      fullMark: 100 
    },
    { 
      category: 'Độ trôi chảy', 
      score: currentScores.fluencyScore, 
      fullMark: 100 
    },
  ];
  
  // Format history data for the line chart
  // Convert date to readable format (e.g. "01/05")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };
  
  const chartHistory = history.map(entry => ({
    ...entry,
    date: formatDate(entry.recordedAt)
  }));
  
  return (
    <Card className="p-4">
      <h3 className="font-bold mb-4 text-center">Biểu đồ phát âm của bạn</h3>
      
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2">Chi tiết điểm hôm nay:</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#4b5563', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar
                name="Điểm phát âm"
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.5}
              />
              <Tooltip formatter={(value) => [`${value}%`, 'Điểm']} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {history.length > 1 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Quá trình tiến bộ:</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartHistory}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip 
                  formatter={(value) => [`${value}%`]} 
                  labelFormatter={(label) => `Ngày: ${label}`} 
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="overallScore" 
                  name="Tổng thể" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.2} 
                />
                <Area 
                  type="monotone" 
                  dataKey="accuracyScore" 
                  name="Độ chính xác" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.1} 
                />
                <Area 
                  type="monotone" 
                  dataKey="fluencyScore" 
                  name="Độ trôi chảy" 
                  stroke="#f59e0b" 
                  fill="#f59e0b" 
                  fillOpacity={0.1} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 text-xs text-center text-gray-500">
            Biểu đồ thể hiện sự tiến bộ của bạn qua thời gian. Tiếp tục luyện tập để cải thiện điểm số!
          </div>
        </div>
      )}
    </Card>
  );
};

export default PronunciationChart;

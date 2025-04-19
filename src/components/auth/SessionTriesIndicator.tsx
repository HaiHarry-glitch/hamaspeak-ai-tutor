
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

const SessionTriesIndicator: React.FC = () => {
  const { isAuthenticated, sessionTriesRemaining } = useAuth();
  const { setIsAuthModalOpen } = useStudy();
  
  if (isAuthenticated) {
    return null; // Don't show anything when logged in
  }
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium text-blue-900 mb-1">Chế độ dùng thử</h4>
          <p className="text-sm text-blue-700">
            {sessionTriesRemaining > 0 
              ? `Bạn có ${sessionTriesRemaining} lượt dùng thử còn lại`
              : 'Bạn đã hết lượt dùng thử, vui lòng đăng nhập để tiếp tục'}
          </p>
        </div>
        
        <Button 
          onClick={() => setIsAuthModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Đăng nhập
        </Button>
      </div>
      
      <div className="mt-2">
        <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600" 
            style={{ width: `${(sessionTriesRemaining / 3) * 100}%` }} 
          />
        </div>
      </div>
    </div>
  );
};

export default SessionTriesIndicator;


import React from 'react';
import { useStudy, TopicGroup } from '@/contexts/StudyContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, MessageCircle, MessagesSquare, FileText, Lock } from 'lucide-react';

const TopicGroupSelector: React.FC = () => {
  const { selectedTopicGroup, setSelectedTopicGroup, setIsAuthModalOpen } = useStudy();
  const { isAuthenticated } = useAuth();

  const topicGroups: {
    id: TopicGroup;
    title: string;
    description: string;
    icon: React.ReactNode;
    requiresAuth: boolean;
  }[] = [
    {
      id: 'part1',
      title: 'Speaking Part 1',
      description: 'Câu hỏi về các chủ đề quen thuộc, đơn giản',
      icon: <MessageCircle className="h-5 w-5" />,
      requiresAuth: false,
    },
    {
      id: 'part23',
      title: 'Speaking Part 2 & 3',
      description: 'Nói về các chủ đề chi tiết, phức tạp hơn',
      icon: <MessagesSquare className="h-5 w-5" />,
      requiresAuth: true,
    },
    {
      id: 'custom',
      title: 'Tùy chỉnh',
      description: 'Nhập văn bản của riêng bạn để luyện tập',
      icon: <FileText className="h-5 w-5" />,
      requiresAuth: true,
    },
  ];

  const handleSelect = (groupId: TopicGroup) => {
    const group = topicGroups.find(g => g.id === groupId);
    
    if (group?.requiresAuth && !isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    
    setSelectedTopicGroup(groupId);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Chọn loại chủ đề</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topicGroups.map((group) => (
          <Card
            key={group.id}
            className={`p-4 cursor-pointer transition-all ${
              selectedTopicGroup === group.id
                ? 'border-2 border-hamaspeak-blue'
                : 'hover:shadow-md'
            }`}
            onClick={() => handleSelect(group.id)}
          >
            <div className="flex items-start">
              <div className={`p-2 rounded-full ${
                selectedTopicGroup === group.id 
                  ? 'bg-hamaspeak-blue text-white' 
                  : 'bg-gray-100'
              }`}>
                {group.icon}
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{group.title}</h4>
                  {selectedTopicGroup === group.id && (
                    <Check className="h-4 w-4 text-hamaspeak-blue" />
                  )}
                </div>
                
                <p className="text-sm text-gray-500 mt-1">
                  {group.description}
                </p>
                
                {group.requiresAuth && !isAuthenticated && (
                  <div className="mt-2 flex items-center text-xs text-amber-600">
                    <Lock className="h-3 w-3 mr-1" />
                    Yêu cầu đăng nhập
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {!isAuthenticated && (
        <div className="mt-6 bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-blue-800 text-sm mb-3">
            Đăng nhập để mở khóa tất cả chủ đề và tính năng không giới hạn
          </p>
          <Button
            onClick={() => setIsAuthModalOpen(true)}
            variant="default"
            size="sm"
          >
            Đăng nhập
          </Button>
        </div>
      )}
    </div>
  );
};

export default TopicGroupSelector;

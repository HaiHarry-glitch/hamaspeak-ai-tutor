
import React from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { TopicGroup } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckIcon } from 'lucide-react';

const TopicGroupSelector = () => {
  const { selectedTopicGroup, setSelectedTopicGroup } = useStudy();

  const topicGroups = [
    {
      id: TopicGroup.PART1,
      name: 'Speaking Part 1',
      description: 'Câu hỏi phỏng vấn cá nhân',
    },
    {
      id: TopicGroup.PART2_3,
      name: 'Speaking Part 2 & 3',
      description: 'Câu hỏi mô tả và thảo luận',
    },
    {
      id: TopicGroup.CUSTOM,
      name: 'Tùy chọn',
      description: 'Nhập nội dung của riêng bạn',
    },
  ];

  return (
    <Card className="p-4 mb-6">
      <h3 className="text-lg font-medium mb-3">Chọn chủ đề luyện tập:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {topicGroups.map((group) => (
          <Button
            key={group.id}
            variant={selectedTopicGroup === group.id ? "default" : "outline"}
            onClick={() => setSelectedTopicGroup(group.id)}
            className="h-auto py-3 flex flex-col items-center justify-center text-left"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">{group.name}</span>
              {selectedTopicGroup === group.id && (
                <CheckIcon className="h-4 w-4 ml-2" />
              )}
            </div>
            <span className="text-xs mt-1 opacity-70">{group.description}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default TopicGroupSelector;

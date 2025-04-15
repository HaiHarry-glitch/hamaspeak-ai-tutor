
import React from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const VoiceSelector = () => {
  const { 
    selectedVoice, 
    setSelectedVoice, 
    availableVoices,
    isLoadingVoices 
  } = useStudy();

  const handleVoiceChange = (value: string) => {
    setSelectedVoice(value);
  };

  if (isLoadingVoices) {
    return (
      <div className="flex items-center text-sm text-gray-500">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Đang tải giọng đọc...
      </div>
    );
  }

  if (availableVoices.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        Không tìm thấy giọng đọc. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="voice-select" className="text-sm font-medium">
        Chọn giọng đọc:
      </label>
      <Select value={selectedVoice} onValueChange={handleVoiceChange}>
        <SelectTrigger id="voice-select" className="w-[250px]">
          <SelectValue placeholder="Chọn giọng đọc" />
        </SelectTrigger>
        <SelectContent>
          {availableVoices.map(voice => (
            <SelectItem key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default VoiceSelector;

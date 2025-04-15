
import React, { useEffect, useState } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAvailableVoices } from '@/utils/speechUtils';

const VoiceSelector = () => {
  const { selectedVoice, setSelectedVoice } = useStudy();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVoices = async () => {
      setLoading(true);
      try {
        const availableVoices = await getAvailableVoices();
        // Filter for English voices only
        const englishVoices = availableVoices.filter(voice => voice.lang.startsWith('en'));
        setVoices(englishVoices);
        
        // Set default voice if none selected yet
        if (!selectedVoice && englishVoices.length > 0) {
          setSelectedVoice(englishVoices[0].name);
        }
      } catch (error) {
        console.error('Error loading voices:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVoices();
  }, [selectedVoice, setSelectedVoice]);

  const handleVoiceChange = (value: string) => {
    setSelectedVoice(value);
  };

  if (loading || voices.length === 0) {
    return <div className="text-sm text-gray-500">Đang tải giọng đọc...</div>;
  }

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="voice-select" className="text-sm font-medium">
        Chọn giọng đọc:
      </label>
      <Select value={selectedVoice} onValueChange={handleVoiceChange}>
        <SelectTrigger id="voice-select" className="w-[200px]">
          <SelectValue placeholder="Chọn giọng đọc" />
        </SelectTrigger>
        <SelectContent>
          {voices.map(voice => (
            <SelectItem key={voice.name} value={voice.name}>
              {voice.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default VoiceSelector;

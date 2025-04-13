
import React, { useEffect, useState } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAvailableVoices } from '@/utils/speechUtils';
import { Loader2 } from 'lucide-react';

// Default voices to ensure consistent experience across browsers
const defaultVoices = [
  { name: "English (US) - Female", value: "en-US-female" },
  { name: "English (US) - Male", value: "en-US-male" },
  { name: "English (UK) - Female", value: "en-GB-female" },
  { name: "English (UK) - Male", value: "en-GB-male" },
];

const VoiceSelector = () => {
  const { selectedVoice, setSelectedVoice } = useStudy();
  const [voices, setVoices] = useState<{name: string; value: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [nativeSpeechSynthesis, setNativeSpeechSynthesis] = useState(false);

  useEffect(() => {
    const loadVoices = async () => {
      setLoading(true);
      try {
        // Check if speech synthesis is available
        if ('speechSynthesis' in window && window.speechSynthesis.getVoices().length > 0) {
          setNativeSpeechSynthesis(true);
          const availableVoices = await getAvailableVoices();
          // Filter for English voices only
          const englishVoices = availableVoices
            .filter(voice => voice.lang.startsWith('en'))
            .map(voice => ({
              name: voice.name,
              value: voice.name
            }));
            
          if (englishVoices.length > 0) {
            setVoices(englishVoices);
            
            // Set default voice if none selected yet
            if (!selectedVoice && englishVoices.length > 0) {
              setSelectedVoice(englishVoices[0].value);
            }
            return;
          }
        }
        
        // Fallback to our default voices
        setVoices(defaultVoices);
        if (!selectedVoice) {
          setSelectedVoice(defaultVoices[0].value);
        }
      } catch (error) {
        console.error('Error loading voices:', error);
        // Fallback to default voices
        setVoices(defaultVoices);
        if (!selectedVoice) {
          setSelectedVoice(defaultVoices[0].value);
        }
      } finally {
        setLoading(false);
      }
    };

    loadVoices();
  }, [selectedVoice, setSelectedVoice]);

  const handleVoiceChange = (value: string) => {
    setSelectedVoice(value);
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500 flex items-center">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Đang tải giọng đọc...
      </div>
    );
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
            <SelectItem key={voice.value} value={voice.value}>
              {voice.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {!nativeSpeechSynthesis && (
        <p className="text-xs text-amber-600">
          Trình duyệt của bạn không hỗ trợ đầy đủ chức năng đọc, đang sử dụng giọng đọc mặc định.
        </p>
      )}
    </div>
  );
};

export default VoiceSelector;


import { PronunciationResult } from '@/types/pronunciation';

// Create a shared props interface for components that use pronunciation analysis
export interface PronunciationComponentProps {
  onAnalyzePronunciation?: (text: string, audioBlob?: Blob) => Promise<PronunciationResult>;
}

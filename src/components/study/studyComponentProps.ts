
import { PronunciationResult } from '@/types/pronunciation';

// Expand the props interface to explicitly define the pronunciation analysis prop
export interface PronunciationComponentProps {
  onAnalyzePronunciation?: (text: string, audioBlob?: Blob) => Promise<PronunciationResult>;
}

// Create a type guard to help with prop checking
export function hasPronunciationAnalysis(props: any): props is PronunciationComponentProps {
  return typeof props.onAnalyzePronunciation === 'function';
}


import { useEffect, useState } from 'react';

// Create a fallback function for browsers without native SpeechSynthesis
const synthesizeSpeech = (text: string, voice: string, onEnd?: () => void) => {
  // Check if the browser supports SpeechSynthesis
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find the voice by name
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.name === voice);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = 1;
    utterance.pitch = 1;
    
    if (onEnd) {
      utterance.onend = onEnd;
    }
    
    window.speechSynthesis.speak(utterance);
    return true;
  }
  
  // Fallback for browsers without native support
  console.warn("Speech synthesis not supported in this browser. Using fallback.");
  return false;
};

// Get available voices with a promise to ensure they're loaded
export const getAvailableVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if ('speechSynthesis' in window) {
      // If voices are already loaded
      let voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }
      
      // If voices aren't loaded yet, wait for them
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      };
      
      // Force a refresh to trigger onvoiceschanged in some browsers
      window.speechSynthesis.getVoices();
    } else {
      // Return empty array if speech synthesis not supported
      resolve([]);
    }
  });
};

// Handle speech synthesis consistently across browsers
export const speakText = (text: string, voice: string, onEnd?: () => void): void => {
  // First try native speech synthesis
  const success = synthesizeSpeech(text, voice, onEnd);
  
  // If native synthesis fails or isn't available, implement fallback
  if (!success) {
    console.warn("Using fallback speech synthesis");
    // Here you could implement a web API based fallback like Google TTS or Amazon Polly
    // For now, we'll just call the onEnd callback after a delay to simulate speech
    if (onEnd) {
      const wordsPerMinute = 150;
      const wordCount = text.split(' ').length;
      const durationMs = (wordCount / wordsPerMinute) * 60 * 1000;
      
      setTimeout(onEnd, durationMs);
    }
  }
};

export default {
  getAvailableVoices,
  speakText
};

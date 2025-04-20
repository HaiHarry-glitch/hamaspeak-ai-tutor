import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the enum for topic groups
export enum TopicGroup {
  PART1 = 'part1',
  PART2_3 = 'part2_3',
  CUSTOM = 'custom'
}

// Define the types for the analysis result
export interface AnalysisResult {
  originalText: string;
  phrases: Array<{
    english: string;
    vietnamese: string;
    fillInBlanks: string;
  }>;
  collocations?: Array<{
    english: string;
    vietnamese: string;
  }>;
  topics?: string[];
  sentences?: string[]; // Add sentences property
}

// Define the flashcard state type
export interface FlashcardState {
  currentIndex: number;
  isFlipped: boolean;
}

// Define the type for the context
interface StudyContextType {
  currentStep: number;
  isAnalyzing: boolean;
  selectedVoice: string;
  selectedTopicGroup: string;
  isAuthModalOpen: boolean;
  analysisResult: AnalysisResult | null;
  currentText: string;
  flashcardState: FlashcardState;
  setCurrentStep: (step: number) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setSelectedVoice: (voice: string) => void;
  // Fix: Update the type to accept TopicGroup enum
  setSelectedTopicGroup: (group: TopicGroup | string) => void;
  setIsAuthModalOpen: (isOpen: boolean) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setCurrentText: (text: string) => void;
  setFlashcardState: (state: FlashcardState) => void;
  analyzeUserText: (text: string) => Promise<void>;
}

// Create the context with a default value
export const StudyContext = createContext<StudyContextType>({
  currentStep: 0,
  isAnalyzing: false,
  selectedVoice: 'en-US-JennyNeural',
  selectedTopicGroup: 'part1',
  isAuthModalOpen: false,
  analysisResult: null,
  currentText: '',
  flashcardState: { currentIndex: 0, isFlipped: false },
  setCurrentStep: () => {},
  setIsAnalyzing: () => {},
  setSelectedVoice: () => {},
  setSelectedTopicGroup: () => {},
  setIsAuthModalOpen: () => {},
  setAnalysisResult: () => {},
  setCurrentText: () => {},
  setFlashcardState: () => {},
  analyzeUserText: async () => {}
});

// Create the provider component
export const StudyProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('en-US-JennyNeural');
  const [selectedTopicGroup, setSelectedTopicGroup] = useState<TopicGroup>(TopicGroup.PART1);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentText, setCurrentText] = useState<string>('');
  const [flashcardState, setFlashcardState] = useState<FlashcardState>({ 
    currentIndex: 0, 
    isFlipped: false 
  });

  // Fix: Create a wrapper function to handle type conversion
  const handleTopicGroupChange = (group: TopicGroup | string) => {
    // Convert string to enum if needed
    if (typeof group === 'string') {
      // Cast to TopicGroup if it's one of the enum values
      if (Object.values(TopicGroup).includes(group as TopicGroup)) {
        setSelectedTopicGroup(group as TopicGroup);
      }
    } else {
      setSelectedTopicGroup(group);
    }
  };

  // Extract collocations with Gemini API
  const extractCollocationWithGemini = async (text: string): Promise<Array<{english: string, vietnamese: string}>> => {
    try {
      // Define the Gemini API key and endpoint
      const apiKey = 'AIzaSyB1sL3_nAVV_Wtp6IEL1TT1ufS5-jzOCh0'; // Using the provided API key
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      // Create the prompt for collocation analysis
      const prompt = `Act as an expert linguistic analysis tool specializing in English collocations and Vietnamese translation. Your task is to analyze the provided English text (which could be a single sentence or a paragraph), break it down into meaningful collocations or phrasal units, and provide the accurate Vietnamese translation for each unit *based specifically on its meaning within the given context*.**Instructions:**1. **Read and Understand Context:** Carefully analyze the entire input English text to grasp the overall meaning and the context in which each phrase is used.2. **Identify Meaningful Units:** Segment the text into the most significant collocations, phrasal verbs, prepositional phrases, idiomatic expressions, or other multi-word chunks that function as a semantic unit within the sentence/paragraph. Aim for units that carry a distinct meaning together.3. **Determine Contextual Meaning:** For each identified unit, determine its precise meaning *as it is used in this specific text*. Avoid generic dictionary definitions if the context implies a more specific nuance.4. **Translate Contextually:** Provide the most accurate and natural-sounding Vietnamese translation for the specific contextual meaning you identified in the previous step.5. **Format Output:** Present the results clearly as a list. Each item should follow the format:

\`[Identified English Collocation/Phrase]\` : \`[Vietnamese Translation Reflecting Context]\`**Crucial Point:** The Vietnamese translation *must* accurately reflect the meaning of the English phrase *within the specific context provided*, not just a general translation.**Here is the text to analyze:**

${text}`;

      // Call the Gemini API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      
      // Extract the response text
      if (!data || !data.candidates || !data.candidates[0] || !data.candidates[0].content || 
          !data.candidates[0].content.parts || !data.candidates[0].content.parts[0].text) {
        throw new Error('Invalid response from Gemini API');
      }
      
      const responseText = data.candidates[0].content.parts[0].text;
      console.log('Gemini API response:', responseText);
      
      // Improved parsing to extract collocations with their Vietnamese translations
      const lines = responseText.split('\n');
      
      console.log('Total lines to process:', lines.length);
      
      // Filter for valid collocation lines and process them
      const collocationPairs = lines
        .filter(line => {
          // Skip empty lines
          if (!line.trim()) return false;
          
          // Skip known header/footer lines
          const lowerLine = line.toLowerCase().trim();
          if (lowerLine.startsWith("here's") || 
              lowerLine.startsWith("therefore") ||
              lowerLine === "analysis:" ||
              lowerLine.includes("final answer") ||
              lowerLine.includes("formatted output")) {
            return false;
          }
          
          // Basic requirement: line must contain a colon which separates English and Vietnamese
          return line.includes(':');
        })
        .map((line, index) => {
          // Remove bullet points if present
          let cleanLine = line.replace(/^[•\*\-]\s*/, '').trim();
          
          // Extract English and Vietnamese parts
          let english = '';
          let vietnamese = '';
          
          // Try to extract using the ** pattern first
          const asteriskMatch = cleanLine.match(/\*\*(.*?)\*\*\s*:\s*(.*)/);
          if (asteriskMatch && asteriskMatch.length >= 3) {
            english = asteriskMatch[1].trim();
            vietnamese = asteriskMatch[2].trim();
          } else {
            // Fallback to basic colon split
            const parts = cleanLine.split(':').map(part => part.trim());
            if (parts.length >= 2) {
              english = parts[0];
              vietnamese = parts.slice(1).join(':'); // Join back in case the translation itself contains colons
            }
          }
          
          // Clean up the extracted text
          english = english
            .replace(/[\[\]`'""]/g, '') // Remove brackets, quotes, etc.
            .replace(/^\*\*|\*\*$/g, '') // Remove ** if they're still present
            .trim();
          
          vietnamese = vietnamese
            .replace(/[\[\]`'""]/g, '') // Remove brackets, quotes, etc.
            .trim();
          
          console.log(`Line ${index + 1} extracted:`, { english, vietnamese });
          
          return { english, vietnamese };
        })
        .filter(pair => {
          const isValid = pair.english && pair.vietnamese;
          if (!isValid) {
            console.log('Filtered out invalid pair:', pair);
          }
          return isValid;
        }); // Ensure both parts exist
      
      console.log('Final extracted collocations:', collocationPairs.length, collocationPairs);
      
      return collocationPairs;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      // Return an empty array if there's an error
      return [];
    }
  };

  // Add analyzeUserText function
  const analyzeUserText = async (text: string) => {
    try {
      setIsAnalyzing(true);
      
      // Step 1: Call Gemini API to extract collocations with Vietnamese translations
      const collocationData = await extractCollocationWithGemini(text);
      
      // Process the text into phrases and sentences
      const phrases = text.split('. ').map(phrase => ({
        english: phrase,
        vietnamese: `[Vietnamese translation of: ${phrase}]`, // Placeholder, would be replaced with actual translation
        fillInBlanks: phrase.replace(/\b\w+\b/g, (match, index) => 
          index > phrase.length / 3 && Math.random() > 0.7 ? '___' : match
        )
      }));
      
      const sentences = text.split(/[.!?]/g).filter(s => s.trim() !== '');
      
      // Prepare the result
      const analysisResult: AnalysisResult = {
        originalText: text,
        phrases: phrases,
        collocations: collocationData,
        topics: ['education', 'technology', 'environment'],
        sentences: sentences
      };
      
      // Set the analysis result and move to collocation view
      setAnalysisResult(analysisResult);
      setCurrentStep(0.5); // Move to collocation view
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <StudyContext.Provider
      value={{
        currentStep,
        isAnalyzing,
        selectedVoice,
        selectedTopicGroup,
        isAuthModalOpen,
        analysisResult,
        currentText,
        flashcardState,
        setCurrentStep,
        setIsAnalyzing,
        setSelectedVoice,
        setSelectedTopicGroup: handleTopicGroupChange,
        setIsAuthModalOpen,
        setAnalysisResult,
        setCurrentText,
        setFlashcardState,
        analyzeUserText
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

// Create a custom hook to use the context
export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};

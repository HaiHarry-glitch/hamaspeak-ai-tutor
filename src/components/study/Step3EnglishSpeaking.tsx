import React, { useState, useEffect } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, Mic, ArrowRight, Loader2, Repeat, ArrowLeft, MicOff, RefreshCw, Info } from 'lucide-react';
import { speakText, startSpeechRecognition, stopSpeechRecognition, calculatePronunciationScore, getWordErrors, getIpaTranscription } from '@/utils/speechUtils';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

// Score details type definition
type PracticeScoreDetails = {
  overallScore: number;
  exactMatch: boolean;
  similarityScore: number;
  phoneticAccuracy: number;
  bestMatchedWord: string;
  syllableScore: number;
};

const Step3EnglishSpeaking = () => {
  const { analysisResult, setCurrentStep, selectedVoice } = useStudy();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [showVietnamese, setShowVietnamese] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [wordErrors, setWordErrors] = useState<Array<{word: string, ipa: string}>>([]);
  const [practiceWord, setPracticeWord] = useState<{word: string, ipa: string} | null>(null);
  const [isPracticingSpeech, setIsPracticingSpeech] = useState(false);
  const [practiceResult, setPracticeResult] = useState('');
  const [practiceScore, setPracticeScore] = useState<PracticeScoreDetails | null>(null);
  const [showPronunciationDetails, setShowPronunciationDetails] = useState(false);

  const currentPhrase = analysisResult?.phrases[currentPhraseIndex];

  // Effect to auto-speak when loading a new phrase
  useEffect(() => {
    if (currentPhrase && !isSpeaking) {
      handleSpeak();
    }
  }, [currentPhraseIndex]);

  // Reset practice score when exiting practice mode
  useEffect(() => {
    if (!practiceWord) {
      setPracticeScore(null);
      setPracticeResult('');
    }
  }, [practiceWord]);

  const handleSpeak = async () => {
    if (!currentPhrase || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      await speakText(currentPhrase.english, selectedVoice);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleListen = async () => {
    if (!currentPhrase) return;
    
    // If already listening, stop recording
    if (isListening) {
      try {
        stopSpeechRecognition();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      } finally {
        setIsListening(false);
      }
      return;
    }
    
    setIsListening(true);
    setUserTranscript('');
    setScore(null);
    setWordErrors([]);
    setPracticeWord(null);
    
    try {
      const result = await startSpeechRecognition('en-US');
      setUserTranscript(result.transcript);
      
      const pronunciationScore = calculatePronunciationScore(
        currentPhrase.english, 
        result.transcript
      );
      setScore(pronunciationScore);
      
      // Get mispronounced words
      if (pronunciationScore < 90) {
        const errorWords = getWordErrors(currentPhrase.english, result.transcript);
        // Fetch IPA for each error word
        const errorWordsWithIpa = await Promise.all(
          errorWords.map(async (word) => ({
            word,
            ipa: await getIpaTranscription(word)
          }))
        );
        setWordErrors(errorWordsWithIpa);
      }
      
      setAttemptsLeft(prev => prev - 1);
    } catch (error) {
      console.error('Speech recognition error:', error);
      setUserTranscript('Không thể nhận diện giọng nói. Vui lòng thử lại.');
    } finally {
      setIsListening(false);
    }
  };

  // Practice pronouncing a specific word
  const handlePracticeWord = async (wordObj: {word: string, ipa: string}) => {
    setPracticeWord(wordObj);
    setIsSpeaking(true);
    
    try {
      // Speak the word slowly for practice
      await speakText(wordObj.word, selectedVoice, 0.8);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  // Listen to the user practice a specific word
  const handlePracticeWordListen = async () => {
    if (!practiceWord) return;
    
    if (isPracticingSpeech) {
      try {
        stopSpeechRecognition();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      } finally {
        setIsPracticingSpeech(false);
      }
      return;
    }
    
    setIsPracticingSpeech(true);
    setPracticeResult('');
    
    try {
      const result = await startSpeechRecognition('en-US');
      const userWords = result.transcript.toLowerCase().split(/\s+/);
      const practiceWordLower = practiceWord.word.toLowerCase();
      
      // Enhanced scoring for individual word practice
      const scoreDetails = calculateDetailedWordScore(practiceWordLower, userWords);
      
      // Set practice result based on overall score
      if (scoreDetails.overallScore > 85) {
        setPracticeResult('correct');
      } else if (scoreDetails.overallScore > 60) {
        setPracticeResult('partial');
      } else {
        setPracticeResult('incorrect');
      }
      
      // Đảm bảo điểm tổng thể không bị ghi đè sau khi đã tính toán
      const displayScore = {...scoreDetails};
      // Store detailed score
      setPracticeScore(displayScore);
    } catch (error) {
      console.error('Speech recognition error:', error);
      setPracticeResult('error');
    } finally {
      setIsPracticingSpeech(false);
    }
  };

  // Calculate more detailed word scores for individual practice
  const calculateDetailedWordScore = (targetWord: string, userWords: string[]): PracticeScoreDetails => {
    // Direct match score
    const exactMatch = userWords.includes(targetWord);
    
    // Find best match if no exact match
    let bestSimilarity = 0;
    let bestMatchedWord = '';
    
    if (!exactMatch) {
      userWords.forEach(word => {
        const similarity = calculateWordSimilarity(word, targetWord);
        
        // Extra check for final consonant match
        const hasMatchingFinalConsonant = 
          word.length > 0 && targetWord.length > 0 &&
          !isVowel(word[word.length - 1]) && !isVowel(targetWord[targetWord.length - 1]) &&
          word[word.length - 1] === targetWord[targetWord.length - 1];
        
        // Boost similarity for words with matching final consonants
        const finalConsonantBonus = hasMatchingFinalConsonant ? 0.1 : 0;
        const adjustedSimilarity = Math.min(1.0, similarity + finalConsonantBonus);
        
        if (adjustedSimilarity > bestSimilarity) {
          bestSimilarity = adjustedSimilarity;
          bestMatchedWord = word;
        }
      });
    } else {
      // For exact matches, set similarity to 1.0 (100%)
      bestSimilarity = 1.0;
      bestMatchedWord = targetWord;
    }
    
    // Break down target word into phonetic components
    const targetPhonemes = getWordPhonemes(targetWord);
    
    // Phonetic accuracy
    let phoneticAccuracy = 0;
    if (exactMatch) {
      phoneticAccuracy = 100;
    } else if (bestMatchedWord) {
      // Estimated phonetic accuracy based on letter positions and phoneme patterns
      const matchedPhonemes = getWordPhonemes(bestMatchedWord);
      phoneticAccuracy = calculatePhonemeSimilarity(targetPhonemes, matchedPhonemes);
    }
    
    // Cap phoneticAccuracy at 100%
    phoneticAccuracy = Math.min(100, phoneticAccuracy);
    
    // Analyze stress pattern more accurately
    const stressScore = calculateStressScore(targetWord, bestMatchedWord || '');
    
    // Check for final sound match specifically
    const finalSoundScore = calculateFinalSoundScore(targetWord, bestMatchedWord || '');
    
    // Combine scores with proper weighting for pronunciation
    // Higher weight to phonetic accuracy and final sounds for better evaluation
    const overallScore = Math.round(
      (bestSimilarity * 30) + (phoneticAccuracy * 40) + (stressScore * 15) + (finalSoundScore * 15)
    );
    
    // Ensure no score exceeds 100%
    const finalOverallScore = Math.min(100, overallScore);
    const finalSimilarityScore = Math.min(100, Math.round(bestSimilarity * 100));
    const finalPhoneticAccuracy = Math.min(100, Math.round(phoneticAccuracy));
    
    // Don't automatically assign 100 for exact matches in component view
    // We want users to see the individual component scores
    return {
      overallScore: finalOverallScore,
      exactMatch,
      similarityScore: finalSimilarityScore,
      phoneticAccuracy: finalPhoneticAccuracy,
      bestMatchedWord: exactMatch ? targetWord : bestMatchedWord,
      syllableScore: Math.min(100, stressScore)
    };
  };
  
  // Helper function to extract phonemes from a word (simplified)
  const getWordPhonemes = (word: string): string[] => {
    // This is a simplified approach - in a real app you would use a proper phonetic dictionary
    const phonemes: string[] = [];
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    let currentPhoneme = '';
    
    // Simple rule-based phoneme extraction
    for (let i = 0; i < word.length; i++) {
      const char = word[i].toLowerCase();
      currentPhoneme += char;
      
      // Check for common phoneme patterns
      if (i < word.length - 1) {
        const nextChar = word[i+1].toLowerCase();
        
        // Check for digraphs like 'sh', 'th', 'ch', etc.
        if ((char === 's' && nextChar === 'h') || 
            (char === 't' && nextChar === 'h') || 
            (char === 'c' && nextChar === 'h') || 
            (char === 'p' && nextChar === 'h') ||
            (char === 'w' && nextChar === 'h')) {
          currentPhoneme += nextChar;
          i++; // Skip next character
        }
        // Check for vowel combinations
        else if (vowels.includes(char) && vowels.includes(nextChar)) {
          currentPhoneme += nextChar;
          i++; // Skip next character
        }
      }
      
      // Add the phoneme and reset
      if (currentPhoneme.length > 0) {
        phonemes.push(currentPhoneme);
        currentPhoneme = '';
      }
    }
    
    return phonemes;
  };
  
  // Calculate similarity between two sets of phonemes with improved accuracy
  const calculatePhonemeSimilarity = (phonemes1: string[], phonemes2: string[]): number => {
    if (phonemes1.length === 0 || phonemes2.length === 0) return 0;
    
    let totalScore = 0;
    const maxLength = Math.max(phonemes1.length, phonemes2.length);
    
    // Weight phonemes by position for more accurate comparison
    phonemes1.forEach((p1, index) => {
      // Find best matching phoneme in phonemes2
      let bestPhonemeMatch = 0;
      
      for (const p2 of phonemes2) {
        const similarity = calculateWordSimilarity(p1, p2);
        bestPhonemeMatch = Math.max(bestPhonemeMatch, similarity);
      }
      
      // Position-based importance (beginning and ending are more important)
      // Increase weight for final sounds as they're critical for proper pronunciation
      const isFinalPhoneme = index === phonemes1.length - 1;
      const positionWeight = index === 0 ? 1.2 : isFinalPhoneme ? 1.5 : 1;
      
      // Add to total score
      totalScore += bestPhonemeMatch * positionWeight;
    });
    
    // Check if final phoneme exists in both words
    const hasFinalPhonemeMatch = phonemes1.length > 0 && phonemes2.length > 0 && 
      calculateWordSimilarity(phonemes1[phonemes1.length - 1], phonemes2[phonemes2.length - 1]) > 0.7;
    
    // Apply significant penalty if final phoneme doesn't match well
    let finalPhonemeMultiplier = 1.0;
    if (!hasFinalPhonemeMatch && phonemes1.length > 1 && phonemes2.length > 1) {
      finalPhonemeMultiplier = 0.8; // 20% penalty for poor final phoneme match
    }
    
    // Normalize score by max possible score
    const maxPossibleScore = (phonemes1.length - 1) * 1.0 + 1.2 + (phonemes1.length >= 2 ? 1.5 - 1.0 : 0);
    const normalizedScore = (totalScore / maxPossibleScore) * 100 * finalPhonemeMultiplier;
    
    // Cap at 100%
    return Math.min(100, normalizedScore);
  };

  // New function to analyze stress pattern more accurately
  const calculateStressScore = (targetWord: string, userWord: string): number => {
    // If there's no user word, use a base score
    if (!userWord || targetWord === userWord) {
      return 100;
    }
    
    // Simple syllable count comparison - more accurate would need IPA
    const targetSyllables = countSyllables(targetWord);
    const userSyllables = countSyllables(userWord);
    
    // If syllable counts are different, penalize
    if (targetSyllables !== userSyllables) {
      return 70;
    }
    
    // Check if vowels are roughly in the same positions
    const targetVowelPositions = getVowelPositions(targetWord);
    const userVowelPositions = getVowelPositions(userWord);
    
    // Compare vowel positions
    let positionMatchScore = 0;
    if (targetVowelPositions.length > 0 && userVowelPositions.length > 0) {
      const normalizedTarget = targetVowelPositions.map(pos => pos / targetWord.length);
      const normalizedUser = userVowelPositions.map(pos => pos / userWord.length);
      
      // Find closest matches for each position
      let totalPositionDiff = 0;
      let matchCount = 0;
      
      for (let i = 0; i < Math.min(normalizedTarget.length, normalizedUser.length); i++) {
        const targetPos = normalizedTarget[i];
        const userPos = normalizedUser[i];
        
        // Calculate position difference
        totalPositionDiff += Math.abs(targetPos - userPos);
        matchCount++;
      }
      
      // Calculate average position difference
      const avgPosDiff = matchCount > 0 ? totalPositionDiff / matchCount : 1;
      positionMatchScore = 100 - (avgPosDiff * 100);
    }
    
    // Word length difference penalty
    const lengthDiffPenalty = Math.abs(targetWord.length - userWord.length) * 3;
    
    // Calculate final stress score
    let stressScore = positionMatchScore - lengthDiffPenalty;
    
    // Cap stress score between 50 and 100
    return Math.min(100, Math.max(50, stressScore));
  };
  
  // Helper function to count syllables in a word
  const countSyllables = (word: string): number => {
    const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
    const lowercaseWord = word.toLowerCase();
    let syllableCount = 0;
    let isPreviousVowel = false;
    
    for (let i = 0; i < lowercaseWord.length; i++) {
      const isCurrentVowel = vowels.includes(lowercaseWord[i]);
      
      // Count syllable when we transition from non-vowel to vowel
      if (isCurrentVowel && !isPreviousVowel) {
        syllableCount++;
      }
      
      isPreviousVowel = isCurrentVowel;
    }
    
    // Handle special cases
    if (syllableCount === 0) {
      syllableCount = 1; // Ensure at least one syllable
    }
    
    // Handle silent e at the end
    if (lowercaseWord.length > 2 && 
        lowercaseWord.endsWith('e') && 
        !vowels.includes(lowercaseWord[lowercaseWord.length - 2])) {
      syllableCount = Math.max(1, syllableCount - 1);
    }
    
    return syllableCount;
  };
  
  // Helper function to get vowel positions in a word
  const getVowelPositions = (word: string): number[] => {
    const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
    const positions: number[] = [];
    const lowercaseWord = word.toLowerCase();
    
    for (let i = 0; i < lowercaseWord.length; i++) {
      if (vowels.includes(lowercaseWord[i])) {
        positions.push(i);
      }
    }
    
    return positions;
  };

  // Calculate similarity between words (using improved Levenshtein distance)
  const calculateWordSimilarity = (word1: string, word2: string): number => {
    // If exact match
    if (word1 === word2) return 1.0;
    
    // Calculate Levenshtein distance
    const distance = levenshteinDistance(word1, word2);
    const maxLength = Math.max(word1.length, word2.length);
    
    // Adjusted similarity calculation with extra weighting for common prefix
    let similarity = 1 - (distance / maxLength);
    
    // Bonus for common prefix (important for pronunciation)
    const prefixLength = commonPrefixLength(word1, word2);
    if (prefixLength > 0) {
      const prefixBonus = (prefixLength / Math.min(word1.length, word2.length)) * 0.2;
      similarity += prefixBonus;
    }
    
    // Cap at 1.0 (100%)
    return Math.min(1.0, similarity);
  };
  
  // Helper function for common prefix length
  const commonPrefixLength = (a: string, b: string): number => {
    let i = 0;
    const minLength = Math.min(a.length, b.length);
    
    while (i < minLength && a[i].toLowerCase() === b[i].toLowerCase()) {
      i++;
    }
    
    return i;
  };
  
  // Improved Levenshtein distance calculation
  const levenshteinDistance = (a: string, b: string): number => {
    const matrix = [];
    
    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    // Fill the matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        // Lower cost for vowel-vowel or consonant-consonant substitutions
        const isAVowel = /[aeiouy]/i.test(a[j-1]);
        const isBVowel = /[aeiouy]/i.test(b[i-1]);
        let substitutionCost = a[j-1].toLowerCase() === b[i-1].toLowerCase() ? 0 : 1;
        
        // Reduce penalty for vowel-vowel or consonant-consonant substitutions
        if (substitutionCost > 0 && isAVowel === isBVowel) {
          substitutionCost = 0.8;
        }
        
        matrix[i][j] = Math.min(
          matrix[i-1][j] + 1, // deletion
          matrix[i][j-1] + 1, // insertion
          matrix[i-1][j-1] + substitutionCost // substitution
        );
      }
    }
    
    return matrix[b.length][a.length];
  };

  // Helper function to check if character is a vowel
  const isVowel = (char: string): boolean => {
    return /[aeiouy]/i.test(char);
  };
  
  // Calculate score specifically for final sound accuracy
  const calculateFinalSoundScore = (targetWord: string, userWord: string): number => {
    if (!targetWord || !userWord) return 0;
    if (targetWord === userWord) return 100;
    
    // Get the final characters
    const targetFinal = targetWord[targetWord.length - 1];
    const userFinal = userWord[userWord.length - 1];
    
    // Direct match of final character
    if (targetFinal === userFinal) return 100;
    
    // If both are vowels or both are consonants, partial score
    if (isVowel(targetFinal) && isVowel(userFinal)) return 80;
    if (!isVowel(targetFinal) && !isVowel(userFinal)) {
      // Check for similar consonant sounds (same pronunciation category)
      const similarConsonantGroups = [
        ['p', 'b'], 
        ['t', 'd'], 
        ['k', 'g'], 
        ['f', 'v'], 
        ['s', 'z'], 
        ['m', 'n', 'ng'], 
        ['r', 'l']
      ];
      
      for (const group of similarConsonantGroups) {
        if (group.includes(targetFinal.toLowerCase()) && group.includes(userFinal.toLowerCase())) {
          return 70;
        }
      }
      return 60; // Different consonants
    }
    
    // One is vowel, one is consonant - low score
    return 30;
  };

  // Highlight words in the original phrase that were mispronounced
  const highlightErrorsInPhrase = (phrase: string) => {
    if (!wordErrors.length) return phrase;
    
    const words = phrase.split(/\s+/);
    return words.map((word, idx) => {
      const cleanWord = word.replace(/[.,!?;:]/g, '').toLowerCase();
      const isError = wordErrors.some(err => err.word.toLowerCase() === cleanWord);
      return isError 
        ? <span key={idx} className="bg-red-100 text-red-600 px-1 rounded">{word}</span> 
        : <span key={idx}>{word}</span>;
    });
  };

  const handleNext = () => {
    if (currentPhraseIndex < (analysisResult?.phrases.length || 0) - 1) {
      setIsAnimating(true);
      setTimeout(() => {
      setCurrentPhraseIndex(prev => prev + 1);
      setAttemptsLeft(3);
      setUserTranscript('');
      setScore(null);
      setShowVietnamese(false);
        setWordErrors([]);
        setPracticeWord(null);
        setIsAnimating(false);
      }, 300);
    } else {
      // Move to next step when all phrases are complete
      setCurrentStep(4);
    }
  };

  const handlePrevious = () => {
    if (currentPhraseIndex > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPhraseIndex(prev => prev - 1);
        setAttemptsLeft(3);
        setUserTranscript('');
        setScore(null);
        setShowVietnamese(false);
        setWordErrors([]);
        setPracticeWord(null);
        setIsAnimating(false);
      }, 300);
    }
  };

  const resetAttempts = () => {
    setAttemptsLeft(3);
    setUserTranscript('');
    setScore(null);
    setWordErrors([]);
    setPracticeWord(null);
  };

  if (!analysisResult || !currentPhrase) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = ((currentPhraseIndex + 1) / analysisResult.phrases.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="glass-card p-6 mb-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">Bước 3: Luyện Nói Tiếng Anh (Input)</h2>
        <p className="text-gray-600">
          Luyện phát âm từng cụm từ tiếng Anh từ bản gốc
        </p>
      </div>

        {/* Progress bar with animated fill */}
        <div className="mb-6 bg-gray-200 h-3 rounded-full overflow-hidden">
          <motion.div 
          className="bg-gradient-to-r from-hamaspeak-blue to-hamaspeak-purple h-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
      </div>

        {/* Main content area with 3D effect */}
        <div className="relative mb-8">
          {/* Animated glow effect */}
          <div className="absolute inset-0 rounded-xl blur-xl transition-opacity duration-500 bg-hamaspeak-blue/10 opacity-50"></div>
          
          <AnimatePresence mode="wait">
            {practiceWord ? (
              // Practice mode for a specific word
              <motion.div
                key="practice-mode"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-md relative overflow-hidden border border-gray-100"
              >
                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setPracticeWord(null)} 
                    className="absolute right-2 top-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    <span>Quay lại</span>
                  </Button>
                  
                  <h3 className="text-xl font-medium mb-2">Luyện phát âm từng từ</h3>
                  
                  <div className="mt-6 flex flex-col items-center">
                    <p className="text-2xl font-bold text-hamaspeak-blue mb-1">{practiceWord.word}</p>
                    <p className="font-mono text-lg mb-4">{practiceWord.ipa}</p>
                    
                    <div className="flex gap-3 mt-2">
                      <Button 
                        onClick={() => handlePracticeWord(practiceWord)} 
                        disabled={isSpeaking}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Volume2 className={`h-4 w-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
                        <span>Nghe mẫu</span>
                      </Button>
                      
                      <Button 
                        onClick={handlePracticeWordListen} 
                        variant={isPracticingSpeech ? "default" : "outline"}
                        className={`flex items-center gap-2 ${
                          isPracticingSpeech ? 'bg-red-500 hover:bg-red-600' : ''
                        }`}
                      >
                        {isPracticingSpeech ? (
                          <>
                            <MicOff className="h-4 w-4 animate-pulse" />
                            <span>Dừng lại</span>
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4" />
                            <span>Nói thử</span>
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPronunciationDetails(!showPronunciationDetails)}
                        className="w-9 h-9 rounded-full"
                      >
                        <Info className={`h-4 w-4 ${showPronunciationDetails ? 'text-blue-500' : 'text-gray-400'}`} />
                      </Button>
                    </div>
                    
                    {practiceResult && (
                      <motion.div
                        className="mt-6 p-3 rounded-lg border w-full"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        style={{
                          backgroundColor: practiceResult === 'correct' 
                            ? 'rgba(16, 185, 129, 0.1)' 
                            : practiceResult === 'partial'
                              ? 'rgba(245, 158, 11, 0.1)'
                              : practiceResult === 'incorrect'
                                ? 'rgba(239, 68, 68, 0.1)'
                                : 'rgba(107, 114, 128, 0.1)',
                          borderColor: practiceResult === 'correct' 
                            ? 'rgb(16, 185, 129)' 
                            : practiceResult === 'partial'
                              ? 'rgb(245, 158, 11)'
                              : practiceResult === 'incorrect'
                                ? 'rgb(239, 68, 68)'
                                : 'rgb(107, 114, 128)'
                        }}
                      >
                        <div className="text-center font-medium mb-2" style={{
                          color: practiceResult === 'correct' 
                            ? 'rgb(16, 185, 129)' 
                            : practiceResult === 'partial'
                              ? 'rgb(245, 158, 11)'
                              : practiceResult === 'incorrect'
                                ? 'rgb(239, 68, 68)'
                                : 'rgb(107, 114, 128)'
                        }}>
                          {practiceResult === 'correct' 
                            ? 'Tuyệt vời! Phát âm chính xác.' 
                            : practiceResult === 'partial'
                              ? 'Khá tốt. Có thể cải thiện thêm.'
                              : practiceResult === 'incorrect'
                                ? 'Chưa chính xác. Hãy thử lại.' 
                                : 'Không thể nhận diện. Vui lòng thử lại.'}
                        </div>
                        
                        {practiceScore && (
                          <div className="mt-2 border-t pt-2">
                            <div className="mb-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Điểm tổng thể:</span>
                                <span className="font-medium">{practiceScore.overallScore}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full" 
                                  style={{
                                    width: `${practiceScore.overallScore}%`,
                                    backgroundColor: practiceScore.overallScore > 85 
                                      ? 'rgb(16, 185, 129)' 
                                      : practiceScore.overallScore > 60 
                                        ? 'rgb(245, 158, 11)' 
                                        : 'rgb(239, 68, 68)'
                                  }}
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mt-3">
                              <div>
                                <span className="text-gray-600">Độ chính xác:</span>
                                <span className="float-right font-medium">{practiceScore.similarityScore}%</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Phát âm:</span>
                                <span className="float-right font-medium">{practiceScore.phoneticAccuracy}%</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Trọng âm:</span>
                                <span className="float-right font-medium">{practiceScore.syllableScore}%</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Nhận dạng:</span>
                                <span className="float-right font-medium">{practiceScore.exactMatch ? 'Chính xác' : 'Gần đúng'}</span>
                              </div>
                            </div>
                            
                            {!practiceScore.exactMatch && practiceScore.bestMatchedWord && (
                              <div className="mt-2 text-xs text-gray-600">
                                <span>Từ được nhận dạng: </span>
                                <span className="font-medium">{practiceScore.bestMatchedWord}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                    
                    <AnimatePresence>
                      {showPronunciationDetails && (
                        <motion.div 
                          className="mt-8 w-full"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h4 className="font-medium mb-2 text-left">Hướng dẫn phát âm chi tiết:</h4>
                          <div className="text-left bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <p className="mb-3">
                              <span className="font-medium">Mẹo:</span> Phát âm từng phần của từ rồi ghép lại
                            </p>
                            
                            {practiceWord.ipa.split(/[ˈˌ]/).filter(part => part.trim()).map((phoneme, idx) => (
                              <div key={idx} className="mb-3 p-2 bg-white rounded-lg border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{phoneme.trim()}</span>
                                  <span className="text-gray-600 text-sm">
                                    {getPhonemeDescription(phoneme.trim())}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  <p className="mb-1"><strong>Vị trí miệng:</strong> {getMouthPosition(phoneme.trim())}</p>
                                  <p><strong>Hướng dẫn:</strong> {getPronunciationTip(phoneme.trim())}</p>
                                </div>
                              </div>
                            ))}
                            
                            {/* Common pronunciation challenges */}
                            <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                              <h5 className="font-medium text-blue-700 mb-2">Lưu ý đặc biệt:</h5>
                              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                {getSpecificWordTips(practiceWord.word).map((tip, idx) => (
                                  <li key={idx}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                            
                            {/* Syllable emphasis */}
                            {practiceWord.word.length > 1 && (
                              <div className="mt-3 bg-purple-50 p-3 rounded-lg border border-purple-100">
                                <h5 className="font-medium text-purple-700 mb-1">Trọng âm:</h5>
                                <p className="text-sm text-gray-700">
                                  {getSyllableEmphasis(practiceWord.word, practiceWord.ipa)}
              </p>
            </div>
          )}
        </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ) : (
              // Regular flashcard mode
              <motion.div
                key={currentPhraseIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-md relative overflow-hidden border border-gray-100"
              >
                {/* English phrase with animation */}
                <motion.div 
                  className="text-center mb-6"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <h3 className="text-xl font-medium text-hamaspeak-blue mb-4 flex flex-wrap justify-center gap-1">
                    {score !== null && score < 90 
                      ? highlightErrorsInPhrase(currentPhrase.english) 
                      : currentPhrase.english}
                  </h3>
                  
                  {/* Play button with animation */}
                  <motion.div
                    className="mt-3 flex justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button 
                      onClick={handleSpeak} 
                      disabled={isSpeaking}
                      variant="ghost"
                      className="rounded-full p-2 h-12 w-12 flex items-center justify-center"
                    >
                      <Volume2 className={`h-6 w-6 ${isSpeaking ? 'text-hamaspeak-blue animate-pulse' : 'text-gray-500'}`} />
                    </Button>
                  </motion.div>
                  
                  {/* Vietnamese meaning with animation */}
                  <AnimatePresence>
                    {showVietnamese && (
                      <motion.div 
                        className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-hamaspeak-purple font-medium">
                          {currentPhrase.vietnamese}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                
                {/* User transcript with score animation */}
                <AnimatePresence>
        {userTranscript && (
                    <motion.div 
                      className="mt-6 border-t pt-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="font-medium mb-2">Câu của bạn:</p>
                      <p className={`${score && score > 70 ? 'text-green-600' : 'text-orange-500'} font-medium text-lg mb-4`}>
              {userTranscript}
            </p>
            
            {score !== null && (
                        <motion.div 
                          className="mt-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                        >
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">Độ chính xác</span>
                            <span className="font-medium">{score}%</span>
                </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                            <motion.div 
                              className={`h-full ${
                                score > 80 ? 'bg-green-500' : 
                                score > 60 ? 'bg-yellow-500' : 
                                'bg-orange-500'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${score}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                          
                          <motion.p 
                            className={`mt-2 ${
                              score > 80 ? 'text-green-600' : 
                              score > 60 ? 'text-yellow-600' : 
                              'text-orange-600'} font-medium`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                  {score > 80 ? 'Tuyệt vời! Phát âm của bạn rất chuẩn.' :
                   score > 60 ? 'Khá tốt! Tiếp tục luyện tập.' :
                   'Hãy thử lại và cải thiện phát âm của bạn.'}
                          </motion.p>
                          
                          {/* IPA transcriptions for mispronounced words */}
                          {wordErrors.length > 0 && (
                            <motion.div
                              className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              transition={{ delay: 0.5, duration: 0.3 }}
                            >
                              <p className="font-medium text-red-600 mb-2">Lỗi phát âm:</p>
                              <div className="grid grid-cols-1 gap-2">
                                {wordErrors.map((item, idx) => (
                                  <div key={idx} className="flex flex-wrap items-center gap-2 p-2 bg-white rounded border border-red-100">
                                    <span className="font-medium">{item.word}</span>
                                    <span className="text-gray-500">→</span>
                                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">
                                      {item.ipa || '...'}
                                    </span>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handlePracticeWord(item)}
                                      className="ml-auto text-sm text-hamaspeak-blue"
                                    >
                                      Luyện tập
                                    </Button>
                                  </div>
                                ))}
              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
      </div>
      
        {/* Attempts indicator with animation */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center">
          <span className="mr-2 text-sm font-medium">Lượt thử còn lại:</span>
          {[...Array(attemptsLeft)].map((_, i) => (
              <motion.div 
                key={i} 
                className="w-3 h-3 bg-hamaspeak-blue rounded-full mx-1"
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              />
          ))}
          {[...Array(3 - attemptsLeft)].map((_, i) => (
              <div key={i + 3} className="w-3 h-3 bg-gray-300 rounded-full mx-1" />
            ))}
            
            {/* Reset attempts button */}
            {attemptsLeft === 0 && !practiceWord && (
              <Button 
                variant="ghost"
                size="sm"
                onClick={resetAttempts}
                className="ml-2 text-hamaspeak-blue"
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Thử lại
              </Button>
            )}
          </div>
        </div>

        {/* Control buttons with hover effects */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Button 
            onClick={handlePrevious}
            disabled={currentPhraseIndex === 0 || isAnimating || !!practiceWord}
            variant="outline"
            className="flex items-center justify-center gap-2 transition-all hover:border-hamaspeak-blue/50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sm:inline hidden">Quay lại</span>
          </Button>
          
        <Button 
          onClick={handleSpeak} 
            disabled={isSpeaking || !!practiceWord}
            variant="outline"
            className="flex items-center justify-center gap-2 transition-all hover:border-hamaspeak-purple/50"
        >
            <Volume2 className={`h-4 w-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
            <span className="sm:inline hidden">Nghe mẫu</span>
        </Button>
        
        <Button 
          onClick={handleListen} 
            disabled={(attemptsLeft <= 0 && !isListening) || !!practiceWord}
            variant={isListening ? "default" : "outline"}
            className={`flex items-center justify-center gap-2 transition-all ${
              isListening ? 'bg-red-500 hover:bg-red-600' : 'hover:border-hamaspeak-teal/50'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4 animate-pulse" />
                <span className="sm:inline hidden">Dừng lại</span>
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                <span className="sm:inline hidden">Nói theo</span>
              </>
            )}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setShowVietnamese(!showVietnamese)}
            disabled={!!practiceWord}
            className="flex items-center justify-center gap-2"
          >
            <span className="sm:inline hidden">{showVietnamese ? 'Ẩn nghĩa' : 'Xem nghĩa'}</span>
          </Button>
        
        <Button 
          onClick={handleNext} 
            disabled={isAnimating || !!practiceWord}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-hamaspeak-blue to-hamaspeak-purple hover:opacity-90 transition-all"
        >
            <span className="sm:inline hidden">
          {currentPhraseIndex < analysisResult.phrases.length - 1 
                ? 'Tiếp theo' 
                : 'Hoàn thành'}
            </span>
            <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
      
      {/* Card navigation dots */}
      <div className="flex flex-wrap justify-center items-center gap-1 mb-6">
        {analysisResult.phrases.map((phrase, idx) => (
          <button
            key={idx}
            onClick={() => !isAnimating && !practiceWord && setCurrentPhraseIndex(idx)}
            className={`w-3 h-3 rounded-full transition-all ${
              idx === currentPhraseIndex 
                ? 'bg-hamaspeak-blue scale-125' 
                : idx < currentPhraseIndex 
                  ? 'bg-gray-400' 
                  : 'bg-gray-200'
            }`}
            aria-label={`Go to phrase ${idx + 1}`}
            disabled={!!practiceWord}
          />
        ))}
      </div>
      
      {/* Current phrase indicator */}
      <div className="text-center text-gray-500 text-sm">
        Cụm từ {currentPhraseIndex + 1} / {analysisResult.phrases.length}
      </div>
    </div>
  );
};

// Helper function to provide descriptions for phonemes
const getPhonemeDescription = (phoneme: string): string => {
  const descriptions: Record<string, string> = {
    // Vowels
    'æ': 'như "a" trong "cat"',
    'ɑː': 'như "a" trong "father"',
    'ɛ': 'như "e" trong "bed"',
    'ə': 'như "a" trong "about"',
    'ɪ': 'như "i" trong "bit"',
    'iː': 'như "ee" trong "see"',
    'ɒ': 'như "o" trong "hot" (Anh)',
    'ʊ': 'như "u" trong "put"',
    'uː': 'như "oo" trong "boot"',
    'ʌ': 'như "u" trong "but"',
    'eɪ': 'như "ay" trong "day"',
    'aɪ': 'như "i" trong "like"',
    'ɔɪ': 'như "oy" trong "boy"',
    'əʊ': 'như "o" trong "go"',
    'aʊ': 'như "ow" trong "now"',
    'ɪə': 'như "ear" trong "near"',
    'ɛə': 'như "air" trong "fair"',
    'ʊə': 'như "ure" trong "pure"',
    
    // Consonants
    'p': 'như "p" trong "pen"',
    'b': 'như "b" trong "bad"',
    't': 'như "t" trong "tea"',
    'd': 'như "d" trong "did"',
    'k': 'như "c" trong "key"',
    'g': 'như "g" trong "get"',
    'f': 'như "f" trong "fat"',
    'v': 'như "v" trong "view"',
    'θ': 'như "th" trong "think"',
    'ð': 'như "th" trong "this"',
    's': 'như "s" trong "see"',
    'z': 'như "z" trong "zoo"',
    'ʃ': 'như "sh" trong "she"',
    'ʒ': 'như "s" trong "pleasure"',
    'h': 'như "h" trong "hot"',
    'm': 'như "m" trong "man"',
    'n': 'như "n" trong "not"',
    'ŋ': 'như "ng" trong "sing"',
    'l': 'như "l" trong "let"',
    'r': 'như "r" trong "run"',
    'j': 'như "y" trong "yes"',
    'w': 'như "w" trong "wet"',
    'tʃ': 'như "ch" trong "chair"',
    'dʒ': 'như "j" trong "join"',
  };
  
  // Check for exact match
  if (descriptions[phoneme]) {
    return descriptions[phoneme];
  }
  
  // Look for partial matches
  for (const key of Object.keys(descriptions)) {
    if (phoneme.includes(key)) {
      return descriptions[key];
    }
  }
  
  return 'phát âm đặc biệt';
};

// Helper function to get mouth position for phonemes
const getMouthPosition = (phoneme: string): string => {
  const positions: Record<string, string> = {
    // Vowels
    'æ': 'Mở miệng rộng, lưỡi thấp, hơi phẳng',
    'ɑː': 'Mở miệng rộng, lưỡi thấp và về phía sau',
    'ɛ': 'Mở miệng vừa phải, lưỡi ở vị trí trung bình',
    'ə': 'Miệng mở nhẹ, lưỡi ở vị trí trung bình, thư giãn',
    'ɪ': 'Miệng hơi khép, lưỡi cao ở phía trước',
    'iː': 'Miệng khép gần, lưỡi cao ở phía trước',
    'ɒ': 'Mở miệng rộng, lưỡi thấp và về phía sau, môi tròn',
    'ʊ': 'Miệng hơi khép, lưỡi cao ở phía sau, môi tròn',
    'uː': 'Miệng khép gần, lưỡi cao ở phía sau, môi tròn',
    'ʌ': 'Mở miệng vừa phải, lưỡi ở vị trí trung bình',
    
    // Consonants
    'p': 'Môi khép lại hoàn toàn rồi bung ra',
    'b': 'Môi khép lại hoàn toàn rồi bung ra, có rung thanh quản',
    't': 'Lưỡi chạm vào phía sau răng trên',
    'd': 'Lưỡi chạm vào phía sau răng trên, có rung thanh quản',
    'k': 'Phía sau lưỡi chạm vào vòm mềm',
    'g': 'Phía sau lưỡi chạm vào vòm mềm, có rung thanh quản',
    'f': 'Răng trên chạm vào môi dưới, tạo luồng hơi',
    'v': 'Răng trên chạm vào môi dưới, có rung thanh quản',
    'θ': 'Đầu lưỡi giữa răng trên và dưới',
    'ð': 'Đầu lưỡi giữa răng trên và dưới, có rung thanh quản',
    's': 'Đầu lưỡi gần răng trên, tạo luồng hơi',
    'z': 'Đầu lưỡi gần răng trên, có rung thanh quản',
  };
  
  // Check for exact match or common patterns
  for (const key of Object.keys(positions)) {
    if (phoneme.includes(key)) {
      return positions[key];
    }
  }
  
  return 'Mở miệng tự nhiên và phát âm theo mẫu';
};

// Helper function to get specific pronunciation tips
const getPronunciationTip = (phoneme: string): string => {
  const tips: Record<string, string> = {
    // Vowels
    'æ': 'Mở miệng rộng như "a" trong "cat", không phải "ê" như trong tiếng Việt',
    'ɑː': 'Kéo dài âm "a" nhưng không mở miệng quá rộng',
    'ɛ': 'Âm "e" nhưng miệng mở hơn so với tiếng Việt',
    'ə': 'Âm trung tính, không căng cơ, hơi hé miệng',
    'ɪ': 'Ngắn hơn âm "i" trong tiếng Việt',
    'iː': 'Kéo dài âm "i", miệng hơi mỉm cười',
    'ɒ': 'Mở miệng rộng, âm "o" ngắn',
    'ʊ': 'Ngắn hơn âm "u" trong tiếng Việt',
    'uː': 'Kéo dài âm "u", môi tròn đẩy ra trước',
    'ʌ': 'Giống "a" nhưng lưỡi thấp hơn',
    
    // Consonants
    'p': 'Bung môi mạnh, có hơi',
    'b': 'Bung môi nhẹ hơn "p", có rung thanh quản',
    't': 'Đầu lưỡi chạm nhẹ vào phía trong răng trên rồi bung ra',
    'd': 'Giống "t" nhưng nhẹ hơn, có rung thanh quản',
    'k': 'Phía sau lưỡi chạm vào vòm miệng rồi bung ra mạnh',
    'g': 'Giống "k" nhưng nhẹ hơn, có rung thanh quản',
    'θ': 'Đầu lưỡi giữa răng, thổi khí nhẹ qua khe răng',
    'ð': 'Giống "θ" nhưng có rung thanh quản',
    'ʃ': 'Giống "s" nhưng lưỡi co lại, tạo âm "sh"',
    'ʒ': 'Giống "ʃ" nhưng có rung thanh quản, như "s" trong "measure"',
    'tʃ': 'Kết hợp "t" và "ʃ" nhanh và liền mạch',
    'dʒ': 'Kết hợp "d" và "ʒ" nhanh và liền mạch',
  };
  
  // Check for exact match or common patterns
  for (const key of Object.keys(tips)) {
    if (phoneme.includes(key)) {
      return tips[key];
    }
  }
  
  return 'Nghe và bắt chước âm mẫu';
};

// Helper function to get word-specific pronunciation tips
const getSpecificWordTips = (word: string): string[] => {
  // Common words with specific pronunciation challenges
  const wordTips: Record<string, string[]> = {
    'would': [
      'Âm "l" cuối từ thường không phát âm rõ',
      'Phát âm như "wʊd", không phải "wu:ld"',
      'Đảm bảo âm "w" ở đầu không bị phát âm như "v"'
    ],
    'could': [
      'Âm "l" cuối từ thường không phát âm rõ',
      'Phát âm như "kʊd", không phải "ku:ld"'
    ],
    'should': [
      'Âm "l" cuối từ thường không phát âm rõ',
      'Phát âm như "ʃʊd", không phải "ʃu:ld"',
      'Chú ý âm "sh" ở đầu từ'
    ],
    'thought': [
      'Âm "th" phát âm như đặt lưỡi giữa răng',
      'Âm "ough" phát âm như "ɔː", không phải từng chữ cái',
      'Âm "t" cuối từ thường nhẹ và không bung hơi'
    ],
    'through': [
      'Âm "th" phát âm như đặt lưỡi giữa răng',
      'Âm "ough" phát âm như "uː", không phải từng chữ cái',
      'Không phát âm như "trừ"'
    ],
    'taught': [
      'Phát âm gần giống "tốt" trong tiếng Việt nhưng kéo dài âm "o"',
      'Âm "t" cuối từ thường nhẹ và không bung hơi'
    ],
    'work': [
      'Âm "o" trong "work" phát âm như "ɜː", miệng hơi tròn',
      'Không phát âm như "uː" (âm u dài)',
      'Âm "r" thường không rõ trong tiếng Anh Anh'
    ],
    'world': [
      'Âm "o" trong "world" phát âm như "ɜː", miệng hơi tròn',
      'Âm "r" và "l" hòa vào nhau, tạo âm trơn',
      'Phát âm gần như "wɜːld"'
    ],
    'heart': [
      'Phát âm như "hɑːt", không phải "hờt"',
      'Âm "ea" phát âm như "ɑː", không phải âm "e-a"',
      'Âm "r" thường không rõ trong tiếng Anh Anh'
    ],
  };
  
  // Get specific tips or return general tips
  const lowerWord = word.toLowerCase();
  
  if (wordTips[lowerWord]) {
    return wordTips[lowerWord];
  }
  
  // General tips based on word patterns
  const generalTips = [];
  
  if (lowerWord.endsWith('ed')) {
    generalTips.push('Đuôi "-ed" thường phát âm là /t/ sau các âm vô thanh (p, k, s, f, th)');
    generalTips.push('Đuôi "-ed" thường phát âm là /d/ sau các âm hữu thanh và nguyên âm');
    generalTips.push('Đuôi "-ed" phát âm là /id/ sau âm /t/ và /d/');
  }
  
  if (lowerWord.includes('th')) {
    generalTips.push('Âm "th" có thể phát âm là /θ/ (vô thanh) hoặc /ð/ (hữu thanh)');
    generalTips.push('Đặt lưỡi giữa răng và thổi khí nhẹ qua khe răng');
  }
  
  if (lowerWord.includes('r')) {
    generalTips.push('Âm "r" trong tiếng Anh khác với âm "r" trong tiếng Việt');
    generalTips.push('Không rung lưỡi, chỉ hơi cuộn đầu lưỡi lên trên và về phía sau');
  }
  
  return generalTips.length > 0 ? generalTips : [
    'Phát âm từng âm tiết rõ ràng, chú ý trọng âm',
    'Nghe từ mẫu nhiều lần và bắt chước',
    'Chú ý đến các âm khó phát âm cho người Việt'
  ];
};

// Helper function to describe syllable emphasis
const getSyllableEmphasis = (word: string, ipa: string): string => {
  // Check for stress markers in IPA
  const hasStressMarker = ipa.includes('ˈ') || ipa.includes('ˌ');
  
  if (hasStressMarker) {
    // Extract syllable info from IPA
    const primaryStressIndex = ipa.indexOf('ˈ');
    const secondaryStressIndex = ipa.indexOf('ˌ');
    
    let emphasisInfo = 'Nhấn mạnh vào ';
    
    if (primaryStressIndex >= 0) {
      // Find which syllable has the primary stress
      const syllableNumber = countSyllablesBeforeIndex(ipa, primaryStressIndex) + 1;
      emphasisInfo += `âm tiết thứ ${syllableNumber} (âm tiết chính)`;
      
      if (secondaryStressIndex >= 0) {
        const secondarySyllable = countSyllablesBeforeIndex(ipa, secondaryStressIndex) + 1;
        emphasisInfo += ` và âm tiết thứ ${secondarySyllable} (âm tiết phụ)`;
      }
    } else if (secondaryStressIndex >= 0) {
      const secondarySyllable = countSyllablesBeforeIndex(ipa, secondaryStressIndex) + 1;
      emphasisInfo += `âm tiết thứ ${secondarySyllable} (nhẹ)`;
    }
    
    return emphasisInfo;
  }
  
  // Fallback for when IPA doesn't have stress markers
  if (word.length > 6) {
    return 'Từ dài này thường nhấn mạnh vào âm tiết đầu hoặc âm tiết gần cuối. Nghe mẫu để biết cách nhấn đúng.';
  } else if (word.length > 1) {
    return 'Nhấn đều các âm tiết, nhưng nghe mẫu để biết cách nhấn đúng.';
  }
  
  return 'Từ đơn âm, phát âm bình thường.';
};

// Helper function to count syllables before an index in IPA
const countSyllablesBeforeIndex = (ipa: string, index: number): number => {
  if (index <= 0) return 0;
  
  // Count vowel sequences as syllable indicators
  const vowels = ['a', 'e', 'i', 'o', 'u', 'æ', 'ɑ', 'ɛ', 'ə', 'ɪ', 'i', 'ɒ', 'ʊ', 'u', 'ʌ'];
  let syllableCount = 0;
  let inVowel = false;
  
  for (let i = 0; i < index; i++) {
    const char = ipa[i].toLowerCase();
    
    // Skip stress markers
    if (char === 'ˈ' || char === 'ˌ') continue;
    
    const isVowel = vowels.includes(char);
    
    if (isVowel && !inVowel) {
      syllableCount++;
      inVowel = true;
    } else if (!isVowel) {
      inVowel = false;
    }
  }
  
  return syllableCount;
};

export default Step3EnglishSpeaking;

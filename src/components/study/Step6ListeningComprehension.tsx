import React, { useState } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, Mic, ArrowRight, Loader2, RefreshCw, Check, MicOff, X, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { speakText, startSpeechRecognition, stopSpeechRecognition, calculatePronunciationScore, getWordErrors, getIpaTranscription } from '@/utils/speechUtils';
import { Progress } from '@/components/ui/progress';

// Score details type definition
type PracticeScoreDetails = {
  overallScore: number;
  exactMatch: boolean;
  similarityScore: number;
  phoneticAccuracy: number;
  bestMatchedWord: string;
  syllableScore: number;
};

const Step6ListeningComprehension = () => {
  const { analysisResult, setCurrentStep, selectedVoice } = useStudy();
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [wordErrors, setWordErrors] = useState<Array<{word: string, ipa: string}>>([]);
  const [practiceWord, setPracticeWord] = useState<{word: string, ipa: string} | null>(null);
  const [isPracticingSpeech, setIsPracticingSpeech] = useState(false);
  const [practiceResult, setPracticeResult] = useState('');
  const [practiceScore, setPracticeScore] = useState<PracticeScoreDetails | null>(null);
  const [showPronunciationDetails, setShowPronunciationDetails] = useState(false);

  const sentences = analysisResult?.sentences || [];
  const currentSentence = sentences[currentSentenceIndex];

  const handleSpeak = async () => {
    if (!currentSentence || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      await speakText(currentSentence.english, selectedVoice);
      setHasListened(true);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleListen = async () => {
    if (!currentSentence) return;
    
    // Toggle recording if already listening
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
    setPracticeResult('');
    setPracticeScore(null);
    
    try {
      const result = await startSpeechRecognition('en-US');
      setUserTranscript(result.transcript);
      
      const pronunciationScore = calculatePronunciationScore(
        currentSentence.english, 
        result.transcript
      );
      setScore(pronunciationScore);
      
      // Get mispronounced words if score is below 90
      if (pronunciationScore < 90) {
        const errorWords = getWordErrors(currentSentence.english, result.transcript);
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
    setPracticeScore(null);
    setPracticeResult('');
    
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
    setPracticeScore(null);
    
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
      
      // Store detailed score
      setPracticeScore(scoreDetails);
    } catch (error) {
      console.error('Speech recognition error:', error);
      setPracticeResult('error');
    } finally {
      setIsPracticingSpeech(false);
    }
  };

  // Helper functions for detailed scoring
  const isVowel = (char: string): boolean => {
    return ['a', 'e', 'i', 'o', 'u'].includes(char.toLowerCase());
  };

  const calculateWordSimilarity = (word1: string, word2: string): number => {
    // If exact match
    if (word1 === word2) return 1.0;
    
    // Calculate Levenshtein distance
    const distance = levenshteinDistance(word1, word2);
    const maxLength = Math.max(word1.length, word2.length);
    
    // Return similarity ratio
    return 1 - (distance / maxLength);
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const m = str1.length;
    const n = str2.length;
    
    // Create a matrix of size (m+1) x (n+1)
    const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
    
    // Initialize the matrix
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    
    // Fill the matrix
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,      // deletion
          dp[i][j - 1] + 1,      // insertion
          dp[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    return dp[m][n];
  };

  const getWordPhonemes = (word: string): string[] => {
    // Simple phoneme extraction
    const phonemes: string[] = [];
    let i = 0;
    
    while (i < word.length) {
      // Check for common digraphs and trigraphs
      if (i < word.length - 2) {
        const trigraph = word.substring(i, i + 3).toLowerCase();
        if (['sch', 'tch', 'dge', 'eau', 'igh'].includes(trigraph)) {
          phonemes.push(trigraph);
          i += 3;
          continue;
        }
      }
      
      if (i < word.length - 1) {
        const digraph = word.substring(i, i + 2).toLowerCase();
        if (['ch', 'sh', 'th', 'ph', 'wh', 'gh', 'ng', 'kn', 'wr', 'ck', 'qu', 'ai', 'ay', 'ea', 'ee', 'ei', 'ey', 'ie', 'oa', 'oo', 'ou', 'ow', 'ue', 'ui'].includes(digraph)) {
          phonemes.push(digraph);
          i += 2;
          continue;
        }
      }
      
      // Single character phoneme
      phonemes.push(word[i].toLowerCase());
      i++;
    }
    
    return phonemes;
  };

  const calculatePhonemeSimilarity = (phonemes1: string[], phonemes2: string[]): number => {
    if (phonemes1.length === 0 || phonemes2.length === 0) return 0;
    
    let matches = 0;
    const maxLength = Math.max(phonemes1.length, phonemes2.length);
    
    // Compare phonemes in corresponding positions, giving higher weight to beginning and end
    for (let i = 0; i < Math.min(phonemes1.length, phonemes2.length); i++) {
      if (phonemes1[i] === phonemes2[i]) {
        // Weight beginning consonants and endings more heavily
        const positionBonus = (i === 0 || i === phonemes1.length - 1) ? 1.5 : 1;
        matches += positionBonus;
      }
    }
    
    return (matches / maxLength) * 100;
  };

  const calculateStressScore = (word1: string, word2: string): number => {
    if (!word1 || !word2) return 0;
    
    // Very simple stress pattern analysis based on syllable count
    const syllables1 = countSyllables(word1);
    const syllables2 = countSyllables(word2);
    
    if (syllables1 === syllables2) {
      return 100;
    } else {
      const diff = Math.abs(syllables1 - syllables2);
      return Math.max(0, 100 - (diff * 25));
    }
  };

  const countSyllables = (word: string): number => {
    const text = word.toLowerCase();
    let count = 0;
    let prev = '';
    
    for (let i = 0; i < text.length; i++) {
      const current = text[i];
      
      if (isVowel(current) && !isVowel(prev)) {
        count++;
      }
      
      prev = current;
    }
    
    // Handle special cases
    if (count === 0) count = 1;
    if (text.endsWith('e') && !isVowel(text[text.length - 2]) && count > 1) count--;
    if (text.endsWith('le') && !isVowel(text[text.length - 3]) && text.length > 2) count++;
    
    return count;
  };

  const calculateFinalSoundScore = (word1: string, word2: string): number => {
    if (!word1 || !word2) return 0;
    
    // Extract final consonant clusters or vowel
    const getEndSound = (word: string): string => {
      let end = '';
      let i = word.length - 1;
      
      // Get final consonant cluster
      while (i >= 0 && !isVowel(word[i])) {
        end = word[i] + end;
        i--;
      }
      
      // If no consonant at end, get final vowel
      if (end === '' && i >= 0) {
        end = word[i];
      }
      
      return end;
    };
    
    const end1 = getEndSound(word1);
    const end2 = getEndSound(word2);
    
    if (end1 === end2) return 100;
    
    // Calculate similarity for partial matches
    return calculateWordSimilarity(end1, end2) * 100;
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
    const weightedScore = Math.round(
      (bestSimilarity * 30) + (phoneticAccuracy * 40) + (stressScore * 15) + (finalSoundScore * 15)
    );
    
    // More strict conditions for high quality pronunciation
    const allComponentsHighQuality = 
      bestSimilarity >= 0.95 && 
      phoneticAccuracy >= 92 && 
      stressScore >= 92 && 
      finalSoundScore >= 92;
    
    // Apply stronger penalties for lower quality pronunciation
    let overallScore = weightedScore;
    
    // If not exact match and any component is problematic, apply penalties
    if (!exactMatch) {
      // Severe penalty for poor phonetic accuracy (most important factor)
      if (phoneticAccuracy < 75) {
        overallScore = Math.min(overallScore, 70); // Cap at 70% if phonetic accuracy is poor
      } 
      // Moderate penalty for poor overall match but decent phonetics
      else if (bestSimilarity < 0.8 || finalSoundScore < 75) {
        overallScore = Math.min(overallScore, 85); // Cap at 85% for moderate issues
      }
      // Minor penalty for slight issues
      else if (!allComponentsHighQuality) {
        overallScore = Math.min(overallScore, 95); // Cap at 95% for minor issues
      }
    }
    
    // Only allow 100% for exact matches with perfect pronunciation
    if (overallScore > 99 && !exactMatch) {
      overallScore = 99;
    }
    
    // Ensure no score exceeds 100%
    const finalOverallScore = Math.min(100, overallScore);
    const finalSimilarityScore = Math.min(100, Math.round(bestSimilarity * 100));
    
    return {
      overallScore: finalOverallScore,
      exactMatch,
      similarityScore: finalSimilarityScore,
      phoneticAccuracy: Math.round(phoneticAccuracy),
      bestMatchedWord: bestMatchedWord || '-',
      syllableScore: Math.round(stressScore)
    };
  };

  // Function to highlight mispronounced words in the displayed sentence
  const highlightErrorsInSentence = (sentence: string) => {
    if (!wordErrors.length) return sentence;
    
    let result = sentence;
    
    // Replace mispronounced words with highlighted versions
    wordErrors.forEach(({ word }) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      result = result.replace(regex, `<span class="text-red-500 font-bold">${word}</span>`);
    });
    
    return result;
  };

  const handleNext = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
      setShowEnglish(false);
      setHasListened(false);
      setUserTranscript('');
      setScore(null);
      setAttemptsLeft(3);
      setWordErrors([]);
      setPracticeWord(null);
      setPracticeResult('');
      setPracticeScore(null);
      setShowPronunciationDetails(false);
    } else {
      // Move to next step
      setCurrentStep(7);
    }
  };

  const resetAttempts = () => {
    setHasListened(false);
    setUserTranscript('');
    setScore(null);
    setAttemptsLeft(3);
    setWordErrors([]);
    setPracticeWord(null);
    setPracticeResult('');
    setPracticeScore(null);
    setShowPronunciationDetails(false);
    setShowEnglish(false);
  };

  if (!analysisResult || !currentSentence) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = ((currentSentenceIndex + 1) / sentences.length) * 100;

  return (
    <Card className="glass-card p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gradient mb-2">Bước 6: Nghe Hiểu (Output)</h2>
        <p className="text-gray-600">
          Tập nghe và hiểu nghĩa của từng câu tiếng Anh
        </p>
      </div>

      <div className="mb-6 bg-gray-200 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-hamaspeak-purple to-hamaspeak-teal h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="bg-white p-6 rounded-lg mb-6 shadow-sm transform hover:shadow-md transition-all">
        <div className="text-center">
          <p className="font-medium text-hamaspeak-purple mb-2">Nghĩa tiếng Việt:</p>
          <h3 className="text-xl font-medium text-hamaspeak-dark mb-4">
            {currentSentence.vietnamese}
          </h3>
          
          {showEnglish && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg animate-fade-in">
              <p 
                className="text-hamaspeak-blue font-medium"
                dangerouslySetInnerHTML={{ 
                  __html: score !== null ? 
                    highlightErrorsInSentence(currentSentence.english) : 
                    currentSentence.english 
                }}
              />
            </div>
          )}
          
          {!showEnglish && hasListened && !userTranscript && (
            <div className="mt-6 p-4 bg-gray-50/50 rounded-lg animate-fade-in">
              <p className="text-gray-500 italic">
                Bạn có nhận ra câu tiếng Anh vừa nghe không? Nhấn "Xem câu tiếng Anh" để kiểm tra hoặc nhấn "Nói theo" để phát âm theo câu đã nghe.
              </p>
            </div>
          )}
          
          {/* User's spoken transcript */}
          {userTranscript && (
            <div className="mt-6 border-t pt-4">
              <p className="font-medium mb-2 text-lg">Câu của bạn:</p>
              <p className={`${score && score > 70 ? 'text-green-600' : 'text-orange-500'} text-lg`}>
                {userTranscript}
              </p>
              
              {score !== null && (
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Độ chính xác</span>
                    <span className="font-medium">{score}%</span>
                  </div>
                  <Progress 
                    value={score} 
                    className={`h-2.5 ${
                      score > 80 ? 'bg-green-100' : 
                      score > 60 ? 'bg-yellow-100' : 
                      'bg-orange-100'}`} 
                  />
                  
                  <p className="mt-2 text-sm font-medium">
                    {score > 80 ? (
                      <span className="text-green-600">Tuyệt vời! Bạn đã phát âm chính xác.</span>
                    ) : score > 60 ? (
                      <span className="text-yellow-600">Khá tốt! Cố gắng cải thiện hơn nữa.</span>
                    ) : (
                      <span className="text-orange-600">Hãy thử lại và chú ý vào phát âm của từng từ.</span>
                    )}
                  </p>
                  
                  {/* Display mispronounced words with IPA */}
                  {wordErrors.length > 0 && (
                    <div className="mt-3 p-3 bg-orange-50 rounded-md">
                      <h4 className="text-sm font-medium mb-2">Từ cần cải thiện:</h4>
                      <div className="grid gap-1">
                        {wordErrors.map((error, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <span className="font-medium text-red-500">{error.word}</span>
                            <span className="mx-2 text-gray-400">→</span>
                            <span className="text-gray-600">[{error.ipa}]</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Practice Individual Words */}
                  {wordErrors.length > 0 && !practiceWord && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Luyện từng từ:</h4>
                      <div className="flex flex-wrap gap-2">
                        {wordErrors.map((error, index) => (
                          <Button 
                            key={index} 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePracticeWord(error)}
                            className="flex items-center"
                          >
                            <span className="font-medium text-red-500 mr-1">{error.word}</span>
                            <span className="text-xs text-gray-500">[{error.ipa}]</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Word Practice Mode */}
                  {practiceWord && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Luyện từ: <span className="text-blue-600">{practiceWord.word}</span></h4>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setPracticeWord(null);
                            setPracticeResult('');
                            setPracticeScore(null);
                            setShowPronunciationDetails(false);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <p className="mb-2 text-sm">Phát âm: <span className="text-gray-600">[{practiceWord.ipa}]</span></p>
                      
                      <div className="flex gap-2 mt-3">
                        <Button 
                          onClick={() => handlePracticeWord(practiceWord)}
                          disabled={isSpeaking} 
                          size="sm"
                        >
                          <Volume2 className="mr-1 h-3 w-3" />
                          Nghe lại
                        </Button>
                        
                        <Button 
                          onClick={handlePracticeWordListen}
                          disabled={isSpeaking} 
                          size="sm"
                          className={`${isPracticingSpeech ? 'bg-red-500 hover:bg-red-600' : ''}`}
                        >
                          {isPracticingSpeech ? (
                            <>
                              <MicOff className="mr-1 h-3 w-3 animate-pulse" />
                              Dừng
                            </>
                          ) : (
                            <>
                              <Mic className="mr-1 h-3 w-3" />
                              Thử nói
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {/* Practice Results with Detailed Score */}
                      {practiceResult && (
                        <div className="mt-3">
                          <div className={`p-2 rounded ${
                            practiceResult === 'correct' ? 'bg-green-100 text-green-700' : 
                            practiceResult === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                            practiceResult === 'incorrect' ? 'bg-orange-100 text-orange-700' : 
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {practiceResult === 'correct' ? (
                              <p className="text-sm">Tuyệt vời! Bạn đã phát âm đúng.</p>
                            ) : practiceResult === 'partial' ? (
                              <p className="text-sm">Gần đúng. Hãy thử lại và chú ý phát âm [<span className="font-medium">{practiceWord.ipa}</span>].</p>
                            ) : practiceResult === 'incorrect' ? (
                              <p className="text-sm">Chưa chính xác. Hãy thử lại và chú ý phát âm [<span className="font-medium">{practiceWord.ipa}</span>].</p>
                            ) : (
                              <p className="text-sm">Có lỗi xảy ra. Vui lòng thử lại.</p>
                            )}
                          </div>
                          
                          {practiceScore && (
                            <div className="mt-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Điểm: {practiceScore.overallScore}%</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => setShowPronunciationDetails(!showPronunciationDetails)}
                                >
                                  {showPronunciationDetails ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              
                              {showPronunciationDetails && (
                                <div className="mt-2 bg-white rounded p-2 text-xs space-y-1">
                                  <div className="flex justify-between">
                                    <span>Từ khớp chính xác:</span>
                                    <span>{practiceScore.exactMatch ? 'Có' : 'Không'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Từ gần nhất:</span>
                                    <span className="font-medium">{practiceScore.bestMatchedWord}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Độ tương đồng:</span>
                                    <span>{practiceScore.similarityScore}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Độ chính xác ngữ âm:</span>
                                    <span>{practiceScore.phoneticAccuracy}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Ngữ điệu và âm tiết:</span>
                                    <span>{practiceScore.syllableScore}%</span>
                                  </div>
                                  
                                  <div className="pt-1">
                                    <div className="flex items-center">
                                      <Info className="h-3 w-3 text-blue-500 mr-1" />
                                      <span className="text-blue-600">
                                        Lời khuyên phát âm:
                                      </span>
                                    </div>
                                    <p className="text-gray-600 mt-1">
                                      {practiceScore.phoneticAccuracy < 70 ? (
                                        <>Tập trung vào các âm tiết chính: <span className="font-medium">[{practiceWord.ipa}]</span></>
                                      ) : practiceScore.syllableScore < 70 ? (
                                        <>Chú ý nhấn đúng âm tiết và độ dài của từ</>
                                      ) : (
                                        <>Tiếp tục luyện tập để hoàn thiện phát âm</>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center">
          <span className="mr-2 text-sm font-medium">Lượt thử còn lại:</span>
          {[...Array(attemptsLeft)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-hamaspeak-purple rounded-full mx-1"></div>
          ))}
          {[...Array(3 - attemptsLeft)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-gray-300 rounded-full mx-1"></div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button 
          onClick={handleSpeak} 
          disabled={isSpeaking}
          className="glass-button relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
          <Volume2 className="mr-2 h-4 w-4" />
          {isSpeaking ? 'Đang phát...' : 'Nghe tiếng Anh'}
        </Button>
        
        <Button 
          onClick={handleListen} 
          disabled={!hasListened || (attemptsLeft <= 0 && !isListening)}
          className={`glass-button ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-hamaspeak-teal hover:bg-hamaspeak-teal/90'}`}
        >
          {isListening ? (
            <>
              <MicOff className="mr-2 h-4 w-4 animate-pulse" />
              Dừng ghi âm
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              Nói theo
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setShowEnglish(!showEnglish)}
          disabled={!hasListened}
          className={!hasListened ? 'opacity-50' : ''}
        >
          {showEnglish ? 'Ẩn câu tiếng Anh' : 'Xem câu tiếng Anh'}
        </Button>
        
        {hasListened && (
          <Button 
            onClick={resetAttempts}
            variant="outline"
            className="flex items-center"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Làm lại
          </Button>
        )}
        
        <Button 
          onClick={handleNext} 
          disabled={!hasListened}
          className="glass-button"
        >
          {currentSentenceIndex < sentences.length - 1 
            ? 'Câu tiếp theo' 
            : 'Bước tiếp theo'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-6 text-center">
        <div className="flex justify-center gap-1 mb-2">
          {sentences.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 w-6 rounded-full ${
                idx === currentSentenceIndex 
                  ? 'bg-hamaspeak-purple' 
                  : idx < currentSentenceIndex 
                    ? 'bg-gray-400' 
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Câu {currentSentenceIndex + 1} / {sentences.length}
        </p>
      </div>
    </Card>
  );
};

export default Step6ListeningComprehension;

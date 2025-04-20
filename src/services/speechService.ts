// Define types to match Microsoft Speech SDK
interface PronunciationAssessmentConfig {
  referenceText: string;
  applyTo: (recognizer: any) => void;
}

interface PronunciationAssessmentResult {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  pronScore?: number; // This may not exist, so we'll handle it in our code
}

// Define the static method as part of the namespace
interface PronunciationAssessmentResultStatic {
  fromResult: (result: any) => PronunciationAssessmentResult;
}

interface SpeechConfig {
  speechRecognitionLanguage: string;
  endpointId?: string;
}

interface ResultReason {
  RecognizedSpeech: number;
}

interface PropertyId {
  SpeechServiceResponse_JsonResult: string;
}

// Global SpeechSDK namespace
declare const SpeechSDK: {
  SpeechConfig: {
    fromSubscription: (key: string, region: string) => SpeechConfig;
  };
  AudioConfig: {
    fromDefaultMicrophoneInput: () => any;
    fromWavFileInput: (file: File) => any;
  };
  SpeechRecognizer: new (config: SpeechConfig, audioConfig: any) => any;
  PronunciationAssessmentConfig: new (
    text: string, 
    gradingSystem: number,
    granularity: number
  ) => PronunciationAssessmentConfig;
  PronunciationAssessmentGradingSystem: {
    HundredMark: number;
  };
  PronunciationAssessmentGranularity: {
    Phoneme: number;
  };
  PronunciationAssessmentResult: PronunciationAssessmentResultStatic;
  ResultReason: ResultReason;
  PropertyId: PropertyId;
};

export interface PronunciationScore {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  pronScore: number;
}

export interface WordScore {
  word: string;
  accuracyScore: number;
  errorType: string;
  offset: number;
  duration: number;
  syllables?: Array<{
    syllable: string;
    accuracyScore: number;
    offset: number;
    duration: number;
  }>;
  phonemes?: Array<{
    phoneme: string;
    accuracyScore: number;
    offset: number;
    duration: number;
  }>;
}

export interface PronunciationResult {
  text: string;
  overallScore: PronunciationScore;
  words: WordScore[];
  json: string;
}

export interface NBestPhoneme {
  Phoneme: string;
  Score: number;
}

export interface PhonemeScore {
  phoneme: string;
  accuracyScore: number;
  offset: number;
  duration: number;
  NBestPhonemes?: NBestPhoneme[];
}

export class SpeechService {
  private speechConfig: SpeechConfig | null = null;
  private pronunciationConfig: PronunciationAssessmentConfig | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<boolean> | null = null;

  constructor() {
    // We'll initialize the SDK lazily to ensure it's loaded
    this.initializationPromise = this.initialize();
  }

  private async initialize(): Promise<boolean> {
    try {
      // Check if SpeechSDK is already loaded
      if (typeof SpeechSDK !== 'undefined') {
        this.initializeSpeechSDK();
        return true;
      }

      // Wait for the SDK to load (it should be added in index.html)
      return new Promise<boolean>((resolve) => {
        const checkSDKLoaded = () => {
          if (typeof SpeechSDK !== 'undefined') {
            this.initializeSpeechSDK();
            resolve(true);
            return;
          }
          // Check again in 100ms
          setTimeout(checkSDKLoaded, 100);
        };
        
        checkSDKLoaded();
      });
    } catch (error) {
      console.error("Error initializing Speech SDK:", error);
      return false;
    }
  }

  private initializeSpeechSDK() {
    try {
      // Azure Speech service configuration
      const subscriptionKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
      const serviceRegion = import.meta.env.VITE_AZURE_SPEECH_REGION;

      if (!subscriptionKey || !serviceRegion) {
        console.error("Azure Speech Key or Region not configured in .env file!");
        throw new Error("Azure Speech configuration is missing.");
      }
      
      this.speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        subscriptionKey, 
        serviceRegion
      );
      this.speechConfig.speechRecognitionLanguage = "en-US";
      
      // Initialize pronunciation assessment config
      this.pronunciationConfig = new SpeechSDK.PronunciationAssessmentConfig(
        "",
        SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
        SpeechSDK.PronunciationAssessmentGranularity.Phoneme
      );
      
      this.isInitialized = true;
      console.log("Microsoft Speech SDK initialized successfully");
    } catch (error) {
      console.error("Error initializing Speech SDK:", error);
      throw new Error("Failed to initialize Microsoft Speech SDK. Please refresh the page and try again.");
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      if (!this.initializationPromise) {
        this.initializationPromise = this.initialize();
      }
      
      const initialized = await this.initializationPromise;
      if (!initialized) {
        throw new Error("Speech SDK could not be initialized. Please refresh the page and try again.");
      }
    }
  }

  async assessPronunciationFromMicrophone(referenceText: string): Promise<PronunciationResult> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      try {
        if (!this.pronunciationConfig || !this.speechConfig) {
          reject(new Error("Speech services not initialized. Please refresh the page."));
          return;
        }
        
        // Update the reference text
        this.pronunciationConfig.referenceText = referenceText;
        
        // Create audio config for microphone
        const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        
        // Create speech recognizer
        const recognizer = new SpeechSDK.SpeechRecognizer(this.speechConfig, audioConfig);
        
        // Add property to extend silence timeout - đợi lâu hơn trước khi kết thúc ghi âm
        if (recognizer.properties) {
          // Tăng thời gian timeout khi kết thúc nhận diện (ms)
          recognizer.properties.setProperty("SPEECH-RecognitionEndTimeout", "15000");
          
          // Tăng thời gian timeout khi đợi speech ban đầu (ms)
          recognizer.properties.setProperty("SPEECH-InitialSilenceTimeout", "10000");
          
          // Tăng thời gian timeout khi phát hiện silence (ms)
          recognizer.properties.setProperty("SPEECH-SegmentationSilenceTimeout", "1000");
        }
        
        // Apply pronunciation assessment config
        this.pronunciationConfig.applyTo(recognizer);
        
        // Start recognition
        recognizer.recognizeOnceAsync(
          (result: any) => {
            // Process results
            if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
              // Get pronunciation assessment results
              const pronunciationAssessmentResult = SpeechSDK.PronunciationAssessmentResult.fromResult(result);
              const rawJson = result.properties.getProperty(SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult);
              
              // Parse the JSON to extract word-level details
              const jsonResult = JSON.parse(rawJson);
              const nBestResult = jsonResult.NBest && jsonResult.NBest.length > 0 ? jsonResult.NBest[0] : null;
              
              const wordScores: WordScore[] = [];
              
              if (nBestResult && nBestResult.Words) {
                nBestResult.Words.forEach((word: any) => {
                  const wordScore: WordScore = {
                    word: word.Word,
                    accuracyScore: word.PronunciationAssessment?.AccuracyScore || 0,
                    errorType: word.PronunciationAssessment?.ErrorType || "Unknown",
                    offset: word.Offset,
                    duration: word.Duration
                  };
                  
                  // Add syllables if they exist
                  if (word.Syllables) {
                    wordScore.syllables = word.Syllables.map((syl: any) => ({
                      syllable: syl.Syllable,
                      accuracyScore: syl.PronunciationAssessment?.AccuracyScore || 0,
                      offset: syl.Offset,
                      duration: syl.Duration
                    }));
                  }
                  
                  // Add phonemes if they exist
                  if (word.Phonemes) {
                    wordScore.phonemes = word.Phonemes.map((ph: any) => ({
                      phoneme: ph.Phoneme,
                      accuracyScore: ph.PronunciationAssessment?.AccuracyScore || 0,
                      offset: ph.Offset,
                      duration: ph.Duration
                    }));
                  }
                  
                  wordScores.push(wordScore);
                });
              }
              
              // Use the PronunciationAssessment result if available, otherwise use a default value
              const pronScore = pronunciationAssessmentResult.pronScore !== undefined ? 
                                pronunciationAssessmentResult.pronScore : 
                                pronunciationAssessmentResult.accuracyScore;
              
              const pronouncementResult: PronunciationResult = {
                text: result.text,
                overallScore: {
                  accuracyScore: pronunciationAssessmentResult.accuracyScore,
                  fluencyScore: pronunciationAssessmentResult.fluencyScore,
                  completenessScore: pronunciationAssessmentResult.completenessScore,
                  pronScore: pronScore
                },
                words: wordScores,
                json: rawJson
              };
              
              resolve(pronouncementResult);
            } else {
              // Handle recognition errors
              reject(new Error(`Speech was not recognized. Reason: ${result.reason}`));
            }
            
            // Clean up resources
            recognizer.close();
          },
          (error: any) => {
            console.error("Error during speech recognition:", error);
            reject(error);
            recognizer.close();
          }
        );
        
        console.log("Please speak now...");
      } catch (error) {
        console.error("Error initializing speech recognition:", error);
        reject(error);
      }
    });
  }

  async assessPronunciationFromFile(audioFile: File, referenceText: string): Promise<PronunciationResult> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      try {
        if (!this.pronunciationConfig || !this.speechConfig) {
          reject(new Error("Speech services not initialized. Please refresh the page."));
          return;
        }
        
        // Set the reference text
        this.pronunciationConfig.referenceText = referenceText;
        
        // Create a blob URL for the audio file
        const audioFileUrl = URL.createObjectURL(audioFile);
        
        // Create audio config for the file
        const audioConfig = SpeechSDK.AudioConfig.fromWavFileInput(audioFile);
        
        // Create speech recognizer
        const recognizer = new SpeechSDK.SpeechRecognizer(this.speechConfig, audioConfig);
        
        // Apply pronunciation assessment config
        this.pronunciationConfig.applyTo(recognizer);
        
        // Start recognition
        recognizer.recognizeOnceAsync(
          (result: any) => {
            // Process results
            if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
              // Get pronunciation assessment results
              const pronunciationAssessmentResult = SpeechSDK.PronunciationAssessmentResult.fromResult(result);
              const rawJson = result.properties.getProperty(SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult);
              
              // Parse the JSON to extract word-level details
              const jsonResult = JSON.parse(rawJson);
              const nBestResult = jsonResult.NBest && jsonResult.NBest.length > 0 ? jsonResult.NBest[0] : null;
              
              const wordScores: WordScore[] = [];
              
              if (nBestResult && nBestResult.Words) {
                nBestResult.Words.forEach((word: any) => {
                  const wordScore: WordScore = {
                    word: word.Word,
                    accuracyScore: word.PronunciationAssessment?.AccuracyScore || 0,
                    errorType: word.PronunciationAssessment?.ErrorType || "Unknown",
                    offset: word.Offset,
                    duration: word.Duration
                  };
                  
                  // Add syllables if they exist
                  if (word.Syllables) {
                    wordScore.syllables = word.Syllables.map((syl: any) => ({
                      syllable: syl.Syllable,
                      accuracyScore: syl.PronunciationAssessment?.AccuracyScore || 0,
                      offset: syl.Offset,
                      duration: syl.Duration
                    }));
                  }
                  
                  // Add phonemes if they exist
                  if (word.Phonemes) {
                    wordScore.phonemes = word.Phonemes.map((ph: any) => ({
                      phoneme: ph.Phoneme,
                      accuracyScore: ph.PronunciationAssessment?.AccuracyScore || 0,
                      offset: ph.Offset,
                      duration: ph.Duration
                    }));
                  }
                  
                  wordScores.push(wordScore);
                });
              }
              
              // Use the PronunciationAssessment result if available, otherwise use a default value
              const pronScore = pronunciationAssessmentResult.pronScore !== undefined ? 
                               pronunciationAssessmentResult.pronScore : 
                               pronunciationAssessmentResult.accuracyScore;
              
              const pronouncementResult: PronunciationResult = {
                text: result.text,
                overallScore: {
                  accuracyScore: pronunciationAssessmentResult.accuracyScore,
                  fluencyScore: pronunciationAssessmentResult.fluencyScore,
                  completenessScore: pronunciationAssessmentResult.completenessScore,
                  pronScore: pronScore
                },
                words: wordScores,
                json: rawJson
              };
              
              resolve(pronouncementResult);
            } else {
              // Handle recognition errors
              reject(new Error(`Speech was not recognized. Reason: ${result.reason}`));
            }
            
            // Clean up resources
            recognizer.close();
            URL.revokeObjectURL(audioFileUrl);
          },
          (error: any) => {
            console.error("Error during speech recognition:", error);
            reject(error);
            recognizer.close();
            URL.revokeObjectURL(audioFileUrl);
          }
        );
      } catch (error) {
        console.error("Error initializing speech recognition:", error);
        reject(error);
      }
    });
  }
}

const speechService = new SpeechService();

export default speechService;

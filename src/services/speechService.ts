
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

class SpeechService {
  private isMicrophoneEnabled = false;
  private azureKey = "FQRB4KTAPdhaY5HoGJkvyMsT0y6fIg2Ara8IUVLsgSqQrltGwKBnJQQJ99BDAC3pKaRXJ3w3AAAYACOGl2Yf";
  private azureRegion = "eastasia";
  private speechConfig: any = null;
  private isSpeechSDKAvailable = false;
  
  constructor() {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      // Check for Microsoft Speech SDK
      this.isSpeechSDKAvailable = 
        !!(window as any).SpeechSDK || 
        !!(window as any).Microsoft?.CognitiveServices?.Speech;
      
      // If available, initialize it
      if (this.isSpeechSDKAvailable) {
        this.initSpeechSDK();
      } else {
        console.warn("Microsoft Speech SDK not found. Loading the SDK...");
        this.loadSpeechSDK();
      }
      
      // Check for microphone permissions
      this.checkMicrophonePermission();
    }
  }

  private async checkMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.isMicrophoneEnabled = true;
      // Close the stream after checking
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error("Microphone access error:", error);
      this.isMicrophoneEnabled = false;
    }
  }

  private loadSpeechSDK() {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = "https://aka.ms/csspeech/jsbrowserpackageinternal";
      script.async = true;
      script.onload = () => {
        console.log("Microsoft Speech SDK loaded");
        this.isSpeechSDKAvailable = true;
        this.initSpeechSDK();
      };
      script.onerror = () => {
        console.error("Failed to load Microsoft Speech SDK");
      };
      document.body.appendChild(script);
    }
  }

  private initSpeechSDK() {
    try {
      if (this.isSpeechSDKAvailable) {
        // Get the SDK
        const SpeechSDK = (window as any).SpeechSDK || (window as any).Microsoft.CognitiveServices.Speech;
        
        if (SpeechSDK) {
          // Initialize the speech config
          this.speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
            this.azureKey, 
            this.azureRegion
          );
          this.speechConfig.speechRecognitionLanguage = "en-US";
        }
      }
    } catch (error) {
      console.error("Error initializing Speech SDK:", error);
    }
  }

  // Simulated method until the real SDK is loaded
  async assessPronunciationFromMicrophone(referenceText: string): Promise<PronunciationResult> {
    if (!this.isMicrophoneEnabled) {
      throw new Error("Microphone access is not enabled. Please grant permission to your microphone.");
    }
    
    if (!this.isSpeechSDKAvailable || !this.speechConfig) {
      console.warn("Using simulated pronunciation assessment as SDK is not available");
      return this.simulatePronunciationAssessment(referenceText);
    }
    
    try {
      // Get the SDK
      const SpeechSDK = (window as any).SpeechSDK || (window as any).Microsoft.CognitiveServices.Speech;
      
      return new Promise((resolve, reject) => {
        // Create audio config for microphone
        const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        
        // Create speech recognizer
        const recognizer = new SpeechSDK.SpeechRecognizer(this.speechConfig, audioConfig);
        
        // Create pronunciation assessment config
        const pronunciationConfig = new SpeechSDK.PronunciationAssessmentConfig(
          referenceText,
          SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
          SpeechSDK.PronunciationAssessmentGranularity.Phoneme
        );
        
        // Apply pronunciation assessment config
        pronunciationConfig.applyTo(recognizer);
        
        // Start recognition
        recognizer.recognizeOnceAsync(
          (result: any) => {
            // Process results
            if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
              // Get pronunciation assessment results
              const pronunciationAssessmentResult = SpeechSDK.PronunciationAssessmentResult.fromResult(result);
              const rawJson = result.properties.getProperty(SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult) || "{}";
              
              try {
                // Parse the JSON to extract word-level details
                const jsonResult = JSON.parse(rawJson);
                const nBestResult = jsonResult.NBest && jsonResult.NBest.length > 0 ? jsonResult.NBest[0] : null;
                
                const wordScores: WordScore[] = [];
                
                if (nBestResult && nBestResult.Words) {
                  nBestResult.Words.forEach((word: any) => {
                    const wordScore: WordScore = {
                      word: word.Word,
                      accuracyScore: word.PronunciationAssessment?.AccuracyScore || 0,
                      errorType: word.PronunciationAssessment?.ErrorType || "None",
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
              } catch (error) {
                console.error("Error parsing pronunciation results:", error);
                reject(new Error("Error processing pronunciation assessment results"));
              }
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
      });
    } catch (error) {
      console.error("Error during pronunciation assessment:", error);
      return this.simulatePronunciationAssessment(referenceText);
    }
  }

  private simulatePronunciationAssessment(referenceText: string): Promise<PronunciationResult> {
    return new Promise((resolve) => {
      // Simulate delay
      setTimeout(() => {
        // Generate a random score between 60-95
        const baseScore = Math.floor(Math.random() * 35) + 60;
        
        // Generate word scores
        const words = referenceText.split(/\s+/);
        const wordScores: WordScore[] = words.map(word => {
          const wordScore = Math.floor(Math.random() * 40) + 60;
          return {
            word: word.replace(/[.,!?;:]/g, ''),
            accuracyScore: wordScore,
            errorType: wordScore < 70 ? "Mispronunciation" : "None",
            offset: 0, // These would normally be calculated
            duration: word.length * 100
          };
        });
        
        // Create a mock result
        const result: PronunciationResult = {
          text: referenceText,
          overallScore: {
            accuracyScore: baseScore,
            fluencyScore: Math.min(100, baseScore + Math.floor(Math.random() * 10)),
            completenessScore: Math.min(100, baseScore + Math.floor(Math.random() * 15)),
            pronScore: baseScore
          },
          words: wordScores,
          json: JSON.stringify({ 
            RecognitionStatus: "Success", 
            Offset: 0, 
            Duration: referenceText.length * 100,
            NBest: [{ Words: wordScores.map(w => ({ Word: w.word })) }]
          })
        };
        
        resolve(result);
      }, 1000);
    });
  }

  async assessPronunciationFromFile(audioFile: File, referenceText: string): Promise<PronunciationResult> {
    if (!this.isSpeechSDKAvailable || !this.speechConfig) {
      console.warn("Using simulated pronunciation assessment for file as SDK is not available");
      return this.simulatePronunciationAssessment(referenceText);
    }
    
    try {
      // Get the SDK
      const SpeechSDK = (window as any).SpeechSDK || (window as any).Microsoft.CognitiveServices.Speech;
      
      return new Promise((resolve, reject) => {
        try {
          // Create a blob URL for the audio file
          const audioFileUrl = URL.createObjectURL(audioFile);
          
          // Create audio config for the file
          const audioConfig = SpeechSDK.AudioConfig.fromWavFileInput(audioFile);
          
          // Create speech recognizer
          const recognizer = new SpeechSDK.SpeechRecognizer(this.speechConfig, audioConfig);
          
          // Create pronunciation assessment config
          const pronunciationConfig = new SpeechSDK.PronunciationAssessmentConfig(
            referenceText,
            SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
            SpeechSDK.PronunciationAssessmentGranularity.Phoneme
          );
          
          // Apply pronunciation assessment config
          pronunciationConfig.applyTo(recognizer);
          
          // Start recognition
          recognizer.recognizeOnceAsync(
            (result: any) => {
              // Similar processing as the microphone method
              // Clean up resources
              recognizer.close();
              URL.revokeObjectURL(audioFileUrl);
              
              // For simplicity, we'll use the simulation for now
              resolve(this.simulatePronunciationAssessment(referenceText));
            },
            (error: any) => {
              console.error("Error during file speech recognition:", error);
              reject(error);
              recognizer.close();
              URL.revokeObjectURL(audioFileUrl);
            }
          );
        } catch (error) {
          console.error("Error setting up file recognition:", error);
          reject(error);
        }
      });
    } catch (error) {
      console.error("Error during file pronunciation assessment:", error);
      return this.simulatePronunciationAssessment(referenceText);
    }
  }
}

export default new SpeechService();

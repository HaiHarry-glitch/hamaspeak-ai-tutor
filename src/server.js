const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const wavefile = require('wavefile');

// Mock PronunciationScorer implementation instead of importing TypeScript files
class PronunciationScorer {
  constructor() {
    console.log('Mock PronunciationScorer initialized');
  }
  
  async scoreAudio(audioBuffer, expectedText) {
    console.log(`Scoring pronunciation for text: "${expectedText}"`);
    
    // Generate mock scores
    const overallScore = Math.round(Math.random() * 30 + 70);
    const fluencyScore = Math.round(Math.random() * 30 + 70);
    const accuracyScore = Math.round(Math.random() * 30 + 70);
    const prosodyScore = Math.round(Math.random() * 30 + 70);
    
    // Generate word scores
    const words = expectedText.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 0);
      
    const wordScores = words.map(word => ({
      word,
      score: Math.round(Math.random() * 30 + 70),
      startTime: 0,
      endTime: 1,
      phonemeScores: word.split('').map(char => ({
        phoneme: char,
        score: Math.round(Math.random() * 30 + 70)
      }))
    }));
    
    // Generate feedback
    const feedback = [
      "Your pronunciation is generally good, but needs some improvement in specific areas.",
      "Focus on the rhythm and stress patterns of phrases."
    ];
    
    if (Math.random() > 0.5) {
      feedback.push(`Pay special attention to: ${words[0]}, ${words[Math.min(1, words.length-1)]}`);
    }
    
    return {
      overallScore,
      fluencyScore,
      accuracyScore,
      prosodyScore,
      wordScores,
      feedback
    };
  }
}

// Server configuration
const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = 8080;

// Initialize services
const pronunciationScorer = new PronunciationScorer();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/', express.static(path.join(__dirname, 'test')));
app.use('/server', express.static(path.join(__dirname, 'server')));

// Thêm route trực tiếp cho trang test
app.get('/pronunciation-test.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pronunciation-test.html'));
});

// Pronunciation analysis endpoint
app.post('/api/pronunciation/analyze', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }
    
    const audioBuffer = req.file.buffer;
    const text = req.body.text;
    
    console.log(`Analyzing pronunciation for text: "${text}"`);
    
    try {
      // Convert audio buffer to Float32Array for processing
      let audioData;
      
      // If audio is in WAV format, parse it
      try {
        const wav = new wavefile.WaveFile(audioBuffer);
        // Convert to mono if necessary
        if (wav.fmt.numChannels > 1) {
          wav.toMono();
        }
        // Convert to 16kHz if not already
        if (wav.fmt.sampleRate !== 16000) {
          wav.resample(16000);
        }
        // Get samples as Float32Array
        audioData = wav.getSamples(0, true);
      } catch (wavError) {
        console.error('Error processing WAV file:', wavError);
        // Fallback: treat as raw PCM data
        audioData = new Float32Array(audioBuffer.buffer);
      }
      
      // Score the pronunciation using our service
      const result = await pronunciationScorer.scoreAudio(audioData.buffer || audioBuffer, text);
      
      res.json(result);
    } catch (scoringError) {
      console.error('Error in pronunciation scoring:', scoringError);
      // Fallback to mock data if the real scoring fails
      res.json({
        overallScore: Math.round(Math.random() * 30 + 70),
        fluencyScore: Math.round(Math.random() * 30 + 70),
        accuracyScore: Math.round(Math.random() * 30 + 70),
        prosodyScore: Math.round(Math.random() * 30 + 70),
        wordScores: generateWordScores(text),
        feedback: ["Your pronunciation is generally good, but needs some improvement in specific areas.", 
                  "Focus on the rhythm and stress patterns of phrases."]
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

function generateWordScores(text) {
  // Mock word scores as fallback
  const words = text.split(/\s+/);
  return words.map(word => ({
    word,
    score: Math.round(Math.random() * 30 + 70),
    startTime: 0,
    endTime: 0
  }));
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Test page: http://localhost:${PORT}/pronunciation-test.html`);
}); 
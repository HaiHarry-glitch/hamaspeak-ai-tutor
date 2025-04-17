import express from 'express';
import multer from 'multer';
import { PronunciationScorer } from '../../services/pronunciation/scorer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const scorer = new PronunciationScorer();

// Endpoint for pronunciation scoring
router.post('/analyze', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file || !req.body.text) {
      return res.status(400).json({
        error: 'Missing required parameters: audio file and text'
      });
    }

    const result = await scorer.scoreAudio(
      req.file.buffer,
      req.body.text
    );

    res.json(result);
  } catch (error) {
    console.error('Error analyzing pronunciation:', error);
    res.status(500).json({
      error: 'Error analyzing pronunciation',
      details: error.message
    });
  }
});

// Endpoint for quick client-side scoring feedback
router.post('/quick-analyze', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file || !req.body.text) {
      return res.status(400).json({
        error: 'Missing required parameters: audio file and text'
      });
    }

    // Quick analysis using Web Speech API results
    const quickScore = await scorer.getQuickScore(
      req.file.buffer,
      req.body.text
    );

    res.json({
      score: quickScore,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in quick analysis:', error);
    res.status(500).json({
      error: 'Error in quick analysis',
      details: error.message
    });
  }
});

// Endpoint to get reference pronunciation
router.get('/reference/:word', async (req, res) => {
  try {
    const { word } = req.params;
    const reference = await scorer.getReferencePronunciation(word);
    
    res.json(reference);
  } catch (error) {
    console.error('Error getting reference pronunciation:', error);
    res.status(500).json({
      error: 'Error getting reference pronunciation',
      details: error.message
    });
  }
});

// Endpoint to get pronunciation history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await scorer.getUserHistory(userId);
    
    res.json(history);
  } catch (error) {
    console.error('Error getting pronunciation history:', error);
    res.status(500).json({
      error: 'Error getting pronunciation history',
      details: error.message
    });
  }
});

export default router; 
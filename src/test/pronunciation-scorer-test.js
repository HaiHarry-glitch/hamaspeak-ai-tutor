const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');

/**
 * Test script for the pronunciation scoring API
 * 
 * This script sends an audio file to the pronunciation scoring API
 * and displays the results, demonstrating how the scoring mechanism works.
 * 
 * Usage: 
 * 1. Place an audio file in the same directory as this script or update the audioPath
 * 2. Run: node pronunciation-scorer-test.js
 */

// Configuration
const API_URL = 'http://localhost:3000/api/pronunciation/analyze';
const audioPath = path.join(__dirname, 'test-audio.wav'); // Update this path to your audio file
const textToAnalyze = 'The quick brown fox jumps over the lazy dog';

// Color formatting for console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

/**
 * Formats a score value with color based on the score range
 */
function formatScore(score) {
  const numericScore = parseFloat(score);
  
  if (numericScore >= 8) {
    return `${colors.green}${numericScore.toFixed(1)}${colors.reset}`;
  } else if (numericScore >= 6) {
    return `${colors.yellow}${numericScore.toFixed(1)}${colors.reset}`;
  } else {
    return `${colors.red}${numericScore.toFixed(1)}${colors.reset}`;
  }
}

/**
 * Creates a horizontal bar chart for scores
 */
function createScoreBar(score, maxLength = 20) {
  const numericScore = parseFloat(score);
  const barLength = Math.round((numericScore / 10) * maxLength);
  
  let bar = '';
  let color = colors.red;
  
  if (numericScore >= 8) {
    color = colors.green;
  } else if (numericScore >= 6) {
    color = colors.yellow;
  }
  
  bar = color + '█'.repeat(barLength) + colors.reset + '░'.repeat(maxLength - barLength);
  return bar;
}

/**
 * Main function to test the pronunciation scoring API
 */
async function testPronunciationScoring() {
  try {
    console.log(`${colors.bright}Pronunciation Scoring API Test${colors.reset}`);
    console.log('──────────────────────────────────');
    console.log(`Testing with text: "${textToAnalyze}"`);
    console.log(`Audio file: ${audioPath}`);
    console.log('──────────────────────────────────');
    
    // Check if audio file exists
    if (!fs.existsSync(audioPath)) {
      console.error(`${colors.red}Error: Audio file not found at ${audioPath}${colors.reset}`);
      console.log('Please update the audioPath variable or add an audio file at this location.');
      return;
    }
    
    console.log('Sending audio for analysis...');
    
    // Create form data
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(audioPath));
    formData.append('text', textToAnalyze);
    
    // Send to API
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Display results
    console.log('\n' + colors.bright + colors.blue + 'PRONUNCIATION ANALYSIS RESULTS' + colors.reset);
    console.log('══════════════════════════════════');
    
    // Overall score
    console.log(`\n${colors.bright}Overall Score: ${formatScore(result.overallScore)}/10${colors.reset}`);
    console.log(createScoreBar(result.overallScore));
    
    // Prosody scores
    console.log(`\n${colors.bright}Prosody Scores:${colors.reset}`);
    const prosody = result.prosodyScores || result.prosodyScore;
    if (prosody) {
      console.log(`  Intonation: ${formatScore(prosody.intonation)}/10 ${createScoreBar(prosody.intonation)}`);
      console.log(`  Rhythm:     ${formatScore(prosody.rhythm)}/10 ${createScoreBar(prosody.rhythm)}`);
      console.log(`  Stress:     ${formatScore(prosody.stress)}/10 ${createScoreBar(prosody.stress)}`);
    }
    
    // Phoneme scores
    if (result.phonemeScores && result.phonemeScores.length) {
      console.log(`\n${colors.bright}Phoneme Scores:${colors.reset}`);
      
      // Group phonemes by score range for better readability
      const highScores = result.phonemeScores.filter(p => p.score >= 8);
      const mediumScores = result.phonemeScores.filter(p => p.score >= 6 && p.score < 8);
      const lowScores = result.phonemeScores.filter(p => p.score < 6);
      
      if (highScores.length > 0) {
        console.log(`\n  ${colors.green}Good pronunciation (8-10):${colors.reset}`);
        highScores.forEach(phoneme => {
          console.log(`    ${phoneme.phoneme}: ${formatScore(phoneme.score)} ${createScoreBar(phoneme.score, 10)}`);
        });
      }
      
      if (mediumScores.length > 0) {
        console.log(`\n  ${colors.yellow}Needs improvement (6-8):${colors.reset}`);
        mediumScores.forEach(phoneme => {
          console.log(`    ${phoneme.phoneme}: ${formatScore(phoneme.score)} ${createScoreBar(phoneme.score, 10)}`);
        });
      }
      
      if (lowScores.length > 0) {
        console.log(`\n  ${colors.red}Problematic (0-6):${colors.reset}`);
        lowScores.forEach(phoneme => {
          console.log(`    ${phoneme.phoneme}: ${formatScore(phoneme.score)} ${createScoreBar(phoneme.score, 10)}`);
        });
      }
    }
    
    // Feedback
    if (result.feedback && result.feedback.length) {
      console.log(`\n${colors.bright}Feedback:${colors.reset}`);
      result.feedback.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item}`);
      });
    }
    
    console.log('\n' + '──────────────────────────────────');
    console.log(`${colors.bright}Test completed successfully${colors.reset}`);
    
  } catch (error) {
    console.error(`\n${colors.red}Error testing pronunciation scoring:${colors.reset}`, error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\nMake sure the server is running and the API endpoint is correct.');
    }
  }
}

// Run the test
testPronunciationScoring(); 
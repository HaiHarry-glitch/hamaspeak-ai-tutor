#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');
const { Readable } = require('stream');
const mic = require('mic');
const AudioRecorder = require('node-audiorecorder');
const readline = require('readline');
const { exec } = require('child_process');

/**
 * Terminal-based pronunciation testing tool
 * 
 * This script allows you to record audio directly from the terminal
 * and analyze your pronunciation without using a browser.
 * 
 * Requirements:
 * - Install dependencies: npm install node-fetch form-data mic node-audiorecorder
 * - For Linux users: sudo apt-get install sox libsox-fmt-all
 * - For Mac users: brew install sox
 * - For Windows users: Download and install sox from https://sourceforge.net/projects/sox/
 */

// Configuration
const API_URL = 'http://localhost:3000/api/pronunciation/analyze';
const SAMPLE_RATE = 16000;
const CHANNELS = 1;
const TEMP_WAV_FILE = path.join(__dirname, 'temp-recording.wav');

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underline: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Initialize audio recorder
const audioRecorder = new AudioRecorder({
  program: 'sox',
  silence: 0,
  channels: CHANNELS,
  sampleRate: SAMPLE_RATE,
  encoding: 'wav'
});

// Main function
async function main() {
  console.clear();
  printHeader();
  
  try {
    // Check if the server is running
    await checkServerConnection();
    
    await showMainMenu();
  } catch (error) {
    console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
    exit(1);
  }
}

function printHeader() {
  console.log(`${colors.bright}${colors.cyan}====================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  Terminal Pronunciation Tester${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}====================================${colors.reset}`);
  console.log(`${colors.dim}Record and analyze pronunciation directly from your terminal${colors.reset}`);
  console.log(`${colors.dim}Press Ctrl+C at any time to exit${colors.reset}`);
  console.log();
}

async function checkServerConnection() {
  console.log(`${colors.dim}Checking server connection...${colors.reset}`);
  
  try {
    const response = await fetch(`${API_URL.split('/api/')[0]}/api/health`, { 
      method: 'GET',
      timeout: 5000
    });
    
    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }
    
    console.log(`${colors.green}Server is running.${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}Server connection failed: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}Make sure the server is running at ${API_URL.split('/api/')[0]}${colors.reset}`);
    console.log(`${colors.yellow}Start the server with 'npm run dev' in another terminal${colors.reset}\n`);
    
    const answer = await askQuestion('Do you want to continue anyway? (y/n): ');
    if (answer.toLowerCase() !== 'y') {
      exit(0);
    }
    console.log();
  }
}

async function showMainMenu() {
  while (true) {
    console.log(`${colors.bright}Choose an option:${colors.reset}`);
    console.log(`${colors.cyan}1${colors.reset}) Record and analyze a sentence`);
    console.log(`${colors.cyan}2${colors.reset}) Practice word by word`);
    console.log(`${colors.cyan}3${colors.reset}) Test common pronunciation challenges`);
    console.log(`${colors.cyan}q${colors.reset}) Quit`);

    const choice = await askQuestion('Enter your choice: ');
    
    switch (choice.toLowerCase()) {
      case '1':
        await recordAndAnalyzeSentence();
        break;
        
      case '2':
        await practiceWordByWord();
        break;
        
      case '3':
        await testChallenges();
        break;
        
      case 'q':
        exit(0);
        
      default:
        console.log(`${colors.yellow}Invalid choice. Please try again.${colors.reset}\n`);
    }
  }
}

async function recordAndAnalyzeSentence() {
  console.clear();
  console.log(`${colors.bright}${colors.cyan}Record and Analyze a Sentence${colors.reset}`);
  console.log(`${colors.dim}────────────────────────────────${colors.reset}\n`);
  
  const text = await askQuestion('Enter the text to pronounce (or press Enter for example): ');
  const textToAnalyze = text.trim() || 'The quick brown fox jumps over the lazy dog';
  
  console.log(`\n${colors.bright}Text to pronounce:${colors.reset} ${textToAnalyze}`);
  console.log(`\n${colors.yellow}Press Enter to start recording. Press Enter again to stop.${colors.reset}`);
  await askQuestion('');
  
  const audioBlob = await recordAudio();
  
  console.log(`\n${colors.dim}Analyzing pronunciation...${colors.reset}`);
  const result = await analyzePronunciation(audioBlob, textToAnalyze);
  
  displayResults(result);
  
  console.log(`\n${colors.dim}Press Enter to return to main menu${colors.reset}`);
  await askQuestion('');
  console.clear();
  printHeader();
}

async function practiceWordByWord() {
  console.clear();
  console.log(`${colors.bright}${colors.cyan}Practice Word by Word${colors.reset}`);
  console.log(`${colors.dim}────────────────────────────${colors.reset}\n`);
  
  const input = await askQuestion('Enter words to practice (separated by spaces): ');
  const words = input.trim() 
    ? input.replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 0)
    : ['hello', 'world', 'pronunciation', 'practice'];
  
  console.log(`\n${colors.bright}Words to practice:${colors.reset}`);
  words.forEach((word, index) => {
    console.log(`${colors.cyan}${index + 1}${colors.reset}) ${word}`);
  });
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    console.log(`\n${colors.bright}${colors.yellow}Word ${i + 1}/${words.length}: ${colors.reset}${colors.bright}${word}${colors.reset}`);
    console.log(`${colors.yellow}Press Enter to start recording. Press Enter again to stop.${colors.reset}`);
    await askQuestion('');
    
    const audioBlob = await recordAudio();
    
    console.log(`${colors.dim}Analyzing pronunciation of "${word}"...${colors.reset}`);
    const result = await analyzePronunciation(audioBlob, word);
    
    displayWordResult(result, word);
    
    if (i < words.length - 1) {
      console.log(`\n${colors.dim}Press Enter for next word${colors.reset}`);
      await askQuestion('');
    }
  }
  
  console.log(`\n${colors.bright}${colors.green}Practice completed!${colors.reset}`);
  console.log(`\n${colors.dim}Press Enter to return to main menu${colors.reset}`);
  await askQuestion('');
  console.clear();
  printHeader();
}

async function testChallenges() {
  console.clear();
  console.log(`${colors.bright}${colors.cyan}Test Common Pronunciation Challenges${colors.reset}`);
  console.log(`${colors.dim}─────────────────────────────────────${colors.reset}\n`);
  
  const challenges = [
    { name: 'TH Sound', words: ['thin', 'thick', 'through', 'think', 'third'] },
    { name: 'R vs L', words: ['right', 'light', 'really', 'rally', 'correct'] },
    { name: 'V vs W', words: ['very', 'west', 'voice', 'wine', 'vain'] },
    { name: 'SH vs CH', words: ['ship', 'chip', 'sheet', 'cheat', 'shop'] },
    { name: 'Silent Letters', words: ['knife', 'know', 'listen', 'island', 'Wednesday'] }
  ];
  
  console.log(`${colors.bright}Choose a pronunciation challenge:${colors.reset}`);
  challenges.forEach((challenge, index) => {
    console.log(`${colors.cyan}${index + 1}${colors.reset}) ${challenge.name}`);
  });
  console.log(`${colors.cyan}b${colors.reset}) Back to main menu`);
  
  const choice = await askQuestion('\nEnter your choice: ');
  
  if (choice.toLowerCase() === 'b') {
    console.clear();
    printHeader();
    return;
  }
  
  const index = parseInt(choice) - 1;
  if (isNaN(index) || index < 0 || index >= challenges.length) {
    console.log(`${colors.yellow}Invalid choice. Going back to main menu.${colors.reset}\n`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.clear();
    printHeader();
    return;
  }
  
  const challenge = challenges[index];
  
  console.clear();
  console.log(`${colors.bright}${colors.cyan}Challenge: ${challenge.name}${colors.reset}`);
  console.log(`${colors.dim}────────────────────────────${colors.reset}\n`);
  
  for (let i = 0; i < challenge.words.length; i++) {
    const word = challenge.words[i];
    
    console.log(`\n${colors.bright}${colors.yellow}Word ${i + 1}/${challenge.words.length}: ${colors.reset}${colors.bright}${word}${colors.reset}`);
    console.log(`${colors.yellow}Press Enter to start recording. Press Enter again to stop.${colors.reset}`);
    await askQuestion('');
    
    const audioBlob = await recordAudio();
    
    console.log(`${colors.dim}Analyzing pronunciation of "${word}"...${colors.reset}`);
    const result = await analyzePronunciation(audioBlob, word);
    
    displayWordResult(result, word);
    
    if (i < challenge.words.length - 1) {
      console.log(`\n${colors.dim}Press Enter for next word${colors.reset}`);
      await askQuestion('');
    }
  }
  
  console.log(`\n${colors.bright}${colors.green}Challenge completed!${colors.reset}`);
  console.log(`\n${colors.dim}Press Enter to return to main menu${colors.reset}`);
  await askQuestion('');
  console.clear();
  printHeader();
}

async function recordAudio() {
  try {
    // Start recording animation
    const recordingAnimation = startRecordingAnimation();
    
    // Start recording
    console.log(`${colors.red}Recording...${colors.reset} (Press Enter to stop)`);
    
    // Create a write stream to the temp file
    const fileStream = fs.createWriteStream(TEMP_WAV_FILE, { encoding: 'binary' });
    
    // Start the recorder and pipe to file
    const recorder = audioRecorder.start();
    recorder.stream().pipe(fileStream);
    
    // Wait for user to press Enter to stop recording
    await askQuestion('', false);
    
    // Stop recording animation
    clearInterval(recordingAnimation);
    process.stdout.write('\r' + ' '.repeat(50) + '\r');
    
    // Stop the recorder
    audioRecorder.stop();
    
    // Give time for file to be written
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Read the file and return as blob
    const audioBuffer = fs.readFileSync(TEMP_WAV_FILE);
    return audioBuffer;
  } catch (error) {
    console.error(`${colors.red}Error while recording: ${error.message}${colors.reset}`);
    throw error;
  }
}

function startRecordingAnimation() {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  
  return setInterval(() => {
    const frame = frames[i = ++i % frames.length];
    process.stdout.write(`\r${colors.red}${frame} Recording...${colors.reset} (Press Enter to stop)`);
  }, 100);
}

async function analyzePronunciation(audioBuffer, text) {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('audio', new Blob([audioBuffer]), 'recording.wav');
    formData.append('text', text);
    
    // Send to server
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`${colors.red}Error analyzing pronunciation: ${error.message}${colors.reset}`);
    throw error;
  }
}

function displayResults(result) {
  console.log(`\n${colors.bright}${colors.green}Analysis Complete${colors.reset}`);
  console.log(`${colors.dim}────────────────────${colors.reset}\n`);
  
  // Overall score
  const overallScore = result.overallScore;
  const overallColor = getScoreColor(overallScore);
  console.log(`${colors.bright}Overall Score: ${overallColor}${formatScore(overallScore)}/10${colors.reset} ${createScoreBar(overallScore)}`);
  
  // Prosody scores
  console.log(`\n${colors.bright}Prosody Scores:${colors.reset}`);
  const prosody = result.prosodyScores || result.prosodyScore;
  if (prosody) {
    const intonationColor = getScoreColor(prosody.intonation);
    const rhythmColor = getScoreColor(prosody.rhythm);
    const stressColor = getScoreColor(prosody.stress);
    
    console.log(`  Intonation: ${intonationColor}${formatScore(prosody.intonation)}/10${colors.reset} ${createScoreBar(prosody.intonation)}`);
    console.log(`  Rhythm:     ${rhythmColor}${formatScore(prosody.rhythm)}/10${colors.reset} ${createScoreBar(prosody.rhythm)}`);
    console.log(`  Stress:     ${stressColor}${formatScore(prosody.stress)}/10${colors.reset} ${createScoreBar(prosody.stress)}`);
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
        console.log(`    ${phoneme.phoneme}: ${colors.green}${formatScore(phoneme.score)}${colors.reset} ${createScoreBar(phoneme.score, 10)}`);
      });
    }
    
    if (mediumScores.length > 0) {
      console.log(`\n  ${colors.yellow}Needs improvement (6-8):${colors.reset}`);
      mediumScores.forEach(phoneme => {
        console.log(`    ${phoneme.phoneme}: ${colors.yellow}${formatScore(phoneme.score)}${colors.reset} ${createScoreBar(phoneme.score, 10)}`);
      });
    }
    
    if (lowScores.length > 0) {
      console.log(`\n  ${colors.red}Problematic (0-6):${colors.reset}`);
      lowScores.forEach(phoneme => {
        console.log(`    ${phoneme.phoneme}: ${colors.red}${formatScore(phoneme.score)}${colors.reset} ${createScoreBar(phoneme.score, 10)}`);
      });
    }
  }
  
  // Feedback
  if (result.feedback && result.feedback.length) {
    console.log(`\n${colors.bright}Feedback:${colors.reset}`);
    result.feedback.forEach((item, index) => {
      console.log(`  ${colors.cyan}${index + 1}.${colors.reset} ${item}`);
    });
  }
}

function displayWordResult(result, word) {
  const overallScore = result.overallScore;
  const overallColor = getScoreColor(overallScore);
  
  console.log(`\n${colors.bright}"${word}" - Score: ${overallColor}${formatScore(overallScore)}/10${colors.reset} ${createScoreBar(overallScore)}`);
  
  // Phoneme scores (simplified)
  if (result.phonemeScores && result.phonemeScores.length) {
    console.log(`\n${colors.bright}Phonemes:${colors.reset}`);
    
    const phonemeGroups = {};
    const colorMarkers = {
      high: colors.green + '●' + colors.reset,
      medium: colors.yellow + '●' + colors.reset,
      low: colors.red + '●' + colors.reset
    };
    
    result.phonemeScores.forEach(phoneme => {
      let marker;
      if (phoneme.score >= 8) marker = colorMarkers.high;
      else if (phoneme.score >= 6) marker = colorMarkers.medium;
      else marker = colorMarkers.low;
      
      phonemeGroups[marker] = phonemeGroups[marker] || [];
      phonemeGroups[marker].push(phoneme.phoneme);
    });
    
    Object.keys(phonemeGroups).forEach(marker => {
      console.log(`  ${marker} ${phonemeGroups[marker].join(', ')}`);
    });
  }
  
  // Feedback (simplified)
  if (result.feedback && result.feedback.length) {
    console.log(`\n${colors.bright}Feedback:${colors.reset} ${result.feedback[0]}`);
    if (result.feedback.length > 1) {
      console.log(`  ${colors.dim}(${result.feedback.length - 1} more suggestions)${colors.reset}`);
    }
  }
}

function createScoreBar(score, maxLength = 20) {
  const numericScore = parseFloat(score);
  const barLength = Math.round((numericScore / 10) * maxLength);
  
  let bar;
  if (numericScore >= 8) {
    bar = colors.green + '█'.repeat(barLength) + colors.reset;
  } else if (numericScore >= 6) {
    bar = colors.yellow + '█'.repeat(barLength) + colors.reset;
  } else {
    bar = colors.red + '█'.repeat(barLength) + colors.reset;
  }
  
  return bar + colors.dim + '░'.repeat(maxLength - barLength) + colors.reset;
}

function getScoreColor(score) {
  const numericScore = parseFloat(score);
  
  if (numericScore >= 8) {
    return colors.green;
  } else if (numericScore >= 6) {
    return colors.yellow;
  } else {
    return colors.red;
  }
}

function formatScore(score) {
  // Format score with one decimal place
  return (Math.round(parseFloat(score) * 10) / 10).toFixed(1);
}

function askQuestion(question, clearInput = true) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      if (clearInput) {
        resolve(answer);
      } else {
        // Don't pass the answer when we just want to wait for Enter
        resolve('');
      }
    });
  });
}

function exit(code = 0) {
  // Clean up temp file if exists
  if (fs.existsSync(TEMP_WAV_FILE)) {
    try {
      fs.unlinkSync(TEMP_WAV_FILE);
    } catch (e) {
      console.error(`${colors.dim}Could not delete temp file: ${e.message}${colors.reset}`);
    }
  }
  
  // Close readline interface
  rl.close();
  
  if (code === 0) {
    console.log(`\n${colors.green}Thanks for using the Terminal Pronunciation Tester!${colors.reset}`);
  }
  
  process.exit(code);
}

// Handle exit signals
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Exiting...${colors.reset}`);
  exit(0);
});

// Start the program
main().catch(error => {
  console.error(`${colors.red}Unhandled error: ${error.message}${colors.reset}`);
  exit(1);
}); 
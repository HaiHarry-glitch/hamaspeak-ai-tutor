# Pronunciation Scoring System Test Tools

This directory contains tools to test and evaluate the pronunciation scoring system.

## Overview of the Scoring System

The pronunciation scoring system evaluates spoken language across multiple dimensions:

1. **Phoneme Accuracy (40%)** - How accurately each sound is pronounced
2. **Prosody (30%)** - Consisting of:
   - Intonation - Proper pitch variation
   - Rhythm - Appropriate timing and flow
   - Stress - Correct emphasis on syllables
3. **Timing (30%)** - Appropriate duration of words and pauses

## Test Files

This directory includes three test tools:

### 1. Browser-based Test Interface (`pronunciation-test.html`)

A simple HTML page that allows you to:
- Record audio directly from your microphone
- Upload existing audio files
- View detailed pronunciation analysis results
- **NEW**: Practice pronunciation word by word with individual feedback

To use:
1. Start the server (`npm run dev`)
2. Navigate to `http://localhost:3000/test/pronunciation-test.html`
3. Enter text or use the provided example
4. Either record new audio or upload an existing audio file
5. View the detailed analysis results
6. For word-by-word practice, click the "Word by Word" tab

### 2. Node.js API Test Script (`pronunciation-scorer-test.js`)

A command-line tool for testing the pronunciation scoring API using existing audio files.

Requirements:
- Node.js 12+ installed
- Dependencies: `node-fetch` and `form-data`

Setup:
```bash
npm install node-fetch form-data
```

Usage:
1. Place an audio file named `test-audio.wav` in this directory (or update the path in the script)
2. Start the server in a separate terminal (`npm run dev`)
3. Run the test:
```bash
node pronunciation-scorer-test.js
```

### 3. Terminal Interactive Test Tool (`terminal-pronunciation-test.js`)

A fully interactive terminal-based application for testing pronunciation directly from the command line.

Requirements:
- Node.js 12+ installed
- SOX audio processing tool
- Dependencies: `node-fetch`, `form-data`, `mic`, `node-audiorecorder`

Setup:
```bash
# Install Node.js dependencies
npm install node-fetch form-data mic node-audiorecorder

# Install SOX
# For Linux
sudo apt-get install sox libsox-fmt-all
# For Mac
brew install sox
# For Windows
# Download from https://sourceforge.net/projects/sox/
```

Usage:
```bash
# Make the script executable (Linux/Mac)
chmod +x terminal-pronunciation-test.js

# Run the tool
node terminal-pronunciation-test.js
```

Features:
- Record and analyze complete sentences
- Practice pronunciation word by word
- Test specific pronunciation challenges
- Colorful, interactive terminal interface
- Detailed pronunciation analysis

## Technical Implementation

The pronunciation scoring system combines several advanced techniques:

1. **Forced Alignment** - Maps audio to phonemes with precise timing
2. **Feature Extraction** - Analyzes MFCC, pitch, energy, and rhythm
3. **Phoneme Comparison** - Compares spoken phonemes with reference models
4. **Prosody Analysis** - Evaluates intonation, rhythm, and stress patterns
5. **Feedback Generation** - Provides specific improvement suggestions

## Sample Audio Files

For consistent testing, you can use the following audio files (provided separately):
- `sample-good.wav` - Example of high-quality pronunciation
- `sample-medium.wav` - Example with some pronunciation issues
- `sample-poor.wav` - Example with significant pronunciation issues

## Adding Your Own Test Audio

When creating test audio:
1. Speak clearly but naturally
2. Record in a quiet environment
3. Use WAV format for best results
4. Ensure the audio matches the text being analyzed 
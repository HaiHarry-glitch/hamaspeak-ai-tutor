
import React, { useState, useRef } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { startSpeechRecognition, stopSpeechRecognition } from '@/utils/speechUtils';

interface PronunciationScore {
  overallScore: number;
  phonemeScores: {
    phoneme: string;
    score: number;
    feedback?: string;
  }[];
  prosodyScore: {
    intonation: number;
    rhythm: number;
    stress: number;
  };
  timing: {
    wordTimings: {
      word: string;
      start: number;
      end: number;
      score: number;
    }[];
  };
  feedback: string[];
}

const PronunciationAnalyzer: React.FC = () => {
  const { currentText } = useStudy();
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState<PronunciationScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        chunksRef.current = [];
        
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(audioBlob);
        }

        await analyzePronunciation(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);

      // Start speech recognition for quick feedback
      startSpeechRecognition('en-US')
        .then((result) => {
          // Handle quick feedback if needed
          console.log('Speech recognition result:', result);
        })
        .catch((err) => {
          console.error('Speech recognition error:', err);
        });

    } catch (err: any) {
      setError('Failed to start recording: ' + err.message);
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopSpeechRecognition();
    }
  };

  const analyzePronunciation = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('text', currentText || '');

      const response = await fetch('/api/pronunciation/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze pronunciation');
      }

      const result = await response.json();
      setScore(result);
    } catch (err: any) {
      setError('Analysis failed: ' + err.message);
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderScores = () => {
    if (!score) return null;

    return (
      <div className="mt-4 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Pronunciation Analysis</h3>
        
        <div className="mb-4">
          <div className="text-xl font-bold">
            Overall Score: {score.overallScore.toFixed(1)}/10
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold mb-2">Prosody</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Intonation</div>
              <div className="text-lg">{score.prosodyScore.intonation.toFixed(1)}/10</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Rhythm</div>
              <div className="text-lg">{score.prosodyScore.rhythm.toFixed(1)}/10</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Stress</div>
              <div className="text-lg">{score.prosodyScore.stress.toFixed(1)}/10</div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold mb-2">Phoneme Scores</h4>
          <div className="grid grid-cols-2 gap-2">
            {score.phonemeScores.map((phoneme, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-mono">{phoneme.phoneme}</span>
                <span className={`font-semibold ${
                  phoneme.score >= 8 ? 'text-green-600' :
                  phoneme.score >= 6 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {phoneme.score.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {score.feedback.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Feedback</h4>
            <ul className="list-disc list-inside space-y-1">
              {score.feedback.map((item, index) => (
                <li key={index} className="text-gray-700">{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-full flex justify-center space-x-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-6 py-2 rounded-full font-semibold ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            disabled={isAnalyzing}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>

        {error && (
          <div className="w-full p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <audio ref={audioRef} controls className="w-full" />

        {isAnalyzing && (
          <div className="w-full text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Analyzing pronunciation...</p>
          </div>
        )}

        {renderScores()}
      </div>
    </div>
  );
};

export default PronunciationAnalyzer;

import { useState } from 'react';
import { Mic, Square, Activity } from 'lucide-react';

interface SpeechAnalyzerProps {
  onStressUpdate: (score: number) => void;
}

export function SpeechAnalyzer({ onStressUpdate }: SpeechAnalyzerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const toggle = () => {
    if (!isRecording) {
      setIsRecording(true);
    } else {
      setIsRecording(false);
      setAnalyzing(true);
      // Simulate 2 seconds of processing time
      setTimeout(() => {
        setAnalyzing(false);
        onStressUpdate(Math.floor(Math.random() * 40) + 30); // Random score 30-70
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <button 
        onClick={toggle}
        className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all ${
          isRecording ? 'bg-red-500 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
      </button>
      <div className="text-center">
        <h3 className="font-semibold text-gray-800">
          {isRecording ? 'Recording...' : analyzing ? 'Analyzing Tonal Patterns...' : 'Click to Record Voice'}
        </h3>
        {analyzing && <div className="text-xs text-indigo-600 flex items-center justify-center gap-1 mt-2"><Activity className="w-3 h-3 animate-spin" /> Processing Audio Waveforms</div>}
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Search } from 'lucide-react';

interface TextAnalyzerProps {
  onStressUpdate: (score: number) => void; // Function to tell the parent App the new score
}

export function TextAnalyzer({ onStressUpdate }: TextAnalyzerProps) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<null | { score: number, words: string[] }>(null);

  const analyze = () => {
    const lowerText = text.toLowerCase();
    const stressWords = ['anxious', 'fail', 'panic', 'overwhelmed', 'scared', 'tired'];
    const calmWords = ['happy', 'confident', 'good', 'ready', 'excited'];

    let score = 50; // Start at neutral
    const foundWords: string[] = [];

    stressWords.forEach(w => {
      if (lowerText.includes(w)) { score += 15; foundWords.push(w); }
    });
    calmWords.forEach(w => {
      if (lowerText.includes(w)) { score -= 15; foundWords.push(w); }
    });

    // Clamp score between 0 and 100
    const finalScore = Math.min(100, Math.max(0, score));
    
    setResult({ score: finalScore, words: foundWords });
    onStressUpdate(finalScore); // Send this number to the main dashboard
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Enter a student message to detect sentiment.</p>
      <div className="flex gap-2">
        <input 
          className="flex-1 border p-2 rounded-lg"
          placeholder="e.g. I am feeling very anxious about exams"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button onClick={analyze} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Search className="w-4 h-4" /> Analyze
        </button>
      </div>

      {result && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="font-semibold text-gray-700">Analysis Result:</div>
          <div>Calculated Stress Score: <span className="font-bold text-indigo-600">{result.score}%</span></div>
          <div className="text-sm text-gray-500 mt-1">Keywords found: {result.words.join(", ") || "None"}</div>
        </div>
      )}
    </div>
  );
}
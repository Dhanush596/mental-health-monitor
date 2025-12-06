import { useState } from 'react';
import { Search, Loader2, Server } from 'lucide-react';

interface TextAnalyzerProps {
  onStressUpdate: (score: number) => void;
}

export function TextAnalyzer({ onStressUpdate }: TextAnalyzerProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { score: number, keywords: string[] }>(null);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!text) return;
    setLoading(true);
    setError('');

    try {
      console.log("🚀 Sending to Python...");
      
      const response = await fetch('http://127.0.0.1:5000/analyze_text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text })
      });

      const data = await response.json();
      console.log("✅ Result:", data);
      
      setResult({ score: data.score, keywords: data.keywords });
      onStressUpdate(data.score);

    } catch (err) {
      setError("Is the Python Server running? (Run 'python app.py')");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Enter a message to detect sentiment via Python NLP.</p>
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center gap-1">
          <Server className="w-3 h-3" /> Python Powered
        </span>
      </div>

      <div className="flex gap-2">
        <input 
          className="flex-1 border p-2 rounded-lg"
          placeholder="e.g. I am feeling very anxious about exams"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button 
          onClick={analyze} 
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} 
          Analyze
        </button>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {result && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
          <div className="font-semibold text-gray-700">Python Analysis Result:</div>
          <div>Calculated Stress Score: <span className="font-bold text-indigo-600">{result.score}%</span></div>
          <div className="text-sm text-gray-500 mt-1">
            Prediction Label: {result.keywords.join(", ") || "None"}
          </div>
        </div>
      )}
    </div>
  );
}
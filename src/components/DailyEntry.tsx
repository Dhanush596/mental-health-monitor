import { useState } from 'react';
import { Save, Activity, Moon, Monitor, Users, BookOpen, CheckCircle, Server } from 'lucide-react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

interface DailyEntryProps {
  userId: string;
  onEntryComplete: () => void;
}

export function DailyEntry({ userId, onEntryComplete }: DailyEntryProps) {
  const [formData, setFormData] = useState({
    sleep: 7,
    study: 4,
    screen: 5,
    social: 2,
    activity: 1
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. SEND DATA TO PYTHON AI
      console.log("🚀 Sending metrics to Python for analysis...");
      
      const response = await fetch('http://127.0.0.1:5000/predict_daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error("Python Server not responding");
      }

      const data = await response.json();
      const { stressScore, stressLevel } = data;
      
      console.log(`✅ AI Predicted: ${stressScore}% (${stressLevel})`);

      // 2. GENERATE REAL TIMESTAMP
      const now = new Date();
      const timeLabel = now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      // 3. SAVE TO FIREBASE
      const newEntry = {
        day: timeLabel,
        sleepHours: Number(formData.sleep),
        studyHours: Number(formData.study),
        screenTime: Number(formData.screen),
        socialHours: Number(formData.social),
        physicalActivity: Number(formData.activity),
        stressScore: stressScore,
        stressLevel: stressLevel
      };

      const userRef = doc(db, "students", userId);
      await updateDoc(userRef, {
        history: arrayUnion(newEntry)
      });
      
      setSuccess(true);
      setTimeout(() => {
        onEntryComplete();
      }, 1500);

    } catch (error) {
      console.error("Error:", error);
      alert("Failed to calculate. Is Python app.py running?");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center animate-fade-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Entry Logged!</h3>
        <p className="text-gray-500 mt-2">Recorded at {new Date().toLocaleTimeString()}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📝 Live Check-in</h2>
          <p className="text-gray-500">Record your current status. AI will analyze it in real-time.</p>
        </div>
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center gap-1">
          <Server className="w-3 h-3" /> Python AI Connected
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Moon className="w-4 h-4 text-indigo-500" /> Sleep (Hours)
            </label>
            <input type="number" step="0.5" min="0" max="24" required className="w-full p-3 border rounded-lg" value={formData.sleep} onChange={e => setFormData({...formData, sleep: Number(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <BookOpen className="w-4 h-4 text-indigo-500" /> Study (Hours)
            </label>
            <input type="number" step="0.5" min="0" max="24" required className="w-full p-3 border rounded-lg" value={formData.study} onChange={e => setFormData({...formData, study: Number(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Monitor className="w-4 h-4 text-indigo-500" /> Screen Time (Hours)
            </label>
            <input type="number" step="0.5" min="0" max="24" required className="w-full p-3 border rounded-lg" value={formData.screen} onChange={e => setFormData({...formData, screen: Number(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Activity className="w-4 h-4 text-indigo-500" /> Activity (Hours)
            </label>
            <input type="number" step="0.5" min="0" max="24" required className="w-full p-3 border rounded-lg" value={formData.activity} onChange={e => setFormData({...formData, activity: Number(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Users className="w-4 h-4 text-indigo-500" /> Social (Hours)
            </label>
            <input type="number" step="0.5" min="0" max="24" required className="w-full p-3 border rounded-lg" value={formData.social} onChange={e => setFormData({...formData, social: Number(e.target.value)})} />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70">
          {loading ? 'AI Calculating...' : 'Calculate Stress & Save'}
          {!loading && <Save className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
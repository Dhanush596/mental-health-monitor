import { useState } from 'react';
import { Save, Activity, Moon, Monitor, Users, BookOpen, CheckCircle, Server } from 'lucide-react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

interface DailyEntryProps {
  userId: string;
  onEntryComplete: () => void;
}

// We use empty strings so the inputs start blank (the "vanish" effect)
const INITIAL_FORM_STATE = {
  sleep: '',
  study: '',
  screen: '',
  social: '',
  activity: ''
};

export function DailyEntry({ userId, onEntryComplete }: DailyEntryProps) {
  const [formData, setFormData] = useState<any>(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. SEND DATA TO PYTHON AI
      // Note: We convert the strings to Numbers here for the AI
      const payload = {
        sleep: Number(formData.sleep),
        study: Number(formData.study),
        screen: Number(formData.screen),
        social: Number(formData.social),
        activity: Number(formData.activity)
      };

      const response = await fetch('http://127.0.0.1:5000/predict_daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Python Server not responding");

      const data = await response.json();
      const { stressScore, stressLevel } = data;
      
      const now = new Date();
      const timeLabel = now.toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
      });

      // 2. SAVE TO FIREBASE
      const newEntry = {
        day: timeLabel,
        sleepHours: payload.sleep,
        studyHours: payload.study,
        screenTime: payload.screen,
        socialHours: payload.social,
        physicalActivity: payload.activity,
        stressScore: stressScore,
        stressLevel: stressLevel
      };

      const userRef = doc(db, "students", userId);
      await updateDoc(userRef, {
        history: arrayUnion(newEntry)
      });
      
      setSuccess(true);
      setFormData(INITIAL_FORM_STATE); // Resets to blank strings

      setTimeout(() => {
        setSuccess(false);
        onEntryComplete();
      }, 1500);

    } catch (error) {
      console.error("Error:", error);
      alert("Failed to calculate. Is Python app.py running?");
    } finally {
      setLoading(false);
    }
  };

  // Helper to clear the field specifically when focused if it contains a 0
  const handleFocus = (field: string) => {
    if (formData[field] === 0 || formData[field] === '0') {
      setFormData({ ...formData, [field]: '' });
    }
  };

  if (success) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center animate-fade-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Entry Logged!</h3>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📝 Live Check-in</h2>
          <p className="text-gray-500">Record your status. AI analyzes in real-time.</p>
        </div>
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center gap-1">
          <Server className="w-3 h-3" /> Python AI Connected
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SLEEP */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Moon className="w-4 h-4 text-indigo-500" /> Sleep (Hours)
            </label>
            <input 
              type="number" step="0.5" min="0" required 
              placeholder="e.g. 7"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={formData.sleep} 
              onFocus={() => handleFocus('sleep')}
              onChange={e => setFormData({...formData, sleep: e.target.value})} 
            />
          </div>

          {/* STUDY */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <BookOpen className="w-4 h-4 text-indigo-500" /> Study (Hours)
            </label>
            <input 
              type="number" step="0.5" min="0" required 
              placeholder="e.g. 4"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={formData.study} 
              onFocus={() => handleFocus('study')}
              onChange={e => setFormData({...formData, study: e.target.value})} 
            />
          </div>

          {/* SCREEN */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Monitor className="w-4 h-4 text-indigo-500" /> Screen Time (Hours)
            </label>
            <input 
              type="number" step="0.5" min="0" required 
              placeholder="e.g. 5"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={formData.screen} 
              onFocus={() => handleFocus('screen')}
              onChange={e => setFormData({...formData, screen: e.target.value})} 
            />
          </div>

          {/* ACTIVITY */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Activity className="w-4 h-4 text-indigo-500" /> Activity (Hours)
            </label>
            <input 
              type="number" step="0.5" min="0" required 
              placeholder="e.g. 1"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={formData.activity} 
              onFocus={() => handleFocus('activity')}
              onChange={e => setFormData({...formData, activity: e.target.value})} 
            />
          </div>

          {/* SOCIAL */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Users className="w-4 h-4 text-indigo-500" /> Social (Hours)
            </label>
            <input 
              type="number" step="0.5" min="0" required 
              placeholder="e.g. 2"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={formData.social} 
              onFocus={() => handleFocus('social')}
              onChange={e => setFormData({...formData, social: e.target.value})} 
            />
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
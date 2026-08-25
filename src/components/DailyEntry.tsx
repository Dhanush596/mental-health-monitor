import { useState } from 'react';
import { Save, Activity, Moon, Monitor, Users, BookOpen, Server, Edit2, Trash2, CalendarCheck, X } from 'lucide-react';
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { api } from '../api/client';
import type { DailyMetricsPayload, StressEntry } from '../types';

interface DailyEntryProps {
  userId: string;
  history: StressEntry[];
  onEntryComplete: () => void;
}

const INITIAL_FORM_STATE = {
  sleep: '',
  study: '',
  screen: '',
  social: '',
  activity: ''
};

export function DailyEntry({ userId, history, onEntryComplete }: DailyEntryProps) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  
  // Track if we are editing a past entry (stores the array index)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Check if they already submitted today (looks for today's date string like "Mar 23")
  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const hasCompletedToday = history.some(entry => entry.day.startsWith(todayStr));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: DailyMetricsPayload = {
        sleepHours: Number(formData.sleep),
        studyHours: Number(formData.study),
        screenTime: Number(formData.screen),
        socialHours: Number(formData.social),
        physicalActivity: Number(formData.activity)
      };

      // Recalculate stress score via Python AI
      const aiData = await api.predictDaily(payload);
      const finalScore = aiData.score ?? 50;
      const finalLevel = aiData.level ?? "Moderate";

      const userRef = doc(db, "students", userId);

      if (editingIndex !== null) {
        // UPDATE EXISTING ENTRY
        const updatedHistory = [...history];
        updatedHistory[editingIndex] = {
          ...updatedHistory[editingIndex],
          sleepHours: payload.sleepHours,
          studyHours: payload.studyHours,
          screenTime: payload.screenTime,
          socialHours: payload.socialHours,
          physicalActivity: payload.physicalActivity,
          stressScore: finalScore,
          stressLevel: finalLevel,
        };
        
        await updateDoc(userRef, { history: updatedHistory });
        setEditingIndex(null);
      } else {
        // CREATE NEW ENTRY
        const now = new Date();
        const timeLabel = now.toLocaleString('en-US', {
          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
        });

        const newEntry: StressEntry = {
          day: timeLabel,
          sleepHours: payload.sleepHours,
          studyHours: payload.studyHours,
          screenTime: payload.screenTime,
          socialHours: payload.socialHours,
          physicalActivity: payload.physicalActivity,
          stressScore: finalScore,
          stressLevel: finalLevel,
          note: null
        };

        await setDoc(userRef, { history: arrayUnion(newEntry) }, { merge: true });
      }
      
      setFormData(INITIAL_FORM_STATE);
      onEntryComplete(); // Refreshes App.tsx data

    } catch (error: any) {
      console.error("Error:", error);
      alert(`Failed to calculate: ${error.message || "Is Python app.py running?"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index: number) => {
    const entry = history[index];
    setFormData({
      sleep: entry.sleepHours.toString(),
      study: entry.studyHours.toString(),
      screen: entry.screenTime.toString(),
      social: entry.socialHours.toString(),
      activity: entry.physicalActivity.toString(),
    });
    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (index: number) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    
    try {
      const updatedHistory = [...history];
      updatedHistory.splice(index, 1); // Remove the item
      
      const userRef = doc(db, "students", userId);
      await updateDoc(userRef, { history: updatedHistory });
      onEntryComplete();
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleFocus = (field: keyof typeof INITIAL_FORM_STATE) => {
    if (formData[field] === '0' || formData[field] === 0 as any) {
      setFormData({ ...formData, [field]: '' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      
      {/* CONDITIONAL RENDER: Show "Completed" message OR the Form */}
      {hasCompletedToday && editingIndex === null ? (
        <div className="bg-white dark:bg-gray-800 p-10 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center flex flex-col items-center justify-center transition-colors">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
            <CalendarCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">You're all set for today!</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            You have successfully completed your daily wellness check-in. Take some time to relax, and we will see you back here tomorrow.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors relative">
          
          {editingIndex !== null && (
            <button 
              onClick={() => { setEditingIndex(null); setFormData(INITIAL_FORM_STATE); }}
              className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 hover:text-red-500 transition-colors"
              title="Cancel Edit"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="mb-8 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                {editingIndex !== null ? <Edit2 className="w-6 h-6 text-indigo-500" /> : '📝 Live Check-in'}
                {editingIndex !== null ? `Editing Entry: ${history[editingIndex].day}` : ''}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {editingIndex !== null ? "Update your metrics. AI will recalculate your score." : "Record your status. AI analyzes in real-time."}
              </p>
            </div>
            {editingIndex === null && (
              <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-2 py-1 rounded flex items-center gap-1">
                <Server className="w-3 h-3" /> Python AI Connected
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SLEEP */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Moon className="w-4 h-4 text-indigo-500" /> Sleep (Hours)
                </label>
                <input 
                  type="number" step="0.5" min="0" required 
                  placeholder="e.g. 7"
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-colors" 
                  value={formData.sleep} 
                  onFocus={() => handleFocus('sleep')}
                  onChange={e => setFormData({...formData, sleep: e.target.value})} 
                />
              </div>

              {/* STUDY */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <BookOpen className="w-4 h-4 text-indigo-500" /> Study (Hours)
                </label>
                <input 
                  type="number" step="0.5" min="0" required 
                  placeholder="e.g. 4"
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-colors" 
                  value={formData.study} 
                  onFocus={() => handleFocus('study')}
                  onChange={e => setFormData({...formData, study: e.target.value})} 
                />
              </div>

              {/* SCREEN */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Monitor className="w-4 h-4 text-indigo-500" /> Screen Time (Hours)
                </label>
                <input 
                  type="number" step="0.5" min="0" required 
                  placeholder="e.g. 5"
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-colors" 
                  value={formData.screen} 
                  onFocus={() => handleFocus('screen')}
                  onChange={e => setFormData({...formData, screen: e.target.value})} 
                />
              </div>

              {/* ACTIVITY */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Activity className="w-4 h-4 text-indigo-500" /> Activity (Hours)
                </label>
                <input 
                  type="number" step="0.5" min="0" required 
                  placeholder="e.g. 1"
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-colors" 
                  value={formData.activity} 
                  onFocus={() => handleFocus('activity')}
                  onChange={e => setFormData({...formData, activity: e.target.value})} 
                />
              </div>

              {/* SOCIAL */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Users className="w-4 h-4 text-indigo-500" /> Social (Hours)
                </label>
                <input 
                  type="number" step="0.5" min="0" required 
                  placeholder="e.g. 2"
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-colors" 
                  value={formData.social} 
                  onFocus={() => handleFocus('social')}
                  onChange={e => setFormData({...formData, social: e.target.value})} 
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70">
              {loading ? 'AI Calculating...' : (editingIndex !== null ? 'Update Entry' : 'Calculate Stress & Save')}
              {!loading && <Save className="w-5 h-5" />}
            </button>
          </form>
        </div>
      )}

      {/* HISTORY LOG SECTION */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Entry History</h3>
          <div className="space-y-4">
            {/* We slice and reverse to show newest first, but map the original index for editing */}
            {history.slice().reverse().map((entry, mappedIndex) => {
              const originalIndex = history.length - 1 - mappedIndex;
              return (
                <div key={originalIndex} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 transition-colors">
                  <div className="mb-4 sm:mb-0">
                    <p className="font-bold text-gray-800 dark:text-gray-200">{entry.day}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Stress Score: {entry.stressScore}%</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        entry.stressLevel === 'High' || entry.stressLevel === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        entry.stressLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {entry.stressLevel}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => handleEdit(originalIndex)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-sm font-bold"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(originalIndex)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm font-bold"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
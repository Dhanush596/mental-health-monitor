import { useState, useEffect } from 'react';
import { Activity, LogOut, Calendar } from 'lucide-react'; // Added Calendar icon
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import { StressLevelIndicator } from './components/StressLevelIndicator';
import { TextAnalyzer } from './components/TextAnalyzer';
import { SpeechAnalyzer } from './components/SpeechAnalyzer';
import { WearableData } from './components/WearableData';
// Removed TrendsChart to hide raw dataset details
import { WellnessRadar } from './components/WellnessRadar';
import { Recommendations } from './components/Recommendations';
import { AlertSystem } from './components/AlertSystem';
import { Auth } from './components/Auth';
import { CsvUpload } from './components/CsvUpload';
import { DailyEntry } from './components/DailyEntry';
import { defaultHistory } from './dataset';

function App() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dayIndex, setDayIndex] = useState(0);
  const [customStressScore, setCustomStressScore] = useState<number | null>(null);

  const refreshData = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, "students", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
        const newHistory = docSnap.data().history || [];
        setDayIndex(newHistory.length - 1);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, "students", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
            const hist = docSnap.data().history || [];
            if (hist.length > 0) setDayIndex(hist.length - 1);
          } else {
            setUserData({ name: "Student", history: defaultHistory });
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
    setUserData(null);
    setCustomStressScore(null);
    setActiveTab('dashboard');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-600 font-bold">Connecting...</div>;
  if (!user) return <Auth onLogin={() => {}} />;

  const history = userData?.history || defaultHistory;
  const safeDayIndex = Math.min(dayIndex, history.length - 1);
  const currentDayData = history[safeDayIndex] || history[0];
  const displayScore = customStressScore !== null ? customStressScore : currentDayData.stressScore;

  const handleLiveAnalysis = (newScore: number) => {
    setCustomStressScore(newScore);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-md">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 hidden md:block">Student Wellness Monitor</h1>
              <p className="text-xs text-gray-500 hidden md:block">AI-Powered Analytics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <CsvUpload userId={user.uid} onUploadComplete={refreshData} />
            
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900">{userData?.name || "Student"}</div>
              <div className="text-xs text-green-600 font-bold">● Cloud Active</div>
            </div>
            
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* TABS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 flex gap-2 mb-6 overflow-x-auto">
          <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-3 px-4 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md transform scale-[1.02]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>📊 Command Center</button>
          <button onClick={() => setActiveTab('entry')} className={`flex-1 py-3 px-4 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${activeTab === 'entry' ? 'bg-indigo-600 text-white shadow-md transform scale-[1.02]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>📝 Daily Check-in</button>
          <button onClick={() => setActiveTab('text')} className={`flex-1 py-3 px-4 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${activeTab === 'text' ? 'bg-indigo-600 text-white shadow-md transform scale-[1.02]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>💬 Text Analysis</button>
          <button onClick={() => setActiveTab('speech')} className={`flex-1 py-3 px-4 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${activeTab === 'speech' ? 'bg-indigo-600 text-white shadow-md transform scale-[1.02]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>🎙️ Speech Analysis</button>
        </div>

        {/* --- DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <>
            {/* CLEANER TIMELINE (No "Record X/Y" text) */}
            {history.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 transition-all hover:shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                     <div className="bg-indigo-50 p-2 rounded-lg">
                       <Calendar className="w-5 h-5 text-indigo-600" />
                     </div>
                     <div>
                       <h2 className="text-lg font-bold text-gray-800">Your Journey</h2>
                       <div className="text-sm text-indigo-600 font-bold">{currentDayData.day}</div>
                     </div>
                  </div>
                  
                  <span className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm ${
                       displayScore > 70 ? 'bg-red-50 text-red-700 border border-red-100' : 
                       displayScore > 40 ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 'bg-green-50 text-green-700 border border-green-100'
                     }`}>
                       {displayScore > 70 ? 'High Stress' : displayScore > 40 ? 'Moderate Stress' : 'Low Stress'}
                  </span>
                </div>
                
                <input 
                  type="range" 
                  min="0" 
                  max={history.length - 1} 
                  value={safeDayIndex} 
                  onChange={(e) => { 
                    setDayIndex(parseInt(e.target.value)); 
                    setCustomStressScore(null); 
                  }} 
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto md:h-[380px]">
                   <WellnessRadar currentDay={currentDayData} />
                   
                   <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                      <h3 className="font-bold text-gray-800 mb-4 z-10">Real-Time Threat Level</h3>
                      <StressLevelIndicator stressLevel={displayScore} />
                      <div className="mt-4 z-10 w-full">
                        <AlertSystem stressLevel={displayScore} />
                      </div>
                      <div className={`absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-5 ${
                        displayScore > 70 ? 'bg-red-500' : 'bg-green-500'
                      }`}></div>
                   </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                   <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                     <Activity className="w-5 h-5 text-indigo-600" />
                     Physiological Telemetry
                   </h3>
                   <WearableData currentDay={currentDayData} />
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <Recommendations stressLevel={displayScore} />
                </div>
              </div>

            </div>
          </>
        )}

        {/* --- OTHER TABS --- */}
        {activeTab === 'entry' && <DailyEntry userId={user.uid} onEntryComplete={() => { refreshData(); setActiveTab('dashboard'); }} />}
        {activeTab === 'text' && <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-lg"><h2 className="text-2xl font-bold text-gray-800 mb-2">NLP Sentiment Analysis</h2><p className="text-gray-500 mb-6">Uses Python & Scikit-Learn.</p><TextAnalyzer onStressUpdate={handleLiveAnalysis} /></div>}
        {activeTab === 'speech' && <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-lg"><h2 className="text-2xl font-bold text-gray-800 mb-2">Voice Tone Analyzer</h2><p className="text-gray-500 mb-6">Analyzes pitch and frequency.</p><SpeechAnalyzer onStressUpdate={handleLiveAnalysis} /></div>}

      </main>
    </div>
  );
}

export default App;
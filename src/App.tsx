import { useState, useEffect } from 'react';
import { Activity, LogOut } from 'lucide-react';
import { auth, db } from './firebase'; // Import Firebase
import { doc, getDoc } from 'firebase/firestore'; // Import Database tools
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Import Auth tools

import { StressLevelIndicator } from './components/StressLevelIndicator';
import { TextAnalyzer } from './components/TextAnalyzer';
import { SpeechAnalyzer } from './components/SpeechAnalyzer';
import { WearableData } from './components/WearableData';
import { TrendsChart } from './components/TrendsChart';
import { Recommendations } from './components/Recommendations';
import { AlertSystem } from './components/AlertSystem';
import { Auth } from './components/Auth';
import { defaultHistory } from './dataset'; // Fallback data

function App() {
  const [user, setUser] = useState<any>(null);      // The Auth User (Email/UID)
  const [userData, setUserData] = useState<any>(null); // The Database Data (Name, History)
  const [loading, setLoading] = useState(true);     // Is it loading?
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dayIndex, setDayIndex] = useState(0);
  const [customStressScore, setCustomStressScore] = useState<number | null>(null);

  // 1. LISTEN FOR LOGIN STATUS (This runs once when app starts)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // If logged in, fetch their specific data from Firestore
        try {
          const docRef = doc(db, "students", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.log("No document found, using default");
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
    signOut(auth); // Tell Firebase to log out
  };

  // While checking login status, show a spinner
  if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-600 font-bold">Connecting to Secure Server...</div>;

  // If not logged in, show Auth screen
  if (!user) return <Auth onLogin={() => {}} />;

  // Prepare Data for Render
  const history = userData?.history || defaultHistory;
  const currentDayData = history[dayIndex] || history[0];
  const displayScore = customStressScore !== null ? customStressScore : currentDayData.stressScore;

  const handleLiveAnalysis = (newScore: number) => {
    setCustomStressScore(newScore);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Student Wellness Monitor</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900">{userData?.name || "Student"}</div>
              <div className="text-xs text-green-600 font-bold">● Cloud Connected</div>
            </div>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {history.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Historical Data Review</h2>
                <p className="text-sm text-gray-500">Scrub through the 20-day dataset stored in cloud.</p>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Viewing Record</span>
                <div className="text-2xl font-bold text-indigo-600">{currentDayData.day}</div>
              </div>
            </div>
            <input type="range" min="0" max={history.length - 1} value={dayIndex} onChange={(e) => { setDayIndex(parseInt(e.target.value)); setCustomStressScore(null); }} className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px]">
                     {activeTab === 'dashboard' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-4">Current Stress Assessment</h3>
                                <AlertSystem stressLevel={displayScore} />
                            </div>
                            <div className="flex justify-center">
                                <StressLevelIndicator stressLevel={displayScore} />
                            </div>
                        </div>
                     )}
                     {activeTab === 'text' && <TextAnalyzer onStressUpdate={handleLiveAnalysis} />}
                     {activeTab === 'speech' && <SpeechAnalyzer onStressUpdate={handleLiveAnalysis} />}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                   <h3 className="font-bold text-gray-800 mb-4">Physiological Logs</h3>
                   <WearableData currentDay={currentDayData} />
                </div>
                
                <TrendsChart />
            </div>
            <div className="lg:col-span-1">
                <Recommendations stressLevel={displayScore} />
            </div>
        </div>
      </main>
    </div>
  );
}

export default App;
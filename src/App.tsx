import { useState, useEffect } from 'react';
import { Activity, LogOut, Calendar, Download, Moon, Sun, TrendingUp } from 'lucide-react';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import LoadingBar from 'react-top-loading-bar';
import { generatePDF } from './utils/pdfExport';

import { StressLevelIndicator } from './components/StressLevelIndicator';
import { TextAnalyzer } from './components/TextAnalyzer';
import { WearableData } from './components/WearableData';
import { WellnessRadar } from './components/WellnessRadar';
import { Recommendations } from './components/Recommendations';
import { AlertSystem } from './components/AlertSystem';
import { Auth } from './components/Auth';
import { DailyEntry } from './components/DailyEntry';
import { defaultHistory } from './dataset';

function App() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dayIndex, setDayIndex] = useState(0);
  const [customStressScore, setCustomStressScore] = useState<number | null>(null);
  
  // Progress & PDF State
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Apply Dark Mode Class to HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const refreshData = async () => {
    if (!user) return;
    setProgress(30);
    try {
      const docRef = doc(db, "students", user.uid);
      const docSnap = await getDoc(docRef);
      setProgress(70);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
        const newHistory = docSnap.data().history || [];
        setDayIndex(newHistory.length - 1);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
    setProgress(100);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setProgress(20);
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, "students", currentUser.uid);
          const docSnap = await getDoc(docRef);
          setProgress(60);
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
      setProgress(100);
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

  const handleExport = async () => {
    setProgress(30);
    setIsExporting(true);
    setProgress(70);
    await generatePDF('dashboard-content', 'My_Wellness_Report');
    setProgress(100);
    setIsExporting(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-600 font-bold dark:bg-gray-900">Connecting...</div>;
  if (!user) return <Auth onLogin={() => {}} />;

  const history = userData?.history || defaultHistory;
  const safeDayIndex = Math.min(dayIndex, history.length - 1);
  const currentDayData = history[safeDayIndex] || history[0];
  const displayScore = customStressScore !== null ? customStressScore : currentDayData.stressScore;

  const handleLiveAnalysis = (newScore: number) => {
    setCustomStressScore(newScore);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10 font-sans relative transition-colors duration-300">
      
      <LoadingBar 
        color="#4f46e5" 
        progress={progress} 
        onLoaderFinished={() => setProgress(0)} 
        height={4} 
      />

      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-md">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden md:block transition-colors">Student Wellness Monitor</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">AI-Powered Analytics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 dark:text-gray-400 rounded-lg transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
            </button>

            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50 shadow-sm border border-indigo-100 dark:border-indigo-800"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Generating Report...' : 'Download PDF'}
            </button>
            
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{userData?.name || "Student"}</div>
              <div className="text-xs text-green-600 dark:text-green-400 font-bold">● Cloud Active</div>
            </div>
            
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 flex gap-2 mb-6 overflow-x-auto transition-colors">
          <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-3 px-4 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md transform scale-[1.02]' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>📊 Command Center</button>
          <button onClick={() => setActiveTab('entry')} className={`flex-1 py-3 px-4 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${activeTab === 'entry' ? 'bg-indigo-600 text-white shadow-md transform scale-[1.02]' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>📝 Daily Check-in</button>
          <button onClick={() => setActiveTab('text')} className={`flex-1 py-3 px-4 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${activeTab === 'text' ? 'bg-indigo-600 text-white shadow-md transform scale-[1.02]' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>💬 Text Analysis</button>
        </div>

        {activeTab === 'dashboard' && (
          <div id="dashboard-content" className="w-full">
            
            {history.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-all hover:shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                     <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg">
                       <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                     </div>
                     <div>
                       <h2 className="text-lg font-bold text-gray-800 dark:text-white transition-colors">Your Journey</h2>
                       <div className="text-sm text-indigo-600 dark:text-indigo-400 font-bold">
                         {customStressScore !== null ? "🔴 Live Analysis Result" : currentDayData.day}
                       </div>
                     </div>
                  </div>
                  
                  <span className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors ${
                       displayScore > 70 ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800' : 
                       displayScore > 30 ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-800' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800'
                     }`}>
                       {displayScore > 70 ? 'High Stress' : displayScore > 30 ? 'Moderate Stress' : 'Low Stress'}
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
                  className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto md:h-[380px]">
                   <WellnessRadar currentDay={currentDayData} />
                   
                   <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center relative overflow-hidden transition-colors">
                      <h3 className="font-bold text-gray-800 dark:text-white mb-4 z-10">Real-Time Threat Level</h3>
                      <StressLevelIndicator stressLevel={displayScore} />
                      <div className="mt-4 z-10 w-full">
                        <AlertSystem stressLevel={displayScore} />
                      </div>
                      <div className={`absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-5 dark:opacity-10 ${
                        displayScore > 70 ? 'bg-red-500' : 'bg-green-500'
                      }`}></div>
                   </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                   <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                     <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                     Physiological Telemetry
                   </h3>
                   <WearableData currentDay={currentDayData} />
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  
                  <Recommendations stressLevel={displayScore} />
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      7-Day Trend
                    </h3>
                    
                    <div className="flex items-end justify-between h-32 gap-2">
                      {history.slice(-7).map((entry: any, i: number) => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-gray-500 dark:text-gray-400 absolute -mt-6">
                            {entry.stressScore}%
                          </span>
                          
                          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-md flex items-end h-[80%] overflow-hidden relative">
                            <div 
                              className={`w-full transition-all duration-700 ${
                                entry.stressScore > 70 ? 'bg-red-400 dark:bg-red-500' : 
                                entry.stressScore > 30 ? 'bg-yellow-400 dark:bg-yellow-500' : 'bg-green-400 dark:bg-green-500'
                              }`}
                              style={{ height: `${entry.stressScore}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                      Stress levels over your recent check-ins
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'entry' && <DailyEntry userId={user.uid} history={history} onEntryComplete={() => { refreshData(); setActiveTab('dashboard'); }} />}
        
        {/* WE PASS THE USER.UID DOWN HERE SO FIREBASE SAVES THE CHAT */}
        {activeTab === 'text' && (
          <div className="max-w-2xl mx-auto">
            <TextAnalyzer userId={user.uid} onStressUpdate={handleLiveAnalysis} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
import { useState, useEffect, useRef } from 'react';
import { Send, Bot, Trash2, MessageSquare, Sparkles, RefreshCw } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase'; 

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  nlpScore?: number;
  nlpSentiment?: string;
}

interface ChatSession {
  id: string;
  date: string;
  title: string;
  messages: Message[];
}

interface TextAnalyzerProps {
  userId: string;
  onStressUpdate: (score: number) => void;
}

export function TextAnalyzer({ userId, onStressUpdate }: TextAnalyzerProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load from Firebase
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const docRef = doc(db, "student_chats", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().sessions) {
          setSessions(docSnap.data().sessions);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    if (userId) fetchChats();
  }, [userId]);

  // Save to Firebase
  const saveToFirebase = async (updatedSessions: ChatSession[]) => {
    try {
      const docRef = doc(db, "student_chats", userId);
      await setDoc(docRef, { sessions: updatedSessions }, { merge: true });
    } catch (error) {
      console.error("Error saving chat:", error);
    }
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId]);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  const createNewSession = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      title: 'New Therapy Session',
      messages: [{ 
        id: '1', 
        sender: 'ai', 
        text: "Hi there. I'm your AI wellness companion. This is a safe space to talk about whatever is on your mind today." 
      }]
    };
    
    const updated = [newSession, ...sessions];
    setSessions(updated);
    setActiveSessionId(newId);
    saveToFirebase(updated);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation forever?')) {
      const updated = sessions.filter(s => s.id !== id);
      setSessions(updated);
      saveToFirebase(updated);
      if (activeSessionId === id) setActiveSessionId(null);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
    };

    let currentSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        const title = s.messages.length === 1 ? inputText.slice(0, 30) + '...' : s.title;
        return { ...s, title, messages: [...s.messages, userMessage] };
      }
      return s;
    });
    setSessions(currentSessions);
    setInputText('');
    setIsTyping(true);

    try {
      // Clean the API key to remove any hidden spaces or newlines
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim(); 
      
      if (!apiKey) {
        throw new Error("API Key missing! Add VITE_GEMINI_API_KEY to your .env file.");
      }

      const prompt = `
        You are an empathetic, human-like therapy assistant for an MCA college student. 
        Analyze this user message: "${userMessage.text}"
        
        Respond ONLY with a valid JSON object containing exactly three keys:
        1. "reply": Your empathetic, conversational response (2-3 sentences max. Do NOT sound robotic).
        2. "stress_score": An integer from 10 to 95 indicating their stress level based on the text.
        3. "sentiment": A 1-2 word string like "Anxious", "Calm", "Overwhelmed", "Happy".
      `;

      // Use the modern gemini-3.5-flash endpoint
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      
      if (!data || !data.candidates || data.candidates.length === 0) {
        console.error("Google API Error:", data);
        throw new Error("Invalid response from Google Gemini API. Check your API key or model name.");
      }

      const aiTextResponse = data.candidates[0].content.parts[0].text;
      const cleanJsonStr = aiTextResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const aiData = JSON.parse(cleanJsonStr);

      // Apply the AI's raw data to our UI
      const nlpScore = aiData.stress_score;
      const sentiment = aiData.sentiment;
      
      onStressUpdate(nlpScore); // Updates the Dashboard Dial
      userMessage.nlpScore = nlpScore;
      userMessage.nlpSentiment = sentiment;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiData.reply, // The dynamically generated human-like reply!
      };

      // Save to state and Firebase
      const finalSessions = currentSessions.map(s => 
        s.id === activeSessionId 
          ? { ...s, messages: [...s.messages, aiMessage] } 
          : s
      );
      
      setSessions(finalSessions);
      saveToFirebase(finalSessions);

    } catch (error: any) {
      console.error("AI Generation Error:", error);
      // SAFE FALLBACK: If anything breaks, the app stays alive and shows this.
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `I'm having a little trouble connecting to my AI network right now, but I'm still here for you. (Error: ${error.message})`,
      };
      const fallbackSessions = currentSessions.map(s => 
        s.id === activeSessionId ? { ...s, messages: [...s.messages, fallbackMessage] } : s
      );
      setSessions(fallbackSessions);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* TOP: ACTIVE CHAT WINDOW */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden transition-colors flex flex-col h-[550px]">
        
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-200" />
            <div>
              <h2 className="font-bold text-lg leading-tight">Therapy Space</h2>
              <p className="text-xs text-indigo-200">Real-time Generative AI Analysis</p>
            </div>
          </div>
          {activeSessionId ? (
            <button onClick={() => setActiveSessionId(null)} className="text-xs bg-indigo-700 hover:bg-indigo-800 px-3 py-1.5 rounded-lg transition-colors font-bold">
              Close Chat
            </button>
          ) : (
            <button onClick={createNewSession} className="text-xs bg-white text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors font-bold flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> New Session
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 transition-colors">
          {!activeSessionId ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 space-y-4">
              <Bot className="w-16 h-16 text-gray-300 dark:text-gray-600" />
              <p>Select a chat from your history below or start a new one.</p>
              <button onClick={createNewSession} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md">
                Start Talking
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                  }`}>
                    
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    
                    {msg.sender === 'user' && msg.nlpScore !== undefined && (
                      <div className="mt-3 inline-block bg-indigo-800/60 rounded px-2 py-1 border border-indigo-400/30">
                        <span className="text-[10px] font-mono text-indigo-100 flex items-center gap-1">
                          🔍 Generative NLP: {msg.nlpSentiment} ({msg.nlpScore}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">AI is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {activeSessionId && (
          <form onSubmit={handleSend} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type how you're feeling..."
                disabled={isTyping}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-none rounded-xl p-3 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={isTyping || !inputText.trim()}
                className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* BOTTOM: CHAT HISTORY LOG */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
          Cloud History
        </h3>
        
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No chat history yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map(session => (
              <div 
                key={session.id} 
                onClick={() => setActiveSessionId(session.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  activeSessionId === session.id 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-sm text-gray-800 dark:text-gray-200 truncate pr-4">
                    "{session.title}"
                  </div>
                  <button 
                    onClick={(e) => deleteSession(session.id, e)}
                    className="text-gray-400 hover:text-red-500 transition-colors z-10"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {session.date} • {session.messages.length} messages
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {activeSessionId === session.id ? 'Currently Active' : 'Click to Continue'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
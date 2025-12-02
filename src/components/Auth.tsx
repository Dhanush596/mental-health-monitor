import { useState } from 'react';
import { Activity, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { auth, db } from '../firebase'; // Import the file we just made
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { defaultHistory } from '../dataset'; // We will give new users this default data

interface AuthProps {
  onLogin: (user: any) => void;
}

export function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // 1. REAL CLOUD LOGIN
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onLogin(userCredential.user);
      } else {
        // 2. REAL CLOUD REGISTER
        // Create the account in Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create the user's profile in the Database
        // We use the User ID (uid) as the document name so it's unique
        await setDoc(doc(db, "students", user.uid), {
          name: name || "Student",
          email: user.email,
          history: defaultHistory // Save the 20-day CSV data to the cloud for this student
        });
        
        onLogin(user);
      }
    } catch (err: any) {
      // Show readable error messages
      console.error(err);
      if (err.code === 'auth/invalid-credential') setError("Incorrect email or password.");
      else if (err.code === 'auth/email-already-in-use') setError("This email is already registered.");
      else if (err.code === 'auth/weak-password') setError("Password must be at least 6 characters.");
      else setError("Failed to connect. Check your internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-8">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Cloud Portal' : 'Register Student'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {isLogin ? 'Securely access student records' : 'Create a new monitored profile'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Student Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg" required />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg" required />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg" required />
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-indigo-600 font-semibold hover:underline">
            {isLogin ? 'Register a new student' : 'Back to login'}
          </button>
        </div>
      </div>
    </div>
  );
}
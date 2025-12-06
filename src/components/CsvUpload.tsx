import { useState } from 'react';
import Papa from 'papaparse';
import { Upload, Check, Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface CsvUploadProps {
  userId: string;
  onUploadComplete: () => void;
}

export function CsvUpload({ userId, onUploadComplete }: CsvUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const formattedHistory = results.data.map((row: any, index: number) => {
            
            // 1. GENERATE DATE WITH TIME (for consistency)
            const d = new Date();
            d.setDate(d.getDate() - (results.data.length - index)); // Today minus X days
            // Returns: "Dec 6, 9:00 AM"
            const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ", 9:00 AM";

            // 2. ROBUST COLUMN MAPPING
            const studyHours = Number(row['study_hour'] || row['Study_Hours'] || 0);
            const sleepHours = Number(row['sleep_hour'] || row['Sleep_Hours'] || 0);
            const screenTime = Number(row['screen_time'] || row['Screen_Time'] || 0);
            const socialHours = Number(row['social_hours'] || row['Social_Hours'] || 0);
            const physicalActivity = Number(row['physical_activity'] || row['Physical_Activity'] || 0);
            
            const rawStressLevel = row['stress_level'] || row['Stress_Level'] || 'Medium';
            const rawStressScore = row['stress_score'] || row['Stress_Score'];

            // 3. SMART SCORE CALCULATION
            let finalScore = 50; 
            if (rawStressScore) {
              finalScore = Number(rawStressScore);
            } else {
              if (rawStressLevel === 'High' || rawStressLevel === 'high') finalScore = 85;
              else if (rawStressLevel === 'Low' || rawStressLevel === 'low') finalScore = 25;
            }

            return {
              day: dateLabel, // <--- SAVES THE DATE + TIME
              studyHours,
              sleepHours,
              screenTime,
              socialHours,
              physicalActivity,
              stressLevel: rawStressLevel,
              stressScore: finalScore
            };
          });

          // Save to Firebase
          const userRef = doc(db, "students", userId);
          await setDoc(userRef, {
            history: formattedHistory
          }, { merge: true });

          setSuccess(true);
          onUploadComplete();
          setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
          console.error("Error saving CSV:", error);
          alert("Failed to upload. Make sure you are logged in!");
        }
        setUploading(false);
      }
    });
  };

  return (
    <div className="relative inline-block">
      <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-upload" disabled={uploading} />
      <label htmlFor="csv-upload" className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all border ${success ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? <Check className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
        <span className="text-sm font-medium">{uploading ? 'Uploading...' : success ? 'Data Imported!' : 'Import CSV'}</span>
      </label>
    </div>
  );
}
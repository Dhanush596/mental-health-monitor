// Defines exactly what goes into Firebase
export interface StressEntry {
  day: string;
  sleepHours: number;
  studyHours: number;
  screenTime: number;
  socialHours: number;
  physicalActivity: number;
  stressScore: number;
  stressLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  note: string | null;
}

// Defines your User structure in Firebase
export interface UserData {
  name: string;
  history: StressEntry[];
}

// Defines what we send to the Python backend for Daily Check-ins
export interface DailyMetricsPayload {
  sleepHours: number;
  studyHours: number;
  screenTime: number;
  socialHours: number;
  physicalActivity: number;
}
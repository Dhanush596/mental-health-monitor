// Helper to generate past dates WITH TIME (e.g., "Nov 15, 9:00 AM")
const getPastDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  // Returns: "Dec 6, 9:00 AM"
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ", 9:00 AM";
};

// 20-day historical record with Consistent Time Format
export const studentHistory = [
  { day: getPastDate(20), studyHours: 2, sleepHours: 9, screenTime: 2, socialHours: 4, physicalActivity: 8, stressLevel: "Low", stressScore: 25 },
  { day: getPastDate(19), studyHours: 3, sleepHours: 8, screenTime: 3, socialHours: 5, physicalActivity: 7, stressLevel: "Low", stressScore: 25 },
  { day: getPastDate(18), studyHours: 6, sleepHours: 7, screenTime: 4, socialHours: 2, physicalActivity: 3, stressLevel: "Medium", stressScore: 50 },
  { day: getPastDate(17), studyHours: 8, sleepHours: 5, screenTime: 6, socialHours: 1, physicalActivity: 1, stressLevel: "High", stressScore: 85 },
  { day: getPastDate(16), studyHours: 1, sleepHours: 9, screenTime: 2, socialHours: 6, physicalActivity: 9, stressLevel: "Low", stressScore: 25 },
  { day: getPastDate(15), studyHours: 9, sleepHours: 4, screenTime: 8, socialHours: 0, physicalActivity: 1, stressLevel: "High", stressScore: 85 },
  { day: getPastDate(14), studyHours: 5, sleepHours: 7, screenTime: 3, socialHours: 3, physicalActivity: 4, stressLevel: "Medium", stressScore: 50 },
  { day: getPastDate(13), studyHours: 7, sleepHours: 6, screenTime: 5, socialHours: 2, physicalActivity: 2, stressLevel: "High", stressScore: 85 },
  { day: getPastDate(12), studyHours: 2, sleepHours: 8, screenTime: 2, socialHours: 5, physicalActivity: 8, stressLevel: "Low", stressScore: 25 },
  { day: getPastDate(11), studyHours: 8, sleepHours: 4, screenTime: 7, socialHours: 1, physicalActivity: 0, stressLevel: "High", stressScore: 85 },
  { day: getPastDate(10), studyHours: 4, sleepHours: 7, screenTime: 4, socialHours: 4, physicalActivity: 5, stressLevel: "Medium", stressScore: 50 },
  { day: getPastDate(9), studyHours: 3, sleepHours: 8, screenTime: 3, socialHours: 6, physicalActivity: 6, stressLevel: "Low", stressScore: 25 },
  { day: getPastDate(8), studyHours: 9, sleepHours: 3, screenTime: 9, socialHours: 0, physicalActivity: 1, stressLevel: "High", stressScore: 85 },
  { day: getPastDate(7), studyHours: 5, sleepHours: 6, screenTime: 4, socialHours: 3, physicalActivity: 3, stressLevel: "Medium", stressScore: 50 },
  { day: getPastDate(6), studyHours: 6, sleepHours: 6, screenTime: 5, socialHours: 2, physicalActivity: 4, stressLevel: "Medium", stressScore: 50 },
  { day: getPastDate(5), studyHours: 2, sleepHours: 9, screenTime: 1, socialHours: 5, physicalActivity: 9, stressLevel: "Low", stressScore: 25 },
  { day: getPastDate(4), studyHours: 10, sleepHours: 4, screenTime: 8, socialHours: 0, physicalActivity: 0, stressLevel: "High", stressScore: 85 },
  { day: getPastDate(3), studyHours: 4, sleepHours: 7, screenTime: 3, socialHours: 4, physicalActivity: 6, stressLevel: "Low", stressScore: 25 },
  { day: getPastDate(2), studyHours: 7, sleepHours: 5, screenTime: 6, socialHours: 1, physicalActivity: 2, stressLevel: "High", stressScore: 85 },
  { day: getPastDate(1), studyHours: 5, sleepHours: 7, screenTime: 4, socialHours: 3, physicalActivity: 5, stressLevel: "Medium", stressScore: 50 }
];

export const defaultHistory = studentHistory;
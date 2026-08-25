import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export function WellnessRadar({ currentDay }: { currentDay: any }) {
  const data = [
    { subject: 'Sleep (Hrs)', A: currentDay.sleepHours, fullMark: 12 },
    { subject: 'Study (Hrs)', A: currentDay.studyHours, fullMark: 12 },
    { subject: 'Screen (Hrs)', A: currentDay.screenTime, fullMark: 16 },
    { subject: 'Social (Hrs)', A: currentDay.socialHours, fullMark: 10 },
    { subject: 'Activity (Hrs)', A: currentDay.physicalActivity, fullMark: 5 },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col transition-colors">
      <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-center">Wellness Balance (24h)</h3>
      
      {/* FIX: Hardcoded height={300} stops the React DevTools Warning */}
      <div className="w-full">
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e5e7eb" className="dark:stroke-gray-600" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
            <Radar name="Student" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-xs text-center text-gray-400 mt-4">Target: A balanced, wide shape is ideal.</p>
    </div>
  );
}
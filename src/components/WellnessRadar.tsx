import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

interface WellnessRadarProps {
  currentDay: {
    studyHours: number;
    sleepHours: number;
    screenTime: number;
    socialHours: number;
    physicalActivity: number;
  };
}

export function WellnessRadar({ currentDay }: WellnessRadarProps) {
  // We transform the day's data into a format the Radar Chart understands
  const data = [
    { subject: 'Sleep (Hrs)', value: currentDay.sleepHours, fullMark: 12 },
    { subject: 'Study (Hrs)', value: currentDay.studyHours, fullMark: 12 },
    { subject: 'Screen (Hrs)', value: currentDay.screenTime, fullMark: 12 },
    { subject: 'Social (Hrs)', value: currentDay.socialHours, fullMark: 12 },
    { subject: 'Activity (Hrs)', value: currentDay.physicalActivity, fullMark: 12 },
  ];

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col justify-center">
      <h3 className="font-bold text-gray-800 mb-2 text-center">Wellness Balance (24h)</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 'bold' }} />
            <PolarRadiusAxis angle={30} domain={[0, 12]} tick={false} axisLine={false} />
            <Radar
              name="Hours"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={3}
              fill="#818cf8"
              fillOpacity={0.5}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-center text-gray-400 mt-2">
        Target: A balanced, wide shape is ideal.
      </p>
    </div>
  );
}
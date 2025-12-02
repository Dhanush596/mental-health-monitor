import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { studentHistory } from '../dataset';

export function TrendsChart() {
  return (
    <div className="h-80 w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-700 font-semibold">20-Day Stress vs. Study Correlation</h3>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={studentHistory}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} interval={1} />
          <YAxis yAxisId="left" orientation="left" stroke="#ef4444" label={{ value: 'Stress %', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" stroke="#6366f1" label={{ value: 'Hours', angle: 90, position: 'insideRight' }} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="stressScore" name="Stress Level" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', strokeWidth: 2 }} activeDot={{ r: 6 }} />
          <Line yAxisId="right" type="monotone" dataKey="studyHours" name="Study Hours" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
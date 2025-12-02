import { Activity, Moon, Monitor, Users } from 'lucide-react';

interface WearableDataProps {
  currentDay: {
    sleepHours: number;
    screenTime: number;
    physicalActivity: number;
    socialHours: number;
  }
}

export function WearableData({ currentDay }: WearableDataProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 transition-all duration-300">
        <div className="flex items-center gap-2 mb-2 text-indigo-700">
          <Moon className="w-5 h-5" />
          <span className="text-sm font-medium">Sleep</span>
        </div>
        <div className="text-2xl font-bold text-gray-800">{currentDay.sleepHours} <span className="text-sm font-normal text-gray-500">hrs</span></div>
      </div>

      <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 transition-all duration-300">
        <div className="flex items-center gap-2 mb-2 text-rose-700">
          <Monitor className="w-5 h-5" />
          <span className="text-sm font-medium">Screen Time</span>
        </div>
        <div className="text-2xl font-bold text-gray-800">{currentDay.screenTime} <span className="text-sm font-normal text-gray-500">hrs</span></div>
      </div>

      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 transition-all duration-300">
        <div className="flex items-center gap-2 mb-2 text-emerald-700">
          <Activity className="w-5 h-5" />
          <span className="text-sm font-medium">Activity</span>
        </div>
        <div className="text-2xl font-bold text-gray-800">{currentDay.physicalActivity} <span className="text-sm font-normal text-gray-500">hrs</span></div>
      </div>
      
       <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 transition-all duration-300">
        <div className="flex items-center gap-2 mb-2 text-amber-700">
          <Users className="w-5 h-5" />
          <span className="text-sm font-medium">Social</span>
        </div>
        <div className="text-2xl font-bold text-gray-800">{currentDay.socialHours} <span className="text-sm font-normal text-gray-500">hrs</span></div>
      </div>
    </div>
  );
}